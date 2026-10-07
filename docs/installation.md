# Installation

!!! info "Prerequisites"
    To get started with Superglue, you'll need

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

The installer will detect your bundler and configure Superglue accordingly. It will:

- Set up the correct bundler configuration for JSX/TSX support
- Configure automatic page component discovery (for bundlers that support glob imports)
- Install the necessary dependencies

You can also specify the bundler directly to skip the interactive prompt:

```terminal
rails g superglue:install --bundler=esbuild
```

!!! example "TypeScript"
    If you prefer TypeScript:

    ```terminal
    rails g superglue:install --typescript
    ```

    Superglue also includes an optional [deepkit] integration for runtime type
    validation during development. When enabled, it validates that your server
    side props matches your TypeScript types.

    ```terminal
    rails g superglue:install --typescript --deepkit
    ```

    This is only available with TypeScript and can be added later. See the
    [working with types](./runtime-types.md) guide for more information.

The above will generate the following files:

```terminal
.
└─ app/
   └─ javascript/
      ├─ application.js
      ├─ application_visit.js
      └─ page_to_page_mapping.js
```

## Configuration

We recommend getting familiar with the following files:

- `application_visit.js` - Add custom functionality to Superglue navigation, e.g, progress bars.
- `page_to_page_mapping.js` - Pairs your `props` files with your page components.

For more information, visit the [configuration] section.

[configuration]: configuration.md

## Scaffold

If you'd like to dive right in, you can start with a scaffold:

```terminal
rails g superglue:scaffold post body:string
```

!!! example ""
    If you prefer typescript

    ```terminal
    rails g superglue:scaffold post body:string --typescript
    ```

or proceed with a [tutorial](./tutorial.md)

[deepkit]: https://github.com/marcj/deepkit