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
  PageKey
} from '../types'
import { Update } from 'history'
import { useDispatch, useSelector, useStore } from 'react-redux'

const NavigationContext = createContext<NavigationContextProps | undefined>(
  undefined
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
  ref: ForwardedRef<{ navigateTo: NavigateTo }>
) {
  const dispatch = useDispatch()
  const pages = useSelector<RootState,AllPages>((state) => state.pages)
  const superglue = useSelector<RootState,SuperglueState>((state) => state.superglue)
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

  const onHistoryChange = ({ location, action }: Update): void => {
    const { pathname, search, hash } = location
    const state = location.state as HistoryState

    if (state && 'superglue' in state) {
      dispatch(
        historyChange({
          pathname,
          search,
          hash,
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
            setActivePage({ pageKey })
            setWindowScroll(posX, posY)
            break
          case 'fromCacheAndRevisitInBackground':
            setActivePage({ pageKey })
            setWindowScroll(posX, posY)
            visit(pageKey, { revisit: true })
            break
          case 'revisitOnly':
          default:
            visit(pageKey, { revisit: true }).then((meta) => {
              if (meta === undefined) {
                console.warn(
                  `scoll restoration was skipped. Your visit's then funtion
                  should return the meta object it recieved if you want your
                  application to restore the page's previous scroll.`
                )
              }

              if (!!meta && meta.navigationAction === 'none') {
                setActivePage({ pageKey })
                setWindowScroll(posX, posY)
              }
            })
        }
      } else {
        visit(pageKey, { revisit: true }).then((meta) => {
          if (meta === undefined) {
            console.warn(
              `scoll restoration was skipped. Your visit's then funtion
              should return the meta object it recieved if you want your
              application to restore the page's previous scroll.`
            )
          }

          if (!!meta && meta.navigationAction === 'none') {
            setActivePage({ pageKey })
            setWindowScroll(posX, posY)
          }
        })
      }
    }
  }

  const navigateTo: NavigateTo = (
    path,
    { action } = {
      action: 'push'
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

  const currentPageKey = superglue.currentPageKey
  const { componentIdentifier } = pages[currentPageKey]
  const Component = mapping[componentIdentifier]

  if (Component) {
    return (
      <NavigationContext.Provider
        value={{ pageKey: currentPageKey, navigateTo, visit, remote }}
      >
        <Component/>
      </NavigationContext.Provider>
    )
  } else {
    notFound(componentIdentifier)
  }
})

export { NavigationContext, NavigationProvider }
