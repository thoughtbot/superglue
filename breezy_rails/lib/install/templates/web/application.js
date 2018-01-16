import React from 'react'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import createHistory from 'history/createBrowserHistory'
import { reducer as formReducer } from 'redux-form'

import Breezy from '@jho406/breezy'

// This mapping can be auto populate through
// Breezy generators, for example:
// Run `rails g breezy:view Post index`
const mapping = {
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
  combineReducers(
    ...reducer,
    form: formReducer
  ),
  initialState,
  applyMiddleware(thunk)
)

connect(store)

class App extends React.Component {
  render() {
    return <Provider store={store}>
      <Nav mapping={mapping}/>
    </Provider>
  }
}

document.addEventListener("DOMContentLoaded", function() {
  render(<App mapping={mapping}/>, document.getElementById('app'))
})
