import React from 'react'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import createHistory from 'history/createBrowserHistory'
import Breezy from '@jho406/breezy'

// Mapping between your props template to Component
// e.g {'posts/new': PostNew}

const screenToComponentMapping = {
}

const history = createHistory({})
const initialPage = window.BREEZY_INITIAL_PAGE_STATE
const baseUrl = ''

//The Nav is pretty bare bones
//Feel free to replace the implementation
const {reducer, initialState, Nav, connect} = Breezy.start({
  window,
  initialPage,
  baseUrl,
  history
})

const store = createStore(
  combineReducers({
    ...reducer,
  }),
  initialState,
  applyMiddleware(thunk)
)

connect(store)

class App extends React.Component {
  render() {
    return <Provider store={store}>
      <Nav mapping={this.props.mapping}/>
    </Provider>
  }
}

document.addEventListener("DOMContentLoaded", function() {
  render(<App mapping={screenToComponentMapping}/>, document.getElementById('app'))
})
