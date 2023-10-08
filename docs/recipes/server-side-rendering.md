# Server-Side Rendering

Superglue does not include server-side rendering out of the box, but you can easily
add it with [humid](https://github.com/thoughtbot/humid).

Follow the [instructions](https://github.com/thoughtbot/humid#installation).
Then, if you're using esbuild, create a `app/javascript/packs/server_rendering.js`:

```javascript
import React from 'react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { ApplicationBase } from '@thoughtbot/superglue';
import { pageIdentifierToPageComponent } from './pageToPageMapping';
import { buildStore } from './store'
import { renderToString } from 'react-dom/server';

require("source-map-support").install({
  retrieveSourceMap: filename => {
    return {
      url: filename,
      map: readSourceMap(filename)
    };
  }
});

class Application extends ApplicationBase {
  mapping() {
    return pageIdentifierToPageComponent;
  }

  visitAndRemote(navRef, store) {
    return {visit: () => {}, remote: () => {}}
  }

  buildStore(initialState, { superglue, pages}) {
    return buildStore(initialState, superglue, pages);
  }
}

setHumidRenderer((json) => {
  const initialState = JSON.parse(json)
  return renderToString(
    <Application
      // baseUrl={origin}
      // The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb
      // template, e.g., index.html.erb
      initialPage={initialState}
      // The initial path of the page, e.g., /foobar
      // path={path}
    />
  )
})
```

Next `yarn add esbuild-plugin-polyfill-node text-encoding` and add a esbuild build file.

```
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
```

Add a line to your `package.json` like so:

```
   "scripts": {
+    "build:ssr": "node ./build-ssr.mjs"
```

Replace `<div id="app">` in your ERB templates with:

```erb
<% initial_state = controller.render_to_string(@virtual_path ,formats: [:json], locals: local_assigns, layout: true) %>

<script type="text/javascript">
  window.SUPERGLUE_INITIAL_PAGE_STATE=<%= initial_state.html_safe %>;
</script>

<div id="app">
  <%= Humid.render(initial_state).html_safe %>
</div>
```

In `application.js` change this:

```
import { createRoot } from 'react-dom/client';
```

to this

```
import { hydrateRoot } from 'react-dom/client';
```

and change the rest of `application.js` accordingly.

