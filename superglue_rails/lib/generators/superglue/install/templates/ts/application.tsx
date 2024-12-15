import React from 'react';
import { createRoot } from 'react-dom/client';
import { Application, VisitResponse } from '@thoughtbot/superglue';
import { buildVisitAndRemote } from './application_visit';
import { pageIdentifierToPageComponent } from './page_to_page_mapping';
import { store } from './store'

declare global {
  interface Window { SUPERGLUE_INITIAL_PAGE_STATE: VisitResponse; }
}

if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const appEl = document.getElementById("app");
    const location = window.location;

    if (appEl) {
      const root = createRoot(appEl);
      root.render(
        <Application
          // The base url prefixed to all calls made by the `visit`
          // and `remote` thunks.
          baseUrl={location.origin}
          // The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb
          // template, e.g., index.html.erb
          initialPage={window.SUPERGLUE_INITIAL_PAGE_STATE}
          // The initial path of the page, e.g., /foobar
          path={location.pathname + location.search + location.hash}
          // Callback used to setup visit and remote
          buildVisitAndRemote={buildVisitAndRemote}
          // Callback used to setup the store
          store={store}
          // Mapping between the page identifier to page component
          mapping={pageIdentifierToPageComponent}
        />
      );
    }
  });
}

