import React from 'react'
import { urlToPageKey, pathWithoutBZParams } from '../utils'
import { REMOVE_PAGE, HISTORY_CHANGE } from '../actions'
import PropTypes from 'prop-types'

class Nav extends React.Component {
  constructor(props) {
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

  componentDidMount() {
    this.unsubscribeHistory = this.history.listen(
      this.onHistoryChange
    )
  }

  componentWillUnmount() {
    this.unsubscribeHistory()
  }

  navigateTo(
    path,
    { action, ownProps } = { action: 'push', ownProps: {} }
  ) {
    if (action === 'none') {
      return false
    }

    path = pathWithoutBZParams(path)
    const nextPageKey = urlToPageKey(path)
    const { store } = this.props
    const hasPage = !!store.getState().pages[nextPageKey]

    if (hasPage) {
      const location = this.history.location
      const prevPageKey = location.state.pageKey
      const historyArgs = [
        path,
        {
          pageKey: nextPageKey,
          superglue: true,
          posY: 0,
          posX: 0,
        },
      ]

      if (action === 'push') {
        if (this.hasWindow) {
          this.history.replace(
            {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            },
            {
              ...location.state,
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

      if (
        action === 'replace' &&
        prevPageKey &&
        prevPageKey !== nextPageKey
      ) {
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

  scrollTo(posX, posY) {
    this.hasWindow && window.scrollTo(posX, posY)
  }

  onHistoryChange({ location, action }) {
    const { store, visit } = this.props
    const { pathname, search, hash, state } = location

    if (state && state.superglue) {
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

  notFound(identifier) {
    let reminder = ''
    if (!identifier) {
      reminder =
        'Did you forget to add `json.component_identifier` in your application.json.props layout?'
    }

    const error = new Error(
      `Superglue Nav component was looking for ${identifier} but could not find it in your mapping. ${reminder}`
    )

    throw error
  }

  render() {
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

Nav.propTypes = {
  store: PropTypes.object,
  history: PropTypes.object,
  mapping: PropTypes.object,
  visit: PropTypes.func,
  remote: PropTypes.func,
  initialPageKey: PropTypes.string,
}

export default Nav
