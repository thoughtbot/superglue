import React, {
  createContext,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react'
import { urlToPageKey, pathWithoutBZParams } from '../utils'
import { removePage, historyChange, setActivePage } from '../actions'
import {
  HistoryState,
  RootState,
  NavigateTo,
  NavigationContextProps,
  NavigationProviderProps,
  AllPages,
  SuperglueState,
  PageKey,
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
  const store = useStore()

  useEffect(() => {
    return history.listen(onHistoryChange)
  }, [])

  useImperativeHandle(
    ref,
    () => {
      return {
        navigateTo,
      }
    },
    []
  )

  const visitAndRestore = (pageKey: PageKey, posX: number, posY: number) => {
    // When the application visit gets called with revisit: true
    // -  In cases where the response was not redirected, the calculated
    //    navigationAction is set to 'none' (meaning `navigateTo` immediately returned `false`)
    //    and so we have restore scroll and the set the active page
    // -  In cases where the response was redirected, the calculated
    //    navigationAction is set to 'replace', and is handled gracefully by navigateTo,
    //    before this method gets called.
    // That's why we're only concerned with the first case, but we gracefully warn
    // if the application visit did not return the meta object like the dev was supposed to.
    return visit(pageKey, { revisit: true }).then((meta) => {
      if (meta) {
        if (meta.navigationAction === 'none') {
          dispatch(setActivePage({ pageKey }))
          setWindowScroll(posX, posY)
        }
      } else {
        console.warn(
          `scoll restoration was skipped. Your visit's then funtion
          should return the meta object it recieved if you want your
          application to restore the page's previous scroll.`
        )
      }
    })
  }

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
      dispatch(
        historyChange({
          pageKey: state.pageKey
        })
      )

      if (action !== 'POP') {
        return
      }

      const { pageKey, posX, posY } = state
      const containsKey = !!pages[pageKey]

      if (containsKey) {
        const { restoreStrategy } = pages[pageKey]

        switch (restoreStrategy) {
          case 'fromCacheOnly':
            dispatch(setActivePage({ pageKey }))
            setWindowScroll(posX, posY)
            break
          case 'fromCacheAndRevisitInBackground':
            dispatch(setActivePage({ pageKey }))
            setWindowScroll(posX, posY)
            visit(pageKey, { revisit: true })
            break
          case 'revisitOnly':
          default:
            visitAndRestore(pageKey, posX, posY)
        }
      } else {
        visitAndRestore(pageKey, posX, posY)
      }
    }
  }

  const navigateTo: NavigateTo = (
    path,
    { action } = {
      action: 'push',
    }
  ) => {
    if (action === 'none') {
      return false
    }

    path = pathWithoutBZParams(path)
    const nextPageKey = urlToPageKey(path)
    const hasPage = Object.prototype.hasOwnProperty.call(
      store.getState().pages,
      nextPageKey
    )

    if (hasPage) {
      const location = history.location
      const state = location.state as HistoryState
      const prevPageKey = state.pageKey
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
              posY: window.pageYOffset,
              posX: window.pageXOffset,
            }
          )
        }

        history.push(...historyArgs)
      }

      if (action === 'replace') {
        history.replace(...historyArgs)
      }

      setActivePage({ pageKey: nextPageKey })
      setWindowScroll(0, 0)

      if (action === 'replace' && prevPageKey && prevPageKey !== nextPageKey) {
        dispatch(removePage({ pageKey: prevPageKey }))
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

  const { currentPageKey, search } = superglue
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
