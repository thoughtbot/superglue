import React from 'react';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import reduceReducers from 'reduce-reducers';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { ApplicationBase, fragmentMiddleware } from '@thoughtbot/superglue';
import { applicationRootReducer, applicationPagesReducer } from './reducer';
import { buildVisitAndRemote } from './application_visit';
import { pageIdentifierToPageComponent } from './page_to_page_mapping';

if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const appEl = document.getElementById("app");
    const location = window.location;

    if (appEl) {
      render(
        <Application
          appEl={appEl}
          // The base url prefixed to all calls made by the `visit`
          // and `remote` thunks.
          baseUrl={location.origin}
          // The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb
          // template, e.g., index.html.erb
          initialPage={window.SUPERGLUE_INITIAL_PAGE_STATE}
          // The initial path of the page, e.g., /foobar
          path={location.pathname + location.search + location.hash}
          buildVisitAndRemote={buildVisitAndRemote}
        />,
        appEl
      );
    }
  });
}

export default class Application extends ApplicationBase {
  mapping() {
    return pageIdentifierToPageComponent;
  }

  visitAndRemote(navRef, store) {
    return buildVisitAndRemote(navRef, store);
  }

  buildStore(initialState, { superglue: superglueReducer, pages: pagesReducer }) {
    // Create the store
    // See `./reducer.js` for an explaination of the two included reducers
    const composeEnhancers =
      (this.hasWindow && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
      compose;
    const reducer = reduceReducers(
        combineReducers({
          superglue: superglueReducer,
          pages: reduceReducers(pagesReducer, applicationPagesReducer),
        }),
        applicationRootReducer
    );

    const store = createStore(
      reducer,
      initialState,
      composeEnhancers(applyMiddleware(thunk, fragmentMiddleware))
    );

    return store;
  }
}
