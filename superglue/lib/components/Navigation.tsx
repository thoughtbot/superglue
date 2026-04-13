import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react'
import { urlToPageKey } from '../utils'
import { removePage, setActivePage, copyPage, updateContent } from '../actions'
import { Immer } from 'immer'

const immer = new Immer()
immer.setAutoFreeze(false)
import {
  HistoryState,
  RootState,
  NavigateTo,
  CopyTo,
  NavigationContextProps,
  NavigationProviderProps,
  NavigationOutletProps,
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
  { history, visit, remote, children }: NavigationProviderProps,
  ref: ForwardedRef<{ navigateTo: NavigateTo | null }>
) {
  const dispatch = useDispatch()
  const superglue = useSelector<RootState, SuperglueState>(
    (state) => state.superglue
  )
  const currentPageKey = useSelector<RootState, string>(
    (state) => state.superglue.currentPageKey
  )
  const store = useStore<RootState>()

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

    if (action !== 'POP') {
      return
    }

    const pages = store.getState().pages

    if (!state && location.hash !== '') {
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
            superglue: true,
            posY: window.pageYOffset,
            posX: window.pageXOffset,
          }
        )
      }
    }

    if (state && 'superglue' in state) {
      const pageKey = urlToPageKey(location.pathname + location.search)
      const prevPageKey = store.getState().superglue.currentPageKey
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
                // navigationAction to `replace` this is the noop scenario.
                //
                // When its the same page, navigationAction is set to `none` and
                // no navigation took place. In that case, we have to set the
                // activePage otherwise the user is stuck on the original page.
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

  const copyTo: CopyTo = (path) => {
    const nextPageKey = urlToPageKey(path)

    if (nextPageKey === currentPageKey) {
      return
    }

    store.dispatch(copyPage({ from: currentPageKey, to: path }))
  }

  const navigateTo: NavigateTo = (
    path,
    { action, updateContent: updater } = {
      action: 'push',
    }
  ) => {
    if (action === 'none') {
      return false
    }

    const nextPageKey = urlToPageKey(path)
    const hasPage = Object.prototype.hasOwnProperty.call(
      store.getState().pages,
      nextPageKey
    )

    if (hasPage) {
      if (updater) {
        const currentData = store.getState().pages[nextPageKey].data
        const updatedData = immer.produce(currentData, updater)
        dispatch(updateContent({ pageKey: nextPageKey, data: updatedData }))
      }

      const location = history.location
      const state = location.state as HistoryState
      const historyArgs = [
        path,
        {
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
        dispatch(setActivePage({ pageKey: nextPageKey }))
      }

      if (action === 'replace') {
        history.replace(...historyArgs)

        if (currentPageKey !== nextPageKey) {
          dispatch(setActivePage({ pageKey: nextPageKey }))
          dispatch(removePage({ pageKey: currentPageKey }))
        }
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

  return (
    <NavigationContext.Provider
      value={{
        pageKey: currentPageKey,
        search,
        navigateTo,
        copyTo,
        visit,
        remote,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
})

function NavigationOutlet({ mapping }: NavigationOutletProps) {
  const pages = useSelector<RootState, AllPages>((state) => state.pages)
  const currentPageKey = useSelector<RootState, string>(
    (state) => state.superglue.currentPageKey
  )
  const { componentIdentifier } = pages[currentPageKey]
  const Component = mapping[componentIdentifier]

  if (!Component) {
    notFound(componentIdentifier)
  }

  return <Component />
}

export { NavigationContext, NavigationProvider, NavigationOutlet }
