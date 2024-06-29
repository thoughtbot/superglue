import React from 'react'
import { urlToPageKey, pathWithoutBZParams } from '../utils'
import { REMOVE_PAGE, HISTORY_CHANGE } from '../actions'
import {
  HistoryState,
  PageOwnProps,
  Remote,
  SuperglueStore,
  Visit,
} from '../types'
import { ConnectedComponent } from 'react-redux'
import { History, Update } from 'history'

interface Props {
  store: SuperglueStore
  history: History
  mapping: {
    [key: string]: ConnectedComponent<React.ComponentType, PageOwnProps>
  }
  visit: Visit
  remote: Remote
  initialPageKey: string
}

interface State {
  pageKey: string
  ownProps: {
    [key: string]: unknown
  }
}

class Nav extends React.Component<Props, State> {
  public history: History
  public hasWindow: boolean
  public unsubscribeHistory: () => void

  constructor(props: Props) {
    super(props)
    const { history, initialPageKey } = this.props
    this.history = history
    this.navigateTo = this.navigateTo.bind(this)
    this.scrollTo = this.scrollTo.bind(this)
    this.onHistoryChange = this.onHistoryChange.bind(this)
    this.state = {
      pageKey: initialPageKey,
      ownProps: {},
    }
    this.hasWindow = typeof window !== 'undefined'
  }

  componentDidMount(): void {
    this.unsubscribeHistory = this.history.listen(this.onHistoryChange)
  }

  componentWillUnmount(): void {
    this.unsubscribeHistory()
  }

  navigateTo(
    path: string,
    { action, ownProps } = { action: 'push', ownProps: {} }
  ): boolean {
    if (action === 'none') {
      return false
    }

    path = pathWithoutBZParams(path)
    const nextPageKey = urlToPageKey(path)
    const { store } = this.props
    const hasPage = !!store.getState().pages[nextPageKey]

    if (hasPage) {
      const location = this.history.location
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
        if (this.hasWindow) {
          this.history.replace(
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

        this.history.push(...historyArgs)
      }

      if (action === 'replace') {
        this.history.replace(...historyArgs)
      }

      this.setState({ pageKey: nextPageKey, ownProps })
      this.scrollTo(0, 0)

      if (action === 'replace' && prevPageKey && prevPageKey !== nextPageKey) {
        store.dispatch({
          type: REMOVE_PAGE,
          payload: {
            pageKey: prevPageKey,
          },
        })
      }

      return true
    } else {
      console.warn(
        `\`navigateTo\` was called , but could not find.
        the pageKey in the store. This may happen when the wrong
        content_location was set in your non-get controller action.
        No navigation will take place`
      )
      return false
    }
  }

  scrollTo(posX: number, posY: number): void {
    this.hasWindow && window.scrollTo(posX, posY)
  }

  onHistoryChange({ location, action }: Update): void {
    const { store, visit } = this.props
    const { pathname, search, hash } = location
    const state = location.state as HistoryState

    if (state && 'superglue' in state) {
      store.dispatch({
        type: HISTORY_CHANGE,
        payload: { pathname, search, hash },
      })

      if (action !== 'POP') {
        return
      }

      const { pageKey, posX, posY } = state
      const containsKey = !!store.getState().pages[pageKey]

      if (containsKey) {
        const { restoreStrategy } = store.getState().pages[pageKey]

        switch (restoreStrategy) {
          case 'fromCacheOnly':
            this.setState({ pageKey })
            this.scrollTo(posX, posY)
            break
          case 'fromCacheAndRevisitInBackground':
            this.setState({ pageKey })
            this.scrollTo(posX, posY)
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

              if (!!meta && meta.suggestedAction === 'none') {
                this.setState({ pageKey })
                this.scrollTo(posX, posY)
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

          if (!!meta && meta.suggestedAction === 'none') {
            this.setState({ pageKey })
            this.scrollTo(posX, posY)
          }
        })
      }
    }
  }

  notFound(identifier: string | undefined): never {
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

  render(): JSX.Element {
    const { store, visit, remote } = this.props
    const { pageKey, ownProps } = this.state
    const { componentIdentifier } = store.getState().pages[pageKey]
    const Component = this.props.mapping[componentIdentifier]

    if (Component) {
      return (
        <Component
          pageKey={pageKey}
          navigateTo={this.navigateTo}
          visit={visit}
          remote={remote}
          {...ownProps}
        />
      )
    } else {
      this.notFound(componentIdentifier)
    }
  }
}

export default Nav
