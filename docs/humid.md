# Humid

![Build Status](https://github.com/thoughtbot/humid/actions/workflows/build.yml/badge.svg?branch=main)

Humid is a lightweight wrapper around [mini_racer] used to generate Server
Side Rendered (SSR) pages from your js-bundling builds. While it was built
for React, it can work with any JS function that returns a HTML string.

## Caution

This project is in its early phases of development. Its interface,
behavior, and name are likely to change drastically before a major version
release.

## Installation

Add Humid to your Gemfile.

```
gem 'humid'
```

For source-map support, also add

```
yarn add source-map-support
```


## Configuration

Add an initializer to configure

```ruby
Humid.configure do |config|
  # Path to your build file located in `app/assets/builds/`. You should use a
  # separate build apart from your `application.js`.
  #
  # Required
  config.application_path = Rails.root.join('app', 'assets', 'builds', 'server_rendering.js')

  # Path to your source map file
  #
  # Optional
  config.source_map_path = Rails.root.join('app', 'assets', 'builds', 'server_rendering.js.map')

  # Raise errors if JS rendering failed. If false, the error will be
  # logged out to Rails log and Humid.render will return an empty string
  #
  # Defaults to true.
  config.raise_render_errors = Rails.env.development? || Rails.env.test?

  # The logger instance.
  # `console.log` and friends (`warn`, `error`) are delegated to
  # the respective logger levels on the ruby side.
  #
  # Defaults to `Logger.new(STDOUT)`
  config.logger = Rails.logger

  # Options passed to mini_racer.
  #
  # Defaults to empty `{}`.
  config.context_options = {
    timeout: 1000,
    ensure_gc_after_idle: 2000
  }
end

# Capybara defines its own puma config which is set up to run a single puma process
# with a thread pool. This ensures that a context gets created on that process.
if Rails.env.test?
  # Use single_threaded mode for Spring and other forked envs.
  MiniRacer::Platform.set_flags! :single_threaded
  Humid.create_context
end
```

Then add to your `config/puma.rb`

```
workers ENV.fetch("WEB_CONCURRENCY") { 1 }

on_worker_boot do
  Humid.create_context
end

on_worker_shutdown do
  Humid.dispose
end
```

If you'd like support for source map support, you will need to
1. Add the following to your entry file, e.g, `server_rendering.js`.
2. set `config.source_map_path`.

```javascript
require("source-map-support").install({
  retrieveSourceMap: filename => {
    return {
      url: filename,
      map: readSourceMap(filename)
    };
  }
});
```
A [sample] webpack.config is available for reference.

## The mini_racer environment.

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
respective methods on the configured logger.

## Usage

In your entry file, e.g, `server_rendering.js`, pass your HTML render function
to `setHumidRenderer`. There is no need to require the function.

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

And finally call `render` from ERB.

```ruby
<%= Humid.render(initial_state).html_safe %>
```

Instrumentation is included:

```
Completed 200 OK in 14ms (Views: 0.2ms | Humid SSR: 11.0ms | ActiveRecord: 2.7ms)
```

### Puma

`mini_racer` is thread safe, but not fork safe. To use with web servers that
employ forking, use `Humid.create_context` only on forked processes. On
production, There should be no context created on the master process.

```ruby
# Puma
on_worker_boot do
  Humid.create_context
end

on_worker_shutdown do
  Humid.dispose
end
```

### Server-side libraries that detect node.js envs.
You may need webpacker to create aliases for server friendly libraries that can
not detect the `mini_racer` environment. For example, in `webpack.config.js`.

```diff
...
  resolve: {
    alias: {
      'html-dom-parser': path.resolve(__dirname, '../../node_modules/html-dom-parser/lib/html-to-dom-server')
    }
  }
...
```

## Writing universal code
[Vue has a resource][vue_ssr] on how to write universal code. Below
are a few highlights that are important to keep in mind.

### State

Humid uses a single context across multiple request. To avoid state pollution, we
provide a factory function to `setHumidRenderer` that builds a new app instance on
every call.

This provides better isolation, but as it is still a shared context, polluting
`global` is still possible. Be careful of modifying `global` in your code.

### Missing browser APIs

Polyfills and some libraries that depend on browser APIs will fail in the
`mini_racer` environment because of missing browser APIs. Account for this by
moving the `require` to `useEffect` in your component.

```
  useEffect(() => {
    const svgPanZoom = require('svg-pan-zoom')
    //...
  }, [])
```

## Contributing

Please see [CONTRIBUTING.md](/CONTRIBUTING.md).

## License

Humid is Copyright © 2021-2024 Johny Ho.
It is free software, and may be redistributed under the terms specified in the
[LICENSE](/LICENSE.md) file.

<!-- START /templates/footer.md -->
## About thoughtbot

![thoughtbot](https://thoughtbot.com/thoughtbot-logo-for-readmes.svg)

This repo is maintained and funded by thoughtbot, inc.
The names and logos for thoughtbot are trademarks of thoughtbot, inc.

We love open source software!
See [our other projects][community].
We are [available for hire][hire].

[community]: https://thoughtbot.com/community?utm_source=github
[hire]: https://thoughtbot.com/hire-us?utm_source=github


<!-- END /templates/footer.md -->

[mini_racer]: https://github.com/rubyjs/mini_racer
[vue_ssr]: https://ssr.vuejs.org/
[sample]: ./webpack.config.js
