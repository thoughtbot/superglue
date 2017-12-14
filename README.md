# Breezy

Frontend work in React and Redux doesn't need to be tedious. Breezy returns to the productivity and happiness of vanilla Rails and combines it with all the goodness of React and Redux.

Breezy saves you time by shipping with an opinionated state shape for your Redux store, a set of thunks and selectors that work nicely with most usecases, a jbuilder-forked library to build your container props, and a AJAX workflow that doesn't require you to build any APIs.

## Features
1. **A vanilla Rails workflow.** Breezy lets you use a classic multi-page workflow and still get all the benefits of React. Its like replacing ERB with JSX.
2. **No Private APIs.** Want a SPA, but don't like the hassle of building a another set of routes for your API? With Breezy, you don't need to!
2. **Less Javascript.** Go ahead and use your `link_to` helpers. Use your i18n helpers!
3. **Mix normal HTML and React pages.** Need some pages to be in React and some pages, maybe the login page, to be in plain ERB? No Problem!
4. **Use Rails routing.** You don't need a javascript router.
5. **Want to build React-native using the same Rails workflow?** We're working on it!

## How does it work?

Here's a typical view structure in classic rails:

```
views/
  posts/
    index.html.erb
```

The larger your application gets, the larger your ERB. Instead of jumping head first into the complexities of SPA and REST-ful endpoints. Breezy does the following:

```
views/
  posts/
    index.js.props <- your content goes here
    index.jsx <- your markup goes here
```

The idea is to separate your content from your markup. Your content props lives as a tree-like structure written using jbuilder syntax. It then gets injected as props into your container component through a provided mapStateToProps selector that you can import for your react-redux connect function.

Then use one of the provided thunks for SPA functionality. For example:

1. Selectively reload parts of your page:
```
import {remote} from 'breezy/dist/action_creators'


store.dispatch(remote('?_bz='header.shopping_cart'))
```
The above will fetch a node from `index.js.props`, and update the equivalent keypath in your store.


2. Or page-to-page without reloading:

```
import {visit} from 'breezy/dist/action_creators'


store.dispatch(visit('show')).then((page)=>{
  this.props.navigateTo('ShowScreen') //<- Breezy will also take care of managing the browser history
})
```


## The Breezy store shape
Breezy occupies 2 nodes in your state tree.

```
{
  breezy, // <-where
  pages, // where the results of your props live
}
```

Pages is where the results of your props templates live. Its a hash where the keys are the path of your visited url. A visit to `/show?foo=123` and `/show?foo=456` would result in two seperate entries on page. This means its very likely to have duplicated state living across multiple pages. For example, a header being duplicated across multiple pages.

Instead of normalizing state, Breezy makes it easy to update cross-cutting concerns like a shared header by using existing Rails tooling, partials.

For example:
```
json.header do
  json.cart 30
end
...
```

Extract your header into a partial and add the option `joint: true`
```
json.header partial: ['header', joint: true]
```

Now any requests that come with new headers will automatically update the same headers across all pages. You can also set it manually using the `setInJoint`, `delInJoint`, and `extendInJoint` helpers. For example:

```
  store.dispatch(setInJoint('header', 'cart', 50))
```

## Installation

Make sure you have webpacker installed on your Rails application

1. Install BreezyJS

```
yarn add breezy --save
```

2. Add the following to your Gemfile and run bundle
```
gem 'breezy'
```

3. Run the installation generator
```
rails breezy:install:web
```

4. Generate a view
```
rails g breezy:view Post index
```
