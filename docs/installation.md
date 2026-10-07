# Installation

!!! info "Prerequisites"
    To get started with Superglue, you'll need

    - Rails 8 or later
    - A JavaScript bundler installed via [jsbundling-rails](https://github.com/rails/jsbundling-rails). Supported bundlers: **esbuild**, **bun**, **rollup**, and **webpack**.
    - `yarn`

    If you don't have a bundler yet, install one first:

    ```terminal
    rails javascript:install:[esbuild|bun|rollup|webpack]
    ```

Add the following to your Gemfile

```ruby
# Gemfile
gem "superglue"
```

Run bundle and the installation generator:

```terminal
bundle
rails g superglue:install
```

The installer detects your bundler and configures Superglue accordingly. It
prints the choices it made before it starts:

```terminal
Installing Superglue with:
  Bundler:    esbuild (detected; change with --bundler)
  TypeScript: yes (will install typescript@^7; --no-typescript for JavaScript)
  Validator:  typia (will install typescript@^7; change with --validator=deepkit|typia or --no-validator)
  SVGR:       yes (--no-svgr to disable)
```

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `--bundler=esbuild\|bun\|rollup\|webpack` | detected | Overrides bundler detection. The generator raises if no bundler is found. |
| `--no-typescript` | TypeScript on | Generate JavaScript (`.jsx`) files instead of TypeScript (`.tsx`). |
| `--validator=deepkit\|typia` | `auto` | Runtime type validation during development. `auto` picks typia on TypeScript 7 or later (or when TypeScript is not installed yet) and deepkit on TypeScript 6 or earlier. Pass `--no-validator` to skip it. Requires TypeScript. |
| `--no-svgr` | SVGR on | Skip configuring [SVGR] to import SVGs as React components. |

For example, to install with JavaScript and esbuild:

```terminal
rails g superglue:install --bundler=esbuild --no-typescript
```

See the [working with types](./runtime-types.md) guide for more information
on runtime validation.

## Generated files

With the default TypeScript install, the generator creates:

```terminal
.
├─ app/
│  ├─ javascript/
│  │  ├─ application.tsx
│  │  ├─ application_visit.ts
│  │  ├─ page_to_page_mapping.ts
│  │  ├─ flash.ts
│  │  ├─ server_rendering.tsx
│  │  └─ components/
│  │     ├─ index.ts
│  │     ├─ Inputs.tsx
│  │     └─ Layout.tsx
│  └─ views/
│     └─ layouts/
│        ├─ application.json.props
│        └─ stream.json.props
├─ config/
│  └─ initializers/
│     ├─ superglue.rb
│     └─ humid.rb
├─ shim.js
├─ tsconfig.json
├─ <bundler config>    # build.mjs, bun.config.js, rollup.config.js, or webpack.config.js
└─ <SSR build config>  # build_ssr.mjs, build_ssr.js, rollup.config.ssr.js, or webpack.config.ssr.js
```

With `--no-typescript`, the files use `.jsx`/`.js` extensions and a
`jsconfig.json` replaces `tsconfig.json`.

The generator also modifies a few existing files:

- `app/views/layouts/application.html.erb` gets a script tag that sets
  `window.SUPERGLUE_INITIAL_PAGE_STATE` from `render_props`, and `<%= yield %>`
  is wrapped in `<div id="app">`. Your layout needs a `javascript_include_tag`
  and a `<%= yield %>` for these to be injected.
- `ApplicationController` gets an `ssr_context` block to enable server side
  rendering with [Humid](./humid.md).
- `ApplicationRecord` gets `member_at` and `member_by` class methods, which
  enable [digging](./digging.md#collections) into collections.
- `config/puma.rb` gets a MiniRacer context per worker for server side
  rendering in production.
- `package.json` gets `build`, `build:web`, `build:ssr`, and `build:prod`
  scripts. `build` runs the client and server builds in parallel.

## Configuration

We recommend getting familiar with the following files:

- `application_visit.ts` - Add custom functionality to Superglue navigation, e.g, progress bars.
- `page_to_page_mapping.ts` - Pairs your `props` files with your page components.
  This is generated with a glob import, so new pages are picked up automatically.
- `components/Layout.tsx` - Wraps every page. Renders flash messages and
  attaches the UJS handlers.

For more information, visit the [configuration] section.

[configuration]: configuration.md

## Scaffold

If you'd like to dive right in, you can start with a scaffold:

```terminal
rails g superglue:scaffold post body:string
```

The scaffold generates TypeScript when a `tsconfig.json` exists, and
JavaScript otherwise. Pass `--typescript` or `--no-typescript` to override.

or proceed with a [tutorial](./tutorial.md)

[SVGR]: https://react-svgr.com/
