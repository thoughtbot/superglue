# Installation

!!! info "Prerequisite"
    To get started with Superglue, the only prerequisite is to be setup with a javascript
    bundler. We'll assume esbuild with js-bundling, but you can also use vite.

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

The above will generate the following files:

```terminal
.
└─ app/
   |─ views/
   |  ├─ layouts/
   │  |  └─ application.json.props
   └─ javascript/
      ├─ components/
      │  ├─ index.js
      │  ├─ Inputs.js
      |  └─ Layout.js
      ├─ slices/
      │  ├─ flash.js
      |  └─ pages.js
      ├─ actions.js
      ├─ application.js
      ├─ application_visit.js
      ├─ page_to_page_mapping.js
      └─ store.js
```

## Redux toolkit

If you've ever encountered Redux then the files above may seem familiar to you.
Superglue works as a complete and fully functional Redux toolkit application.
For the most part, all the functionality you would need resides in these files
and you'll make minimum edits, but they are made available if you ever need
greater control over state management.

## Configuration

We recommend getting familiar with the following files:

- `application_visit.js` - Add custom functionality to Superglue navigation, e.g, progress bars.
- `page_to_page_mapping.js` - Pairs your `props` files with your page components.
- `flash.js` - Seamlessly, integrates with the Rails flash.
- `components/Inputs.js` - [Vanilla] input wrappers that pair with [form_props].

For more information, visit the [configuration] section.

[configuration]: configuration.md
[Vanilla]: https://github.com/thoughtbot/candy_wrapper
[form_props]: https://github.com/thoughtbot/form_props

## Scaffold

If you'd like to dive right in, you can start with a scaffold:

```terminal
rails generate superglue:scaffold post body:string
```

or proceed with a [tutorial](./tutorial.md)

