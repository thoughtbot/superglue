# Getting started

## Installation

If using Rails 6, ensure you have Webpacker and React installed. If using
Rails 7, ensure you are using esbuild (enabled with JSX in `.js`) and
have React installed.


Add the following to your Gemfile and run bundle.

```ruby
# Gemfile
gem 'superglue'
```

Run the installation generator

```text
rails superglue:install:web
```

Generate a scaffold

```text
rails generate scaffold post body:string --force --no-template-engine --superglue
```

## Configuration

The `rails superglue:install:web` step adds a [preconfigured entry point] in
`app/javascript/packs/application.js`.

## Custom Reducers
The generator will also add a `reducer.js` file for any custom reducer you'd
like to add. Included in the reducer is a `pagesReducer` for any cross-page
optimistic updates, and a `applicationRootReducer` for the entire store.

## Custom Visit and Remote

The `visit` and `remote` thunks can be customized in
`app/javascript/packs/application_visit.js`. Functionality like loading
indicators can be added there.

## Configuring Reloads

Superglue will do a hard reload whenever a successful response returns new asset
fingerprints. Add an initializer to control how Superglue tracks Sprockets and
Webpack assets:

```ruby
# defaults
Superglue.configure do |config|
  config.track_sprockets_assets = ['application.js', 'application.css']
  config.track_pack_assets = ['application.js']
end
```


[preconfigured entry point]: https://github.com/thoughtbot/Superglue/blob/main/superglue_rails/lib/install/templates/web/application.js
