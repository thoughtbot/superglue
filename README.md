# Breezy

[![Build Status](https://travis-ci.org/jho406/Breezy.svg?branch=master)](https://travis-ci.org/jho406/Breezy)

Breezy is a Turbolinks inspired library for React, Redux, and Rails. It brings sanity to your frontend development while returning you to the productivity and happiness of classic Rails.

## Features

1. **The Best of Rails, React, and Redux** Use your convienent URL helpers, bring in [out-of-the-box](https://ant.design/components/button/) React components, and, when you need to, get down and dirty with Redux.
2. **Batteries Included** Be productive with Rails, React and Redux from day one with easy-to-use thunks, immutable action creators, an opinionated store shape, and scaffolds for minimal setup.
3. **API** ~~**first**~~ **later development** Save the work for when you actually need it. With Breezy, you can build SPAs [without APIs](./#how-does-it-work) and skip the hassle of building another set of routes/controllers/serializers/tests.
4. **All your resources in a single request** Move over GraphQL, classic multi-page applications already achieves this to some extent. Breezy just enhances your Rails views to make it work for React and Redux.
5. **No Javascript Router** You do not need a javascript router for SPA functionality. Breezy uses lessons learned from `Turbolinks` and just re-uses the client facing Rails routes.

## At a glance

```text
views/
  posts/
    index.js.props
    index.jsx
    show.props
    show.jsx
```

Enable it on your controller

```ruby
class TodosController < ApplicationController
  before_action :use_breezy

  def index
    @todos = Post.all
  end
end
```

Build your props in `index.js.props`

```ruby
# index.js.props
json.flash flash.to_h

json.posts do
  json.array! Post.all do |post|
    json.title post.title
    json.post_path post_path(post)
  end
end
```

And inject it to your screen component with the provided mapStateToProps

```javascript
import {
    mapStateToProps,
    mapDispatchToProps,
    withBrowserBehavior
  } from '@jho406/breezy'

class PostsIndex extends React.Component {
  constructor(props) {
    super(props)
     const {
       visit,
       remote
      } = withBrowserBehavior(props.visit, props.remote)
      this.visit = visit.bind(this)
      this.remote = remote.bind(this)
  }

  render() {
    <ul>
    {this.props.posts.map((post) => {
       return (
         <li>
           <a onClick={() => this.visit(post.post_path)}>
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

### Navigation

When the user lands on the `/posts` the `index.jsx` is rendered with `index.js.props`. SPA navigation is handled just like Turbolinks:

```javascript
this.visit("/posts/1")
```

The above will request the `show.js.props`, pass it to `show.jsx` and update the browser history.

