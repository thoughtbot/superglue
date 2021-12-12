# Server-Side Rendering

Superglue does not include server-side rendering out of the box, but you can easily
add it with [humid](https://github.com/thoughtbot/humid).

Follow the [instructions](https://github.com/thoughtbot/humid.md#installation).
Then create a `app/javascript/packs/server_rendering.js`:

```javascript
import React from 'react';
import { ApplicationBase } from '@thoughtbot/superglue'
import SeatsIndex from 'views/seats/index'
import ReactDOMServer from 'react-dom/server';
require("source-map-support").install({
  retrieveSourceMap: filename => {
    console.log('--------------------hello')
    return {
      url: filename,
      map: readSourceMap(filename)
    };
  }
});

// Mapping between your props template to Component, you must add to this
// to register any new page level component you create. If you are using the
// scaffold, it will auto append the identifers for you.
//
// e.g {'posts/new': PostNew}
const identifierToComponentMapping = {
  'seats/index': SeatsIndex,
  'seats/show': SeatsIndex,
};

export default class Application extends ApplicationBase {
  mapping() {
    return identifierToComponentMapping;
  }

  visitAndRemote(navRef, store) {
    return {visit: () => {}, remote: () => {}}
  }
}

setHumidRenderer((json) => {
  const initialState = JSON.parse(json)
  return ReactDOMServer.renderToString(
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

Modify your webpack config

```javascript
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const environment = require('./environment')
const path = require('path')
const ConfigObject = require('@rails/webpacker/package/config_types/config_object')

const webConfig = environment.toWebpackConfig()
const ssrConfig = new ConfigObject(webConfig.toObject())

ssrConfig.delete('entry')
ssrConfig.merge({
  entry: {
    server_rendering: webConfig.entry.server_rendering
  },
  resolve: {
    alias: {
      'html-dom-parser': path.resolve(__dirname, '../../node_modules/html-dom-parser/lib/server/html-to-dom')
    }
  }
})

delete webConfig.entry.server_rendering

module.exports = [ssrConfig, webConfig]
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
import { render } from 'react-dom'
```

to this

```
import { hydrate } from 'react-dom'
```

and change the rest of `application.js` accordingly.

