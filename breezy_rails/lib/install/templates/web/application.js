import React from 'react'
import {combineReducers, createStore, applyMiddleware, compose} from 'redux'
import reduceReducers from 'reduce-reducers'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import { createBrowserHistory } from 'history'
import Breezy from '@jho406/breezy'
import Nav from '@jho406/breezy/dist/NavComponent'
import ujsHandlers from '@jho406/breezy/dist/utils/ujs'
import applicationReducer from './reducer'

// Mapping between your props template to Component, you must add to this
// to register any new page level component you create. If you are using the
// scaffold, it will auto append the identifers for you.
//
// e.g {'posts/new': PostNew}
const identifierToComponentMapping = {
}

const history = createBrowserHistory({})
const initialPage = window.BREEZY_INITIAL_PAGE_STATE

// The base url is an optional prefix to all calls made by the `visit` and
// `remote` thunks
const baseUrl = ''

const {reducer, initialState, initialPageKey, connect} = Breezy.start({
  window,
  initialPage,
  baseUrl,
  history
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const {
  breezy: breezyReducer,
  pages: pagesReducer,
} = reducer

const store = createStore(
  combineReducers({
    breezy: breezyReducer,
    pages: reduceReducers(pagesReducer, applicationReducer),
  }),
  initialState,
  composeEnhancers(applyMiddleware(thunk))
)

// This ref is for Breezy's UJS handlers
const navigatorRef = React.createRef()

connect(store)

class App extends React.Component {
  //The Nav is bare bones. Feel free to inherit or replace the implementation.
  render() {
    return <Provider store={store}>
      <Nav
        store={store}
        ref={navigatorRef}
        mapping={this.props.mapping}
        history={history}
        initialPageKey={initialPageKey}
      />
    </Provider>
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const appEl = document.getElementById('app')
  if (appEl) {
    // Create the ujs event handlers. You can change the ujsAttributePrefix
    // in the event the data attribute conflicts with another.
    const {onClick, onSubmit} = ujsHandlers({
      navigatorRef,
      store,
      ujsAttributePrefix: 'data-bz'
    })

    appEl.addEventListener('click', onClick)
    appEl.addEventListener('submit', onSubmit)

    render(<App mapping={identifierToComponentMapping}/>, appEl)
  }
})
