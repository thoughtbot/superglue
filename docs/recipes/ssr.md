# Server-Side Rendering

Superglue's generators does not include Server Side Rendering, but we
can add support using [Humid](https://github.com/thoughtbot/humid), a SSR library
built for Superglue.

Follow the [instructions](https://github.com/thoughtbot/humid#installation).
Then, if you're using esbuild, create a `app/javascript/server_rendering.js`:

```js
import React from 'react';
import { createApp } from '@thoughtbot/superglue';
import { buildVisitAndRemote } from './application_visit';
import { pageIdentifierToPageComponent } from './page_to_page_mapping';
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
  const { Provider, Outlet } = createApp({
    baseUrl,
    initialPage: initialState,
    path,
    buildVisitAndRemote,
    mapping: pageIdentifierToPageComponent,
  })

  return renderToString(
    <Provider><Outlet /></Provider>
  )
})
```

Next

```terminal
yarn add esbuild-plugin-polyfill-node text-encoding whatwg-url
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
export { URL, URLSearchParams } from 'whatwg-url'

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

Use `Humid.render` in all your `html` templates, e.g., `index.html.erb` or `superglue.html.erb`:

```diff
  <script type="text/javascript">
-   window.SUPERGLUE_INITIAL_PAGE_STATE=<%= render_props %>;<%# erblint:disable ErbSafety %>
+   <% initial_state = render_props %>
+   window.SUPERGLUE_INITIAL_PAGE_STATE=<%= initial_state %>;<%# erblint:disable ErbSafety %>
  </script>
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

```jsx
import React from 'react';
import { createApp } from '@thoughtbot/superglue';
import { hydrateRoot } from 'react-dom/client';
import { buildVisitAndRemote } from './application_visit';
import { pageIdentifierToPageComponent } from './page_to_page_mapping';
import { Layout } from './components';

if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const appEl = document.getElementById("app");
    const location = window.location;

    if (appEl) {
      const { Provider, Outlet, ujs } = createApp({
        baseUrl: location.origin,
        initialPage: window.SUPERGLUE_INITIAL_PAGE_STATE,
        path: location.pathname + location.search + location.hash,
        buildVisitAndRemote,
        mapping: pageIdentifierToPageComponent,
      })

      hydrateRoot(appEl,
        <div onClick={ujs.onClick} onSubmit={ujs.onSubmit}>
          <Provider>
            <Layout>
              <Outlet />
            </Layout>
          </Provider>
        </div>
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
