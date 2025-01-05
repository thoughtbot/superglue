# Server-Side Rendering

Superglue's generators does not include Server Side Rendering, but we
can add support using [Humid](https://github.com/thoughtbot/humid), a SSR library
built for Superglue.

Follow the [instructions](https://github.com/thoughtbot/humid#installation).
Then, if you're using esbuild, create a `app/javascript/server_rendering.js`:

```js
import React from 'react';
import { Application } from '@thoughtbot/superglue';
import { buildVisitAndRemote } from './application_visit';
import { pageIdentifierToPageComponent } from './page_to_page_mapping';
import { store } from './store'
import { renderToString } from 'react-dom/server';

require("source-map-support").install({
  retrieveSourceMap: filename => {
    return {
      url: filename,
      map: readSourceMap(filename)
    };
  }
});

setHumidRenderer((json, baseUrl, path) => {
  const initialState = JSON.parse(json)
  return renderToString(
    <Application
      className="full-height"
      // The base url prefixed to all calls made by the `visit`
      // and `remote` thunks.
      baseUrl={baseUrl}
      // The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb
      // template, e.g., index.html.erb
      initialPage={initialState}
      // The initial path of the page, e.g., /foobar
      path={path}
      // Callback used to setup visit and remote
      buildVisitAndRemote={buildVisitAndRemote}
      // Callback used to setup the store
      store={store}
      // Mapping between the page identifier to page component
      mapping={pageIdentifierToPageComponent}
    />,
    {
      concurrentFeatures: false,
    }
  )
})
```

Next

```terminal
yarn add esbuild-plugin-polyfill-node text-encoding
```

and add a esbuild build file.

```js
import * as esbuild from 'esbuild'
import { polyfillNode } from "esbuild-plugin-polyfill-node";

await esbuild.build({
  entryPoints: ['app/javascript/server_rendering.js'],
  bundle: true,
  platform: "browser",
  define: {
    "process.env.NODE_ENV": '"production"'
  },
  sourcemap: true,
  outfile: 'app/assets/builds/server_rendering.js',
  logLevel: "info",
  loader: {
    ".js": "jsx",
    ".svg": "dataurl"
  },
  inject: ["./shim.js"],
  plugins: [
    polyfillNode({
      globals: false
    }),
  ]
})
```

Add a `shim.js` for the above. We'll need this for the v8 environment that mini-racer runs on.

```javascript
export {TextEncoder, TextDecoder} from 'text-encoding'

export function MessageChannel() {
  this.port1 = {
    postMessage: function (message) {
      console.log('Message sent from port1:', message);
    },
  };

  this.port2 = {
    addEventListener: function (event, handler) {
      console.log(`Event listener added for ${event} on port2`);
      this._eventHandler = handler;
    },
    removeEventListener: function (event) {
      console.log(`Event listener removed for ${event} on port2`);
      this._eventHandler = null;
    },
    simulateMessage: function (data) {
      if (this._eventHandler) {
        this._eventHandler({ data });
      }
    },
  };
}

export const navigator = {language: "en-us"}
```

Add a line to your `package.json` like so:

```diff
   "scripts": {
+    "build:ssr": "node ./build-ssr.mjs"
```

Use `Humid.render` in all your ERB templates `index.html.erb`:

```diff
- <div id="app"></div>
+ <div id="app"><%= Humid.render(initial_state, request.scheme + '://' + request.host_with_port, request.fullpath).html_safe %></div>
```

!> Do not render spacing inside of `<div id="app">`. If you do, React will not hydrate properly and
warn `Hydration failed because the initial UI does not match what was rendered on the server`

Change your `application.js` to use `hydrateRoot`:

```diff
- import { createRoot } from 'react-dom/client';
+ import { hydrateRoot } from 'react-dom/client';
```

and change the rest of `application.js` accordingly. For example:

```js
import React from 'react';
import { Application, VisitResponse } from '@thoughtbot/superglue';
import { hydrateRoot } from 'react-dom/client';
import { buildVisitAndRemote } from './application_visit';
import { pageIdentifierToPageComponent } from './page_to_page_mapping';
import { store } from './store'

if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const appEl = document.getElementById("app");
    const location = window.location;

    if (appEl) {
      hydrateRoot(appEl,
        <Application
          className="full-height"
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
```

and add build script your `package.json` to build both the client and server js bundles. For example:

```
   "build": "yarn run build:web && yarn run build:ssr",
   "build:web": "esbuild app/javascript/application.js --bundle --sourcemap --outdir=app/assets/builds --loader:.js=jsx --loader:.svg=dataurl --public-path=/assets",
   "build:ssr": "node ./build-ssr.mjs",
```
