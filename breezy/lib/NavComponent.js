import React from 'react'
import {withoutBZParams} from './utils/url'
import {uuidv4} from './utils/helpers'
import parse from 'url-parse'
import PropTypes from 'prop-types'
import {
  BREEZY_ERROR,
  OVERRIDE_VISIT_SEQ,
  HISTORY_CHANGE,
} from './actions'

function argsForHistory (url) {
  const pageKey = withoutBZParams(url)

  return [pageKey, {
    breezy: true,
    pageKey,
  }]
}

function argsForNavInitialState (url) {
  return {
    pageKey: withoutBZParams(url),
    ownProps: {}
  }
}

class Nav extends React.Component {
  constructor (props) {
    super(props)
    const {
      history,
      initialPageKey,
    } = this.props

    this.history = history
    this.navigateTo = this.navigateTo.bind(this)
    this.onHistoryChange = this.onHistoryChange.bind(this)
    this.state = argsForNavInitialState(initialPageKey)
  }

  componentDidMount () {
    const {
      initialPageKey,
    } = this.props

    this.unsubscribeHistory = this.history.listen(this.onHistoryChange)
    this.history.replace(...argsForHistory(initialPageKey))
  }

  navigateTo (pageKey, {action, ownProps} = {action: 'push', ownProps: {}}) {
    pageKey = withoutBZParams(pageKey)
    const {store} = this.context

    const historyArgs = [pageKey, {
      pageKey,
      breezy: true
    }]

    if(action === 'push') {
      this.history.push(...historyArgs)
    }

    if(action === 'replace') {
      this.history.replace(...historyArgs)
    }

    const hasPage = !!store.getState().pages[pageKey]
    if (hasPage) {
      const seqId = uuidv4()
      store.dispatch({
        type: OVERRIDE_VISIT_SEQ, seqId
      })

      this.setState({pageKey, ownProps})
      return true
    } else {
      return false
    }
  }

  onHistoryChange (location, action) {
    const {store} = this.context
    store.dispatch({
      type: HISTORY_CHANGE,
      url: parse(location.pathname).href
    })

    if (action === 'POP') {
      const {pageKey} = location.state
      const wasNotRefreshed = !!store.getState().pages[pageKey]

      if(location.state && location.state.breezy && wasNotRefreshed) {
        this.setState({pageKey})
      } else {
        // load previous page
        window.location = location.pathname
      }
    }
  }

  notFound (screen) {
    const {store} = this.context
    store.dispatch({type: BREEZY_ERROR, message: `Could not find screen ${screen}`})
    let reminder = ''
    if (!screen) {
      reminder = 'Did you forget to use_breezy in your controllers?'
    }
    throw new Error(`Breezy Nav component was looking for ${screen} but could not find it in your mapping. ${reminder}`)
  }

  render () {
    const {store} = this.context
    const {mapping} = this.props
    const {pageKey, ownProps} = this.state
    const {screen} = store.getState().pages[pageKey]
    const Component = mapping[screen]

    if (Component) {
      return <Component pageKey={pageKey} navigateTo={this.navigateTo} {...ownProps}/>
    } else {
      this.notFound(screen)
    }
  }
}

Nav.contextTypes = {store: PropTypes.object}

export default Nav
