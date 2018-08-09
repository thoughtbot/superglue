import React from 'react'
import parse from 'url-parse'
import {
  visit,
  remote,
} from '../action_creators'
import {withoutBZParams} from './url'
import PropTypes from 'prop-types'

export class Nav extends React.Component {
  constructor (props) {
    super(props)
    this.navigateTo = this.navigateTo.bind(this)

    if (this.props.history) {
      this.history = this.props.history
      this.onHistoryChange = this.onHistoryChange.bind(this)
      this.unsubscribeHistory = this.history.listen(this.onHistoryChange)
    }
    this.mapping = props.mapping
    this.state = this.props.initialState || {}
  }

  navigateTo (screen, pageKey, {action} = {action: 'push'}) {
    pageKey = withoutBZParams(pageKey)
    if (this.history) {
      const historyArgs = [pageKey, {
        screen,
        pageKey,
        breezy: true
      }]

      if(action === 'push') {
        this.history.push(...historyArgs)
      }

      if(action === 'replace') {
        const {store} = this.context
        const oldPageKey = history.location.state.pageKey
        this.history.replace(...historyArgs)
        store.dispatch({type: 'BREEZY_REMOVE_PAGE', pageKey: oldPageKey})
      }
    }

    this.setState({pageKey, screen})
  }

  onHistoryChange (location, action) {
    const {store} = this.context
    if (store) {
      store.dispatch({
        type: 'BREEZY_HISTORY_CHANGE',
        url: parse(location.pathname).href
      })
    }

    if (action === 'POP') {
      const {screen, pageKey} = location.state
      const wasNotRefreshed = !!store.getState().pages[pageKey]

      if(location.state && location.state.breezy && wasNotRefreshed) {
        this.setState({screen, pageKey})
      } else {
        // load previous page
        window.location = location.pathname
      }
    }
  }

  notFound (screen) {
    const {store} = this.context
    store.dispatch({type: 'BREEZY_ERROR', message: `Could not find screen ${screen}`})
  }

  render () {
    const Component = this.mapping[this.state.screen]

    if (Component) {
      return <Component pageKey={this.state.pageKey} navigateTo={this.navigateTo} />
    } else {
      return this.notFound(this.state.screen)
    }
  }
}

Nav.contextTypes = {store: PropTypes.object}

export function mapStateToProps (state = {pages:{}}, ownProps) {
  let pageKey
  // support for react navigation
  let params
  if (ownProps.navigation && ownProps.navigation.state && ownProps.navigation.state.params &&  ownProps.navigation.state.params.pageKey && !pageKey) {
    pageKey = ownProps.navigation.state.params.pageKey
    params = ownProps.navigation.state.params
  } else {
    pageKey = ownProps.pageKey
    params = ownProps
  }

  pageKey = withoutBZParams(pageKey)
  const {data} = state.pages[pageKey] || {data:{}}
  return {...data, ...params, pageKey}
}

export const mapDispatchToProps = {
  visit,
  remote,
}
