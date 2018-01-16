import React from 'react'
import parse from 'url-parse'
import {bindActionCreators} from 'redux'
import {
  visit,
  remote,
  remoteInOrder,
} from '../action_creators'
import {vanityPath} from './url'
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

  navigateTo (screen, url, {action} = {action: 'push'}) {
    if (this.history) {
      const historyArgs = [vanityPath(url), {
        screen,
        url,
        breezy: true
      }]

      if(action === 'push') {
        this.history.push(...historyArgs)
      }

      if(action === 'replace') {
        const {store} = this.context
        const oldUrl = history.location.state.url
        this.history.replace(...historyArgs)
        store.dispatch({type: 'BREEZY_REMOVE_PAGE', url: oldUrl})
      }
    }

    this.setState({url, screen})
  }

  onHistoryChange (location, action) {
    const {store} = this.context
    if (store) {
      store.dispatch({
        type: 'BREEZY_HISTORY_CHANGE',
        url:  parse(location.pathname).href
      })
    }

    if (action === 'POP' && location.state && location.state.breezy) {
      const {screen, url} = location.state
      this.setState({screen, url})
    }
  }

  notFound (screen) {
    const {store} = this.context
    store.dispatch({type: 'BREEZY_ERROR', message: `Could not find screen ${screen}`})
  }

  render () {
    const Component = this.mapping[this.state.screen]

    if (Component) {
      return <Component url={this.state.url} navigateTo={this.navigateTo} />
    } else {
      return this.notFound(this.state.screen)
    }
  }
}

Nav.contextTypes = {store: PropTypes.object}

export function mapStateToProps (state = {page:{}}, ownProps) {
  let url = ownProps.url
  // support for react navigation
  if (ownProps.navigation && ownProps.navigation.state && ownProps.navigation.state.params &&  ownProps.navigation.state.params.url && !url) {
    url = ownProps.navigation.state.params.url
  }
  const {data} = state.page[url] || {}
  const props = data
  return props || {}
}

export function mapDispatchToProps (dispatch) {
  const actionCreators = {
    visit,
    remote,
    remoteInOrder,
  }
  return bindActionCreators(actionCreators, dispatch)
}
