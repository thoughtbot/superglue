# Humid

![Build Status](https://github.com/thoughtbot/humid/actions/workflows/build.yml/badge.svg?branch=main)

Humid is a set of helper functions for using [mini_racer] for Server Side
Rendering (SSR). There are only 2 public functions, `prepare` and `render`, and
a `configure` to set default options. `mini_racer` does the heavy lifting,
Humid just provides a few conveniences.

While it was built with React in mind, it can work with any JS function that
returns an HTML string.

!!! info "Using Superglue?"
    `rails g superglue:install` sets up Humid for you, including the
    initializer, the shim, the SSR build, and a MiniRacer context per puma
    worker. See the [server side rendering](./recipes/ssr.md) recipe for how
    the pieces fit together. This page is a reference for Humid itself.

## Design

Humid is designed with 2 goals in mind:

1. It's for the common case where all data is gathered before rendering. Your
   application fetches everything needed, passes it as props, and Humid returns
   the rendered HTML in a single synchronous call. It does not support
   streaming or async data fetching during render.

2. It's a stepping stone for when you want to scale on the edge using
   [Cloudflare V8 isolates]. `mini_racer` is a bare V8 environment, if your JS
   bundle works with `mini_racer`, it'll work on Cloudflare V8 isolates.

!!! note
    See the [sample] for a complete working example.

## Installation

Add Humid to your Gemfile.

```ruby
gem 'humid'
```

## Configuration

Add an initializer to configure the default options for `Humid.prepare`.

```ruby
# config/initializers/humid.rb

Humid.configure do |config|
  # Path to your build file located in `app/assets/builds/`. You should use a
  # separate build apart from your `application.js`.
  #
  # Required
  config.application_path = Rails.root.join("app/assets/builds/server_rendering.js")

  # Path to your source map file
  #
  # Optional
  config.source_map_path = Rails.root.join("app/assets/builds/server_rendering.js.map")

  # Raise errors if JS rendering failed. If false, the error will be
  # logged and Humid.render will return an empty string.
  #
  # Defaults to true.
  config.raise_render_errors = Rails.env.local?

  # The logger instance.
  # `console.log` and friends (`warn`, `error`) are delegated to
  # the respective logger levels on the ruby side.
  #
  # Defaults to nil
  config.logger = Rails.env.local? ? Rails.logger : nil

  # Path to a JavaScript file to eval into the MiniRacer context
  # before the application bundle. Use this to provide globals that
  # bare V8 doesn't have (TextEncoder, URL, MessageChannel, etc.).
  #
  # Optional. Defaults to nil (no prepend).
  config.prepend = Rails.root.join("shim.js")
end

if Rails.env.local?
  # Use single_threaded mode for dev and test environments.
  # This will also work for mini_test parallel tests
  MiniRacer::Platform.set_flags! :single_threaded
  MINI_RACER_SSR = { context: MiniRacer::Context.new(timeout: 1000, ensure_gc_after_idle: 2000) }

  # Reload the context when the SSR bundle changes
  ssr_checker = ActiveSupport::FileUpdateChecker.new([Humid.config.application_path.to_s]) do
    MINI_RACER_SSR[:context].dispose
    MINI_RACER_SSR[:context] = MiniRacer::Context.new(timeout: 1000, ensure_gc_after_idle: 2000)
  end

  Rails.application.reloaders << ssr_checker
  Rails.application.reloader.to_run do
    ssr_checker.execute_if_updated
  end
end
```

Options for the `MiniRacer::Context` itself, like `timeout`, are passed to
`MiniRacer::Context.new`.

## Usage

### Set a renderer

In your entry file, e.g, `server_rendering.js` (specified in
`config.application_path`), pass your HTML render function to
`setHumidRenderer`. There is no need to import the function, it's included in
the environment.

```javascript
// Set a factory function that will create a new instance of our app
// for each request.
setHumidRenderer((json) => {
  const initialState = JSON.parse(json)

  return ReactDOMServer.renderToString(
    <Application initialPage={initialState}/>
  )
})
```

The arguments are whatever you pass to `Humid.render` after the context.

### Your webserver

On production, keep in mind that `mini_racer` is **thread safe, but not fork
safe**. When using with web servers that employ forking, create the context
on worker boot. **There should be no context created on the master process.**

For example with puma:

```ruby
# config/puma.rb
on_worker_boot do
  ctx = MiniRacer::Context.new(timeout: 1000, ensure_gc_after_idle: 2000)
  MINI_RACER_SSR = { context: Humid.prepare(ctx) }
end

on_worker_shutdown do
  MINI_RACER_SSR[:context].dispose
end
```

`Humid.prepare` prepares the context's [environment](#the-mini_racer-environment):
it attaches the logger, evals the `prepend` file, and evals your
`application_path` bundle.

You can also override config options per-context:

```ruby
ctx = Humid.prepare(
  MiniRacer::Context.new(timeout: 1000),
  application_path: Rails.root.join("other_bundle.js"),
  logger: nil
)
MINI_RACER_SSR = { context: ctx }
```

!!! note
    If you pass a context that was already prepared, `prepare` will noop and
    return the context back to you. This makes it safe to call `prepare` on
    every request.

### Call `Humid.render`

And finally call `render` from ERB with a prepared context, followed by the
arguments for your renderer.

```erb
<%= Humid.render(MINI_RACER_SSR[:context], json).html_safe %>
```

`render` raises `Humid::NotPrepared` if the context was not prepared with
`Humid.prepare`. When rendering fails, it raises `Humid::RenderError`, or logs
the error and returns an empty string when `raise_render_errors` is `false`.

Instrumentation is included:

```
Completed 200 OK in 14ms (Views: 0.2ms | Humid SSR: 11.0ms | ActiveRecord: 2.7ms)
```

## The `mini_racer` environment

### Functions not available

The following functions are **not** available in the mini_racer environment

- `setTimeout`
- `clearTimeout`
- `setInterval`
- `clearInterval`
- `setImmediate`
- `clearImmediate`

### `console.log`

`console.log` and friends (`info`, `error`, `warn`) are delegated to the
respective methods on the configured logger. When no logger is configured,
they are not available.

All arguments are passed through — MiniRacer converts JS objects to Ruby
hashes and arrays automatically. A `log_formatter` proc controls how these
arguments are formatted into a single string for the logger:

```ruby
Humid.configure do |config|
  config.logger = Rails.logger

  config.log_formatter = proc { |level, message, *rest|
    parts = [message]
    parts += rest.map { |a| a.is_a?(String) ? a : JSON.pretty_generate(a) }
    parts.join("\n")
  }
end
```

The formatter receives `(level, message, *rest)` where:

- `level` — the log level as a symbol (`:debug`, `:info`, `:warn`, `:error`)
- `message` — the first argument passed to `console.log/info/warn/error`
- `rest` — any additional arguments (objects come through as Ruby hashes/arrays)

The default formatter returns `message` unchanged.

## MiniRacer Shim

MiniRacer runs bare V8 — no browser APIs, no Node APIs. React SSR and
libraries like `whatwg-url` expect globals that don't exist. Humid ships
a pre-built [shim] that provides:

- **TextEncoder / TextDecoder** — a real implementation from `text-encoding`
- **URL / URLSearchParams** — from `whatwg-url`
- **MessageChannel** — stub (React's scheduler references it)
- **navigator** — stub with `language: 'en-us'`
- **source-map-support** — rewrites JS stack traces using source maps,
  so Humid errors show original filenames and line numbers
  (`app/views/posts/show.html.tsx:42`) instead of bundled positions
  (`server_rendering.js:12345`)

Use it with the `prepend` config option:

```ruby
Humid.configure do |config|
  config.prepend = Rails.root.join("shim.js")
end
```

The shim is eval'd into the MiniRacer context before your SSR bundle,
so all globals are available when your code initializes. Superglue's
installer copies it to `shim.js` in your project root.

## Server-side libraries that detect node.js envs

Some libraries check for Node.js or browser globals to decide which code path
to use. In `mini_racer`, neither environment is detected. You may need to
configure your bundler to alias server-friendly versions. For example, in
esbuild:

```js
// build_ssr.mjs
await esbuild.build({
  // ...
  alias: {
    'html-dom-parser': 'html-dom-parser/lib/html-to-dom-server'
  }
})
```

## Writing universal code

[Vue has a resource][vue_ssr] on how to write universal code. Below
are a few highlights that are important to keep in mind.

### State

Humid uses a single context across multiple requests. To avoid state
pollution, we provide a factory function to `setHumidRenderer` that builds a
new app instance on every call.

This provides better isolation, but as it is still a shared context, polluting
`global` is still possible. Be careful of modifying `global` in your code.

### Missing browser APIs

Some libraries that depend on browser APIs will fail in the
`mini_racer` environment because of missing browser APIs. Account for this by
moving the `require` to `useEffect` in your component.

```js
useEffect(() => {
  const svgPanZoom = require('svg-pan-zoom')
  //...
}, [])
```

## Telemetry

The `MiniRacer::Context` gives you access to V8 heap statistics for monitoring
memory usage over time.

```ruby
MINI_RACER_SSR[:context].heap_stats
# {:total_heap_size=>3100672,
#  :total_heap_size_executable=>4194304,
#  :total_physical_size=>1280640,
#  :total_available_size=>1501560832,
#  :used_heap_size=>1205376,
#  :heap_size_limit=>1501560832,
#  ...}
```

Every render is instrumented as a `render.humid` event. You can combine it
with OpenTelemetry to track heap growth per worker:

```ruby
meter = OpenTelemetry.meter_provider.meter("humid")
render_histogram = meter.create_histogram("humid.render.duration", unit: "ms", description: "SSR render duration")
heap_gauge = meter.create_gauge("humid.heap.used_bytes", unit: "By", description: "V8 heap used bytes")

ActiveSupport::Notifications.subscribe("render.humid") do |event|
  stats = MINI_RACER_SSR[:context].heap_stats
  attributes = { "worker.pid" => Process.pid.to_s }

  render_histogram.record(event.duration, attributes: attributes)
  heap_gauge.record(stats[:used_heap_size], attributes: attributes)
end
```

A steadily climbing `used_heap_size` across requests indicates a memory leak in
your JavaScript bundle.

## Contributing

Please see [CONTRIBUTING.md](https://github.com/thoughtbot/humid/blob/main/CONTRIBUTING.md).

## License

Humid is Copyright © 2021-2026 Johny Ho.
It is free software, and may be redistributed under the terms specified in the
[LICENSE](https://github.com/thoughtbot/humid/blob/main/LICENSE) file.

[mini_racer]: https://github.com/rubyjs/mini_racer
[vue_ssr]: https://ssr.vuejs.org/
[sample]: https://github.com/thoughtbot/humid/tree/main/sample
[shim]: https://github.com/thoughtbot/humid/tree/main/shim
[Cloudflare V8 isolates]: https://developers.cloudflare.com/workers/reference/how-workers-works/
