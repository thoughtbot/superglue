# Installation

!!! info "Prerequisites"
    To get started with Superglue, you'll need

    - A javascript bundler. We'll assume esbuild with js-bundling, but you can also use vite.
    - `yarn`

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

!!! example ""
    If you prefer typescript

    ```terminal
    rails g superglue:install --typescript
    ```


    See the [working with types](./runtime-types.md) guide for more information.

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
