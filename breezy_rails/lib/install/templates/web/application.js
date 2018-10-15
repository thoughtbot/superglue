import React from 'react'
import {combineReducers, createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import createHistory from 'history/createBrowserHistory'
import Breezy from '@jho406/breezy'
import Nav from '@jho406/breezy/dist/NavComponent'

// Mapping between your props template to Component
// e.g {'posts/new': PostNew}
const screenToComponentMapping = {
}

const history = createHistory({})
const initialPage = window.BREEZY_INITIAL_PAGE_STATE
const baseUrl = ''

//The Nav is pretty bare bones
//Feel free to replace the implementation
const {reducer, initialState, initialPageKey, connect} = Breezy.start({
  window,
  initialPage,
  baseUrl,
  history
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  combineReducers({
    ...reducer,
  }),
  initialState,
  composeEnhancers(applyMiddleware(thunk))
)

connect(store)

class App extends React.Component {
  render() {
    return <Provider store={store}>
      <Nav
        mapping={this.props.mapping}
        history={history}
        initialPageKey={initialPageKey}
      />
    </Provider>
  }
}

document.addEventListener("DOMContentLoaded", function() {
  render(<App mapping={screenToComponentMapping}/>, document.getElementById('app'))
})
