import React from 'react'
import parse from 'url-parse'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {rootReducer} from './reducers'
import {setDOMListenersForNav, unsetDOMListenersForNav} from './listeners'
import {createStore, applyMiddleware} from 'redux'
import {setWindow, unsetWindow, hasWindow} from './window'
import {Nav} from './utils/react'
import connect from './connector'

export {mapStateToProps, mapDispatchToProps} from './utils/react'
export {breezyReducer, pageReducer, rootReducer} from './reducers'
export {setDOMListenersForNav, unsetDOMListenersForNav}
export {setWindow, unsetWindow}

export function stop () {
  unsetWindow()
  unsetDOMListenersForNav()
}

export function argsForHistory (url, page) {
  const pathname = parse(url).pathname

  return [pathname, {
    breezy: true,
    url: url,
    screen: page.screen
  }]
}

export function argsForNavInitialState (url, page) {
  const pathname = parse(url).pathname

  return {
    screen: page.screen,
    url: pathname
  }
}

export function pageToInitialState (url, page) {
  const pathname = parse(url).pathname

  return {
    page: {[pathname]: page}
  }
}

export function start ({window, baseUrl='', history, initialPage={}}) {
  setWindow(window)
  const url = window.location.href
  history.replace(...argsForHistory(url, initialPage))


  function handleRef (ref){
    if (hasWindow()) {
      setDOMListenersForNav(ref)
    }
  }

  const nav = class extends React.Component {
    render () {
      return (
        <Nav ref={handleRef}
          mapping={this.props.mapping}
          initialState={argsForNavInitialState(url, initialPage)}
          history={history}
        />
      )
    }
  }

  return {
    reducer: rootReducer,
    Nav: nav,
    connect: function(store){
      connect(store)
      store.dispatch({type: 'BREEZY_SET_BASE_URL', baseUrl: baseUrl})
    },
    initialState: pageToInitialState(url, initialPage)
  }
}

export default {
  start,
  stop
}
