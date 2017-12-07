# Breezy

The happiness and productivity of classc Rails, with all of React and Redux.

Frontend work in React and Redux doesn't need to be tedious. Breezy returns to the productivity and happiness of classic Rails and combines it with all the goodness of React and Redux.

Breezy saves you time by shipping with an opinionated state shape for your Redux store, a set of thunks and selectors that work nicely with most usecases, a jbuilder-forked library to build your container props, and a AJAX workflow that doesn't require you to build any APIs.

# How does it work?

Here's a typical view structure in classic rails:

```
view/
- index.html.erb
```

The larger your application gets, the larger your ERB. Instead of jumping head first into the complexities of SPA and REST-ful endpoints. Breezy does the following:


```
view/
- index.js.props <- your content goes here
- index.jsx <- your markup goes here
```

The basic idea is to separate your content from your markup. Your content props lives as a tree-like structure written using jbuilder syntax. It then gets injected as props into your container component through a provided mapStateToProps selector that you can import for your react-redux connect function.

Combied with a number of provided thunks, Breezy's templating library and collection of thunks help manipulate your content tree to help you reach feature parity with other SPA frameworks.

Here are some staple features of SPAs that you can do in Breezy:

For example:
Page to page transitions without reloads
Deferred loading of parts of your page
Reload parts of your page selectively

And a quick code snippet that updates a part of your page. `visit` is a thunk that fetches a node from your prop template tree, and update the equivalent keypath in your store:

```
import {visit} from 'breezy/dist/action_creators'

store.dispatch(visit('/?_bz=a.b.c'))
```

# Installation

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

# more to come....
