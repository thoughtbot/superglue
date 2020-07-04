import React from 'react'
import {combineReducers, createStore, applyMiddleware, compose} from 'redux'
import reduceReducers from 'reduce-reducers'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import { createBrowserHistory, createMemoryHistory } from 'history'
import { start } from '@jho406/breezy'
import Nav from '@jho406/breezy/dist/NavComponent'
import ujsHandlers from '@jho406/breezy/dist/utils/ujs'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { applicationRootReducer, applicationPagesReducer } from './reducer'
import { buildVisitAndRemote } from './application_visit'

if(typeof window !== 'undefined' ) {
  document.addEventListener("DOMContentLoaded", function() {
    const initialPage = window.BREEZY_INITIAL_PAGE_STATE
    const appEl = document.getElementById('app')

    if (appEl) {
      render(
        <Application
          initialPage={initialPage}
          hasWindow={true}
          appEl={appEl}
          href={window.location.href}
          // The base url is an optional prefix to all calls made by the `
          // `remote` thunks
          baseUrl={''}
        />, appEl)
    }
 })
}

export default class Application extends React.Component {
  constructor(props) {
    super(props)
    this.hasWindow = typeof window !== 'undefined' 
    // Mapping between your props template to Component, you must add to this
    // to register any new page level component you create. If you are using the
    // scaffold, it will auto append the identifers for you.
    //
    // e.g {'posts/new': PostNew}
    this.identifierToComponentMapping = {
    }

    // Create a navigator Ref for UJS attributes and to enhance the base visit
    // implementation with browser like functionality with
    // enhanceVisitWithBrowserBehavior
    this.navigatorRef = React.createRef()

    // Start Breezy
    const breezy = start({
      initialPage: this.props.initialPage,
      baseUrl: this.props.baseUrl,
      url: this.props.href,
      fetch: window.fetch,
    })
    this.breezy = breezy

    //Build the store
    const {initialState, reducer} = breezy
    this.store = this.buildStore(initialState, reducer)
    breezy.connect(this.store)

    //Build visit and remote thunks
    const {visit, remote} = buildVisitAndRemote(this.navigatorRef, this.store)
    this.visit = visit
    this.remote = remote
  }

  componentDidMount() {
    const { appEl } = this.props
    // Create the ujs event handlers. You can change the ujsAttributePrefix
    // in the event the data attribute conflicts with another.
    this.ujsHandlers = ujsHandlers({
      visit: this.visit,
      remote: this.remote,
      store: this.store,
      ujsAttributePrefix: 'data-bz'
    })
    const {onClick, onSubmit} = this.ujsHandlers

    appEl.addEventListener('click', onClick)
    appEl.addEventListener('submit', onSubmit)
  }

  componentWillUnmount() {
    const { appEl } = this.props
    const {onClick, onSubmit} = this.ujsHandlers

    appEl.removeEventListener('click', onClick)
    appEl.removeEventListener('submit', onSubmit)
    this.breezy.stop()
  }

  buildStore(initialState, {breezy: breezyReducer, pages: pagesReducer}) {
    // Create the store
    // See `./reducer.js` for an explaination of the two included reducers
    const composeEnhancers = (this.hasWindow && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
    const reducer = this.wrapWithPersistReducer(
      reduceReducers(
        combineReducers({
          breezy: breezyReducer,
          pages: reduceReducers(pagesReducer, applicationPagesReducer),
        }),
        applicationRootReducer
      )
    )
    const store = createStore(
      reducer,
      initialState,
      composeEnhancers(applyMiddleware(thunk))
    )

    if(this.hasWindow) {
      persistStore(store)
    }

    return store
  }

  wrapWithPersistReducer(reducers) {
    // Redux Persist settings
    // The key is set to the stringified JS asset path to remove the need for
    // migrations when hydrating.
    if (!this.hasWindow) {
      return reducers
    }
    const persistKey = this.props.initialPage.assets.filter( asset => asset.endsWith('.js'))
    const persistConfig = {
      key: JSON.stringify(persistKey),
      storage,
    }

    return persistReducer(persistConfig, reducers)
  }

  createHistory() {
    if(this.hasWindow) {
      return createBrowserHistory({})
    } else {
      return createMemoryHistory({})
    }
  }

  render() {
    const history = this.createHistory()

    return <Provider store={this.store}>
      <Nav
        store={this.store}
        ref={this.navigatorRef}
        visit={this.visit}
        remote={this.remote}
        mapping={this.identifierToComponentMapping}
        history={history}
        initialPageKey={this.breezy.initialPageKey}
      />
    </Provider>
  }
}


