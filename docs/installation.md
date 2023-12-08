# Getting started

## Installation

Ensure you are using esbuild (enabled with JSX in `.js`)


Add the following to your Gemfile

```ruby
# Gemfile
gem 'superglue'
```

Run bundle and the installation generator:

```terminal
bundle
rails superglue:install:web
```

## Contents
The above will also generate a redux toolkit starter that's
configured to work with Superglue. You'll find:

- A [slice for the flash] that works with the Rails flash
- A pages slice that can be used for [custom reducers]
- And `application_visit.js` that can be used to add before and
  after behavior for [visit and remote]
- A `store.js` that puts the above together
- And a [pre-configured entry point] in
  `app/javascript/packs/application.js`

For more information, visit the [react redux] section.

  [preconfigured entry point]: https://github.com/thoughtbot/Superglue/blob/main/superglue_rails/lib/install/templates/web/application.js
  [slice for the flash]: rails.md#rails-flash
  [visit and remote]: navigation.md#visit-and-remote
  [custom reducers]: ./recipes/custom-reducers.md
  [react redux]: react-redux.md

### Scaffold

If you'd like to dive right in, you can work with a scaffold.

```terminal
rails generate scaffold post body:string --force --no-template-engine --superglue
```

or proceed with a [tutorial](./tutorial.md)
