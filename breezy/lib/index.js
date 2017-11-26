import React from 'react'
import parse from 'url-parse'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {pageReducer} from './reducers'
import {setNavAndListen, unsetNavAndUnlisten} from './listeners'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import {setWindow, unsetWindow, hasWindow} from './window'
import {Nav} from './utils/react'
import connect from './connector'

export {mapStateToProps, mapDispatchToProps} from 'breezy/lib/utils/react'
export {breezyReducer, pageReducer, rootReducer} from './reducers'
export {remote} from 'breezy/lib/action_creators'

export function stop() {
  unsetWindow()
  unsetNavAndUnlisten()
}

export function argsForHistory(url, page) {
  const pathname = parse(url).pathname

  return [pathname, {
    breezy: true,
    url: url,
    screen: page.screen
  }]
}

export function argsForNavInitialState(url, page) {
  const pathname = parse(url).pathname

  return {
    screen: page.screen,
    url: pathname
  }
}

export function pageToInitialState(url, page) {
  const pathname = parse(url).pathname

  return {
    page: {[pathname]: page}
  }
}

export function start({window, url, baseUrl='', history, initialPage={}}) {
  if (window) {
    setWindow(window)
  }

  history.replace(...argsForHistory(url, initialPage))

  const store = createStore(
    rootReducer,
    pageToInitialState(url, initialPage),
    applyMiddleware(thunk)
  )

  connect(store)
  store.dispatch({type: 'BREEZY_SET_BASE_URL', baseUrl: baseUrl})


  function handleRef(ref){
    if (hasWindow()) {
      setNavAndListen(ref)
    }
  }

  return class extends React.Component {
    render() {
      return <Provider store={store}>
        <Nav ref={handleRef}
          mapping={this.props.mapping}
          initialState={argsForNavInitialState(url, initialPage)}
          history={history}
        />
      </Provider>
    }
  }
}

export default {
  connect,
  start,
  stop
}
