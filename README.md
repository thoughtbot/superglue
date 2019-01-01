# Breezy

[![Build Status](https://travis-ci.org/jho406/Breezy.svg?branch=master)](https://travis-ci.org/jho406/Breezy)

Inspired by Turbolinks, Breezy is an Ajax library and opinionated state shape for React, Redux, and Rails. It brings sanity to your frontend development while returning you to the productivity and happiness of classic Rails.

# Features

1. **The Best of Rails, React, and Redux** Use your convienent URL helpers, bring in [out-of-the-box](https://github.com/Shopify/polaris-react/) React components, and, when you need to, get down and dirty with Redux.
2. **Batteries Included** Be productive with Rails, React and Redux from day one with easy-to-use thunks, an opinionated store shape, and scaffolds for minimal setup.
3. **API** ~~**first**~~ **later development** Save the work for when you actually need it. With Breezy, you can build SPAs without APIs and skip the hassle of building another set of routes/controllers/serializers/tests.
4. **All your resources in a single request** Move over GraphQL, classic multi-page applications already achieves this. Breezy just enhances your Rails views to make it work for React and Redux.
5. **No Javascript Router** You do not need a javascript router for SPA functionality. Breezy uses lessons learned from `Turbolinks` and just re-uses the client facing Rails routes.

# Documentation

Documentation is hosted on [Gitbook](https://jho406.gitbook.io/breezy). Be sure to select the correct version. `master` will always be in development.

# At a glance

```text
views/
  posts/
    index.js.props
    index.jsx
    show.js.props
    show.jsx
```

Enable it on your controller

```ruby
class PostsController < ApplicationController
  before_action :use_breezy

  def index
    @posts = Post.all
  end
end
```

Build your props in `index.js.props`

```ruby
# index.js.props
json.flash flash.to_h

json.header do
  json.total_posts @post.count
end

json.posts do
  json.array! @posts do |post|
    json.title post.title
    json.post_path post_path(post)
  end
end
```

And inject it to your screen component with the provided `mapStateToProps`

```javascript
import {
    mapStateToProps,
    mapDispatchToProps,
    enhanceVisitWithBrowserBehavior
  } from '@jho406/breezy'

class PostsIndex extends React.Component {
  constructor(props) {
    super(props)
    const visit = enhanceVisitWithBrowserBehavior(props.visit)
    this.enhancedVisit = visit.bind(this)
  }

  render() {
    <ul>
    {this.props.posts.map((post) => {
       return (
         <li>
           <a onClick={() => this.enhancedVisit(post.postPath)}>
             {post.title}
           </a>
         </li>
       )
     })}
   </ul>
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostsIndex)
```

## SPA Navigation

When the user lands on the `/posts` the `index.jsx` is rendered with `index.js.props`. SPA navigation is handled just like Turbolinks:

```javascript
this.enhancedVisit("/posts/1") //if you've used `enhanceVisitWithBrowserBehavior`
```

The above will request the `show.js.props`, pass it to `show.jsx` and update the browser history.

## Refreshing a node

You can also refresh a node inside of `index.jsx`.

```javascript
this.props.remote("/posts?_bz=header")
```

The above will fetch the `json.header` node in `index.js.props`, noop the `json.posts` node, immutably graft it in your store, before handing it over to React to render.

# The Breezy store shape

How should you structure your store? Should I replicate my business models, like `User`, on the client side? Use an [ORM](https://github.com/tommikaikkonen/redux-orm) to manage it? How much should I denormalize or normalize? How much business logic should I bring over?

Breezy's answer is to leave most of your business logic to the backend, and instead, deal with cross-cutting presentational fragments on the frontend. In other words, lets talk in terms of "updating the user email at each page header", instead of "updating the email in the user model".

Why?

Business logic is complex and diverse across industry verticals, but the presentational aspects remain largely unchanged, there will always be a user header, a footer, a menu, a body with a list of items, etc. Breezy shapes its store with this observation in mind so that **a developer can look at a running application, easily guess the shape of the store, and make close-to-correct assumptions on how to update the store without looking at any code.**

Breezy's store shape is a unidirectional tree and falls on the extreme end of denormalization, every page is given a node in the redux tree. There is duplication of state across children for example, a shared `User` header. To update something like a shared header, you need to iterate over each page, find the header, and make updates.

This might seem tedious and prone to error, but Breezy give you tools that make it [easy](breezy-template.md#partial-fragments) to update and manage cross-cutting aspects like a shared header.

### How does it look like

Breezy occupies 2 nodes in your Redux state tree.

```javascript
{
  breezy, // <-breezy's private store.
  pages, // where the results of your props live
  ...yourStuff
}
```

`pages` is where the results of your props templates live. Its a hash where the keys are the path of your visited url. Internally, it looks like this:

```javascript
pages: {
  '/bar': {
    data: {...propsFromBreezyTemplates},
    screen: 'matchesThisPageToAComponent',
    privateOpts: {...usedByBreezyInternally} //don't touch
  },
  '/bar?foo=123': {
    data: {...propsFromBreezyTemplates},
    screen: 'matchesThisPageToAComponent',
    privateOpts: {...usedByBreezyInternally}
  },
  '/foo':{
    data: {...propsFromBreezyTemplates},
    screen: 'matchesThisPageToAComponent',
    privateOpts: {...usedByBreezyInternally}
  }
}
```

## Special Thanks

Thanks to [jbuilder](https://github.com/rails/jbuilder), [scour](https://github.com/rstacruz/scour), [turbolinks3](https://github.com/turbolinks/turbolinks-classic), [turbograft](https://github.com/Shopify/turbograft/)

