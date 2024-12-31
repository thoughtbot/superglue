# Installation

!!! info "Prerequisites"
    To get started with Superglue, you'll need

    - A javascript bundler. We'll assume esbuild with js-bundling, but you can also use vite.
    - `yarn`

Add the following to your Gemfile

```ruby
# Gemfile
gem 'superglue'
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

The above will generate the following files:

```terminal
.
└─ app/
   └─ javascript/
      ├─ slices/
      │  ├─ flash.js
      |  └─ pages.js
      ├─ actions.js
      ├─ application.js
      ├─ application_visit.js
      ├─ page_to_page_mapping.js
      └─ store.js
```


## Redux Toolkit

If you've ever encountered Redux then the files above may seem familiar to you.
Superglue works as a complete and fully functional Redux Toolkit application.
For the most part, all the functionality you would need resides in these files
and you'll make minimum edits, but they are made available if you ever need
greater control over state management.

## Configuration

We recommend getting familiar with the following files:

- `application_visit.js` - Add custom functionality to Superglue navigation, e.g, progress bars.
- `page_to_page_mapping.js` - Pairs your `props` files with your page components.
- `flash.js` - Seamlessly, integrates with the Rails flash.

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

