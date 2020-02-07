# Breezy

[![Build Status](https://travis-ci.org/jho406/Breezy.svg?branch=master)](https://travis-ci.org/jho406/Breezy)

Breezy is a "Deliver everything first, update later" library for React, Redux and *classic* Rails.

# Features

1. **It "is" classic Rails**. Breezy does *NOT* try to bring Rails conventions to React and Redux. Rather, it creates a conceptual match between Rails and Rails/Redux such that "it IS classic Rails". For example:
```
views/
  posts/
    index.json.props
    index.jsx
```
2. **The Best of Rails, React, and Redux** Use your convienent URL helpers, bring in [out-of-the-box](https://github.com/Shopify/polaris-react/) React components, and, when you need to, get down and dirty with Redux.
3. **Batteries Included** Be productive with Rails, React and Redux from day one with easy-to-use thunks, an opinionated store shape, and scaffolds for minimal setup.
4. **API** ~~**first**~~ **later development** Save the work for when you actually need it. With Breezy, you can build SPAs without APIs and skip the hassle of building another set of routes/controllers/serializers/tests.
5. **All your resources in a single request** Move over GraphQL, classic multi-page applications already achieves this. Breezy just enhances your Rails views to make it work for React and Redux.
6. **No Javascript Router** You do not need a javascript router for SPA functionality. Breezy uses lessons learned from `Turbolinks` and just re-uses the client facing Rails routes.

# Documentation

Documentation is hosted on [Gitbook](https://jho406.gitbook.io/breezy). Be sure to select the correct version. `master` will always be in development.

# At a glance
## Deliver everything first

```text
views/
  posts/
    index.json.props
    index.jsx
    show.json.props
    show.jsx
```

Build your props in `index.json.props`

```ruby
# index.json.props
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

### SPA Navigation

When the user lands on the `/posts`, `index.jsx` is rendered with `index.json.props`, and `show.jsx` and `index.jsx` is packaged together in your webpack. SPA navigation is handled just like Turbolinks:

```javascript
this.enhancedVisit("/posts/1") //if you've used `enhanceVisitWithBrowserBehavior`
```

The above will request the `show.json.props`, pass it to `show.jsx`, swap out the current `index.jsx` and update the browser history.

## Update Later

Update parts of your appication later. For example, inside of `index.jsx`.

```javascript
this.props.remote("/posts?bzq=header")
```

The above will fetch the `json.header` node in `index.json.props`, skip rendering of the `json.posts`, immutably graft it in your Redux store, before leaving it to React to re-render.

# The Breezy store shape

How should you structure your store? Should I replicate my business models, like `User`, on the client side? Use an [ORM](https://github.com/tommikaikkonen/redux-orm) to manage it? How much should I denormalize or normalize? How much business logic should I bring over?

Breezy's answer is to leave most of your business logic to the backend, and instead, deal with cross-cutting presentational fragments on the frontend. In other words, lets talk in terms of "updating the user email at each page header", instead of "updating the email in the user model".

Why?

Business logic is complex and diverse across industry verticals, but the presentational aspects remain largely unchanged, there will always be a user header, a footer, a menu, a body with a list of items, etc. Breezy shapes its store with this observation in mind so that **a developer can look at a running application, easily guess the shape of the store, and make close-to-correct assumptions on how to update the store without looking at any code.**

Breezy's store shape is a unidirectional tree and falls on the extreme end of denormalization, every page is given a node in the redux tree. There is duplication of state across children for example, a shared `User` header. To update something like a shared header, you need to iterate over each page, find the header, and make updates.

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
    data: {...propsFromPropsTemplates},
    screen: 'matchesThisPageToAComponent',
    privateOpts: {...usedByBreezyInternally} //don't touch
  },
  '/bar?foo=123': {
    data: {...propsFromPropsTemplates},
    screen: 'matchesThisPageToAComponent',
    privateOpts: {...usedByBreezyInternally}
  },
  '/foo':{
    data: {...propsFromPropsTemplates},
    screen: 'matchesThisPageToAComponent',
    privateOpts: {...usedByBreezyInternally}
  }
}
```

## Special Thanks

Thanks to [jbuilder](https://github.com/rails/jbuilder), [scour](https://github.com/rstacruz/scour), [turbolinks3](https://github.com/turbolinks/turbolinks-classic), [turbograft](https://github.com/Shopify/turbograft/)

