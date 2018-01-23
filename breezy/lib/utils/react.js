import React from 'react'
import parse from 'url-parse'
import {bindActionCreators} from 'redux'
import {
  visit,
  remote,
  remoteInOrder,
} from '../action_creators'
import {vanityPath as convertToVanity, pathQuery as convertToPathQuery} from './url'
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

  navigateTo (screen, pathQuery, {action} = {action: 'push'}) {
    const vanityPath = convertToVanity(pathQuery)
    if (this.history) {
      const historyArgs = [vanityPath, {
        screen,
        pathQuery: vanityPath,
        breezy: true
      }]

      if(action === 'push') {
        this.history.push(...historyArgs)
      }

      if(action === 'replace') {
        const {store} = this.context
        const oldUrl = history.location.state.url
        this.history.replace(...historyArgs)
        store.dispatch({type: 'BREEZY_REMOVE_PAGE', pathQuery: convertToVanityPath(oldUrl)})
      }
    }

    this.setState({pathQuery: vanityPath, screen})
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
      const {screen, pathQuery} = location.state
      const wasNotRefreshed = !!store.getState().page[pathQuery]

      if(location.state && location.state.breezy && wasNotRefreshed) {
        this.setState({screen, pathQuery})
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
      return <Component pathQuery={this.state.pathQuery} navigateTo={this.navigateTo} />
    } else {
      return this.notFound(this.state.screen)
    }
  }
}

Nav.contextTypes = {store: PropTypes.object}

export function mapStateToProps (state = {page:{}}, ownProps) {
  let pathQuery
  // support for react navigation
  let params
  if (ownProps.navigation && ownProps.navigation.state && ownProps.navigation.state.params &&  ownProps.navigation.state.params.pathQuery && !pathQuery) {
    pathQuery = ownProps.navigation.state.params.pathQuery
    params = ownProps.navigation.state.params
  } else {
    pathQuery = ownProps.pathQuery
    params = ownProps
  }

  pathQuery = convertToVanity(pathQuery)

  const {data} = state.page[pathQuery] || {data:{}}
  return {...data, ...params, pathQuery}
}

export const mapDispatchToProps = {
  visit,
  remote,
  remoteInOrder,
}
