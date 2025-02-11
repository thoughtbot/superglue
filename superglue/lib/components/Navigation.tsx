import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react'
import { urlToPageKey, pathWithoutBZParams, mergeQuery } from '../utils'
import { removePage, setActivePage, copyPage } from '../actions'
import {
  HistoryState,
  RootState,
  NavigateTo,
  NavigationContextProps,
  NavigationProviderProps,
  AllPages,
  SuperglueState,
} from '../types'
import { Update } from 'history'
import { useDispatch, useSelector, useStore } from 'react-redux'

const NavigationContext = createContext<NavigationContextProps>(
  {} as NavigationContextProps
)

const hasWindow = typeof window !== 'undefined'

const setWindowScroll = (posX: number, posY: number): void => {
  hasWindow && window.scrollTo(posX, posY)
}

const notFound = (identifier: string | undefined): never => {
  let reminder = ''
  if (!identifier) {
    reminder =
      'Did you forget to add `json.componentIdentifier` in your application.json.props layout?'
  }

  const error = new Error(
    `Superglue Nav component was looking for ${identifier} but could not find it in your mapping. ${reminder}`
  )

  throw error
}

const NavigationProvider = forwardRef(function NavigationProvider(
  { history, visit, remote, mapping }: NavigationProviderProps,
  ref: ForwardedRef<{ navigateTo: NavigateTo | null }>
) {
  const dispatch = useDispatch()
  const pages = useSelector<RootState, AllPages>((state) => state.pages)
  const superglue = useSelector<RootState, SuperglueState>(
    (state) => state.superglue
  )
  const currentPageKey = useSelector<RootState, string>(
    (state) => state.superglue.currentPageKey
  )
  const store = useStore()

  useEffect(() => {
    return history.listen(onHistoryChange)
  }, [])

  useLayoutEffect(() => {
    const state = history.location.state as HistoryState
    if (state && 'superglue' in state) {
      const { posX, posY } = state
      setWindowScroll(posX, posY)
    }
  }, [currentPageKey])

  useImperativeHandle(
    ref,
    () => {
      return {
        navigateTo,
      }
    },
    []
  )

  const onHistoryChange = ({ location, action }: Update): void => {
    const state = location.state as HistoryState

    if (!state && location.hash !== '' && action === 'POP') {
      const nextPageKey = urlToPageKey(location.pathname + location.search)
      const containsKey = !!pages[nextPageKey]
      if (containsKey) {
        history.replace(
          {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
          {
            pageKey: nextPageKey,
            superglue: true,
            posY: window.pageYOffset,
            posX: window.pageXOffset,
          }
        )
      }
    }

    if (state && 'superglue' in state) {
      const prevPageKey = superglue.currentPageKey

      if (action === 'PUSH') {
        const { pageKey } = state
        dispatch(setActivePage({ pageKey }))
      }

      if (action === 'REPLACE') {
        const { pageKey } = state
        if (prevPageKey && prevPageKey !== pageKey) {
          dispatch(removePage({ pageKey: prevPageKey }))
          dispatch(setActivePage({ pageKey }))
        }
      }

      if (action === 'POP') {
        const { pageKey } = state
        const containsKey = !!pages[pageKey]

        if (containsKey) {
          const { restoreStrategy } = pages[pageKey]

          switch (restoreStrategy) {
            case 'fromCacheOnly':
              dispatch(setActivePage({ pageKey }))
              break
            case 'fromCacheAndRevisitInBackground':
              dispatch(setActivePage({ pageKey }))
              visit(pageKey, { revisit: true })
              break
            case 'revisitOnly':
            default:
              visit(pageKey, { revisit: true }).then(() => {
                const noNav =
                  prevPageKey === store.getState().superglue.currentPageKey
                if (noNav) {
                  // When "POP'ed", revisiting (using revisit: true) a page can result in
                  // a redirect, or a render of the same page.
                  //
                  // When its a redirect, calculateNavAction  will correctly set the
                  // navigationAction to `replace` and fire this function again. When
                  // its the same page, navigationAction is set to `none`, in that
                  // scenario we have to set the activePage expliclity here.
                  dispatch(setActivePage({ pageKey }))
                }
              })
          }
        } else {
          visit(pageKey, { revisit: true }).then(() => {
            const noNav =
              prevPageKey === store.getState().superglue.currentPageKey
            if (noNav) {
              dispatch(setActivePage({ pageKey }))
            }
          })
        }
      }
    }
  }

  const navigateTo: NavigateTo = (path, { action, search } = {}) => {
    action ||= 'push'
    search ||= {}

    if (action === 'none') {
      return false
    }

    path = pathWithoutBZParams(path)
    let nextPageKey = urlToPageKey(path)
    // store is untyped?
    const page = store.getState().pages[nextPageKey]

    if (page) {
      if (Object.keys(search).length > 0) {
        const originalKey = nextPageKey
        nextPageKey = mergeQuery(nextPageKey, search)
        dispatch(copyPage({ from: originalKey, to: nextPageKey }))
        path = mergeQuery(path, search)
      }

      const location = history.location
      const state = location.state as HistoryState

      const historyArgs = [
        path,
        {
          pageKey: nextPageKey,
          superglue: true,
          posY: 0,
          posX: 0,
        },
      ] as const

      if (action === 'push') {
        if (hasWindow) {
          history.replace(
            {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            },
            {
              ...state,
              posY: window.scrollY,
              posX: window.scrollX,
            }
          )
        }

        history.push(...historyArgs)
      }

      if (action === 'replace') {
        history.replace(...historyArgs)
      }

      return true
    } else {
      console.warn(
        `\`navigateTo\` was called , but could not find
        the pageKey in the store. This may happen when the wrong
        content_location was set in your non-get controller action.
        No navigation will take place`
      )
      return false
    }
  }

  const { search } = superglue
  const { componentIdentifier } = pages[currentPageKey]
  const Component = mapping[componentIdentifier]

  if (Component) {
    return (
      <NavigationContext.Provider
        value={{ pageKey: currentPageKey, search, navigateTo, visit, remote }}
      >
        <Component />
      </NavigationContext.Provider>
    )
  } else {
    notFound(componentIdentifier)
  }
})

export { NavigationContext, NavigationProvider }
