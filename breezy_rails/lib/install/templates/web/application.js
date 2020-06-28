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
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { applicationRootReducer, applicationPagesReducer } from './reducer'
import { buildVisitAndRemote } from './application_visit'

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

// By using start Breezy will return a reducer, the `initialState` to pass
// to redux, the `initialPageKey` to pass to the NavComponent to render the
// right page, and a `connect` function to connec the Breezy lib to the store
const {reducer, initialState, initialPageKey, connect} = Breezy.start({
  window,
  initialPage,
  baseUrl,
  history
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// Extract the reducers so that we can add reduceReducers on the pagesReducer
const {
  breezy: breezyReducer,
  pages: pagesReducer,
} = reducer

// Redux Persist settings
// The key is set to the stringified JS asset path to remove the need for
// migrations when hydrating.
const persistKey = window.BREEZY_INITIAL_PAGE_STATE.assets.filter( asset => asset.endsWith('.js'))
const persistConfig = {
  key: JSON.stringify(persistKey),
  storage,
}

// Create the store
// See `./reducer.js` for an explaination of the two included reducers
const store = createStore(
  persistReducer( persistConfig,
    reduceReducers(
      combineReducers({
        breezy: breezyReducer,
        pages: reduceReducers(pagesReducer, applicationPagesReducer),
      }),
      applicationRootReducer
    )
  ),
  initialState,
  composeEnhancers(applyMiddleware(thunk))
)

persistStore(store)

// Create a navigator Ref for UJS attributes and to enhance the base visit
// implementation with browser like functionality with
// enhanceVisitWithBrowserBehavior
const navigatorRef = React.createRef()

// Connect the Breezy internally requires access to the store, use the
// provided connect function and pass the created store
connect(store)
const {visit, remote} = buildVisitAndRemote(navigatorRef, store)

// This is the root component that hold your component. The Nav component is
// pretty bare, and you're welcome to replace the implementation.
//
// Your modified `visit` and `remote` will get passed to your components through
// mapDispatchToProps. You can access them via `this.props.visit` or
// `this.props.remote`.
class App extends React.Component {
  render() {
    return <Provider store={store}>
      <Nav
        store={store}
        ref={navigatorRef}
        visit={visit}
        remote={remote}
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
      visit,
      remote,
      store,
      ujsAttributePrefix: 'data-bz'
    })

    appEl.addEventListener('click', onClick)
    appEl.addEventListener('submit', onSubmit)

    render(<App mapping={identifierToComponentMapping}/>, appEl)
  }
})
