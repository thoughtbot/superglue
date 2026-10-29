# Server-Side Rendering

Superglue server side renders your pages out of the box using
[Humid](../humid.md), a small wrapper around [mini_racer]. The installation
generator sets everything up, so there's nothing to add. This recipe explains
how the pieces fit together and how to customize them.

## What the generator sets up

`rails g superglue:install` creates or modifies the following:

| File | Purpose |
| ---- | ------- |
| `app/javascript/server_rendering.jsx` | The SSR entry point. Registers a renderer with `setHumidRenderer`. |
| `build_ssr.mjs` | Builds `server_rendering.jsx` into `app/assets/builds/server_rendering.js`. Named `build_ssr.js`, `rollup.config.ssr.js`, or `webpack.config.ssr.js` depending on your bundler. |
| `shim.js` | Provides globals that bare V8 is missing, like `TextEncoder`, `URL`, and `MessageChannel`. |
| `config/initializers/humid.rb` | Configures Humid and creates a MiniRacer context for development and test. |
| `config/puma.rb` | Creates a MiniRacer context per worker in production. |
| `app/controllers/application_controller.rb` | Adds an `ssr_context` block. |
| `package.json` | Adds a `build:ssr` script. `build` runs `build:web` and `build:ssr` in parallel. |

With TypeScript, the entry point is `server_rendering.tsx`.

## How it works

When a browser requests a page, for example `/posts`:

1. Rails renders `app/views/posts/index.html.jsx` with your
   `application.html.erb` layout. Superglue registers `.jsx` and `.tsx` as
   template handlers.
2. The template handler calls your controller's `ssr_context` block. If it
   returns a context, the handler renders the page with
   `Humid.render(ssr_context, render_props, base_url, request.fullpath)`, and
   the response includes an `X-Superglue-SSR: 1` header.
3. Humid calls the renderer you registered in `server_rendering.jsx` with the
   page's JSON, the base URL, and the path:

    ```jsx
    setHumidRenderer((json, baseUrl, path) => {
      const initialState = JSON.parse(json)
      const { Provider, Outlet, ujs } = createApp({
        baseUrl,
        initialPage: initialState,
        path,
        buildVisitAndRemote,
        mapping: pageIdentifierToPageComponent,
      })

      return renderToString(
        <Provider>
          <Layout onClick={ujs.onClick} onSubmit={ujs.onSubmit}>
            <Outlet />
          </Layout>
        </Provider>
      )
    })
    ```

4. The rendered HTML is placed inside `<div id="app">` in your layout.
5. On the client, `application.jsx` sees that `#app` already has content and
   calls `hydrateRoot` instead of `createRoot`.

!!! warning
    The tree rendered in `server_rendering.jsx` must match the one in
    `application.jsx`, or hydration will fail. If you change one, for
    example to add a provider, change the other.

## The context

`ssr_context` is a controller class method. Its block returns a prepared
MiniRacer context, or `nil` to skip SSR. The generator adds this to your
`ApplicationController`:

```ruby
class ApplicationController < ActionController::Base
  ssr_context { Humid.prepare(MINI_RACER_SSR[:context]) if defined?(MINI_RACER_SSR) }
end
```

`MINI_RACER_SSR` is defined in two places:

- In development and test, `config/initializers/humid.rb` creates the context
  and recreates it whenever `server_rendering.js` is rebuilt.
- In production, `config/puma.rb` creates one context per puma worker on boot.
  MiniRacer is thread safe, but not fork safe, so a context must never be
  created in the puma master process.

`Humid.prepare` loads `shim.js` and your SSR bundle into the context the first
time it's called. After that, it returns the context as is, so calling it on
every request is cheap.

## Turning SSR off

To turn off SSR for a controller, return `nil` from the block:

```ruby
class DashboardController < ApplicationController
  ssr_context { nil }
end
```

Those pages render on the client only. In development, Superglue logs a
warning for each page rendered without SSR as a reminder.

To turn off SSR entirely, remove the `ssr_context` block from
`ApplicationController`.

## Writing SSR friendly components

Your SSR bundle runs in bare V8, not Node or a browser. `window`, `document`,
`setTimeout`, and friends are not available. Keep browser-only code in
`useEffect`, which doesn't run during SSR:

```jsx
useEffect(() => {
  const svgPanZoom = require('svg-pan-zoom')
  //...
}, [])
```

See [Humid](../humid.md#writing-universal-code) for more tips, including how
to alias libraries that detect Node or browser environments.

## Debugging

- In development, `raise_render_errors` is on, so a failing render raises a
  `Humid::RenderError` with the JavaScript stack trace. The shim includes
  source map support, so the trace points to your original files.
- `console.log` in your components is sent to the Rails log in development.
- Check for the `X-Superglue-SSR` response header to confirm a page was
  server side rendered.

[mini_racer]: https://github.com/rubyjs/mini_racer
