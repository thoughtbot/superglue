import React from 'react'
import parse from 'url-parse'
import {remote} from '../action_creators'
import {vanityUrl} from './url'
import PropTypes from 'prop-types'

export class Nav extends React.Component {
  constructor(props) {
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
      const historyArgs = [vanityUrl(url), {
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
        url:  parse(location.pathname).pathname
      })
    }

    if (action === 'POP' && location.state && location.state.breezy) {
      const {screen, url} = location.state
      this.setState({screen, url})
    }
  }

  notFound(screen) {
    const {store} = this.context
    store.dispatch({type: 'BREEZY_ERROR', message: `Could not find screen ${screen}`})
  }

  render() {
    const Component = this.mapping[this.state.screen]

    if (Component) {
      return <Component url={this.state.url} navigateTo={this.navigateTo} />
    } else {
      return this.notFound(this.state.screen)
    }
  }
}

Nav.contextTypes = {store: PropTypes.object}

export const mapStateToProps = (state = {page:{}}, ownProps) => {
  const {data} = state.page[ownProps.url] || {}
  const props = data
  return props || {}
}

export const mapDispatchToProps = (dispatch) => {
  return {
    remote: (args) => {
      return dispatch(remote(args))
    }
  }
}
