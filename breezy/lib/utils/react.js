import React from 'react'
import parse from 'url-parse'
import {
  visit,
  remote,
  setInPage,
  delInPage,
  extendInPage,
  setInJoint,
  delInJoint,
  extendInJoint,
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
    console.info(`Breezy Nav component was looking for ${screen} but could not find it in your mapping:`)
    console.info(this.mapping)
    store.dispatch({type: 'BREEZY_ERROR', message: `Could not find screen ${screen}`})
  }

  render () {
    const Component = this.mapping[this.state.screen]

    if (Component) {
      return <Component pageKey={this.state.pageKey} navigateTo={this.navigateTo} />
    } else {
      this.notFound(this.state.screen)
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
  setInPage,
  delInPage,
  extendInPage,
  setInJoint,
  delInJoint,
  extendInJoint,
}

class SubmissionError extends Error {
  constructor (errors) {
    super('Submit Validation Failed')
    this.errors = errors
  }
}

export function withBrowserBehavior (visit, remote) {
  const wrappedVisit = ((...args) => {
    return visit(...args).then(rsp => {
      if (rsp.needsRefresh) {
        window.location = rsp.url
        return
      }

      if (this.props.errors) {
        throw new SubmissionError({
          ...this.props.errors
        })
      }

      if (rsp.canNavigate) {
        return this.props.navigateTo(rsp.screen, rsp.pageKey)
      } else {
        // There can only be one visit at a time, if `canNavigate`
        // is false, then this request is being ignored for a more
        // recent visit. Do Nothing.
        console.info('\
          `visit` was called more recently somewhere else.\
          The results of this request have been saved to \
          the store, but no navigation will take place')
        return
      }
    }).catch(err => {
      if (err.name === 'SubmissionError') {
        throw err
      }

      const response = err.response
      if(response.ok) {
        // err gets thrown, but if the response is ok,
        // it must be an html body that
        // breezy can't parse, just go to the location
        window.location = response.url
      } else {

        if (response.status >= 400 && response.status < 500) {
          window.location = '/400.html'
          return
        }

        if (response.status >= 500) {
          window.location = '/500.html'
          return
        }
      }
    })
  })

  const wrappedRemote = ((...args) => {
    return remote(...args, this.props.pageKey)
  })

  return {visit: wrappedVisit, remote: wrappedRemote}
}
