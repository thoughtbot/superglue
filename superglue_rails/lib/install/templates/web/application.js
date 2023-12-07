import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { ApplicationBase } from '@thoughtbot/superglue';
import { buildVisitAndRemote } from './application_visit';
import { pageIdentifierToPageComponent } from './page_to_page_mapping';
import { buildStore } from './store'

class Application extends ApplicationBase {
  mapping() {
    return pageIdentifierToPageComponent;
  }

  visitAndRemote(navRef, store) {
    return buildVisitAndRemote(navRef, store);
  }

  buildStore(initialState, { superglue, pages}) {
    return buildStore(initialState, superglue, pages);
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const appEl = document.getElementById("app");
    const location = window.location;

    if (appEl) {
      const root = createRoot(appEl);
      root.render(
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
        />
      );
    }
  });
}


