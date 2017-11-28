import React from 'react'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import createHistory from 'history/createBrowserHistory'
import Breezy, {
  rootReducer,
  pageToInitialState,
  setDOMListenersForNav,
  setWindow,
  argsForHistory,
  argsForNavInitialState
} from '@jho406/breezy'
//The navigator is pretty bare bones
//Feel free to replace the implementation
import {Nav} from '@jho406/breezy/dist/utils/react'


// This mapping can be auto populate through
// Breezy generators, for example:
// Run `rails g breezy:view Post index`
const mapping = {
}

function start({window, url, baseUrl='', history, initialPage={}}) {
  setWindow(window)

  history.replace(...argsForHistory(url, initialPage))

  const store = createStore(
    rootReducer,
    pageToInitialState(url, initialPage),
    applyMiddleware(thunk)
  )

  Breezy.connect(store)
  store.dispatch({type: 'BREEZY_SET_BASE_URL', baseUrl: baseUrl})

  return class extends React.Component {
    render() {
      return <Provider store={store}>
        <Nav ref={setDOMListenersForNav}
          mapping={this.props.mapping}
          initialState={argsForNavInitialState(url, initialPage)}
          history={history}
        />
      </Provider>
    }
  }
}

const App = start({
  window: window,
  url: window.location.href,
  initialPage: window.BREEZY_INITIAL_PAGE_STATE,
  history: createHistory({})
})

document.addEventListener("DOMContentLoaded", function() {
  render(<App mapping={mapping}/>, document.getElementById('app'))
})
