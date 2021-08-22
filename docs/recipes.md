# Solving Problems

## Loading content later

When parts of your page become slow, e.g, a metrics table that is expensive to
render:

```ruby
# /dashboard.json.props
json.header do
 ...
end

json.metrics do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```

A common approach is to load content in async fashion by building out another
set of routes, controllers, tests, with more work on the frontend to manage
state, call fetch, etc.

With Breezy, we can turn content async with a single setting.

```ruby
json.metrics(defer: :auto) do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```

With `defer: :auto`, PropsTemplate will render `order.json.props` as usual, but
without `json.metrics`, then when the content is received by the client, Breezy
will automatically make an `remote` request for anything that was skipped:

```javascript
remote('/dashboard?bzq=data.metrics')
```

It is up to you to handle the case when `metrics` starts out empty. For example:

```javascript
//...in your component

  render() {
    return (
      <div>
        {_.isEmpty(this.props.metrics) ? this.renderLoading() : this.renderDashboard()}
      </div>
    )
  }
```

Alternatively, you can use a placeholder like so:

```ruby
json.metrics(defer: [:auto, placeholder: {total_visitors: 0}]) do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```

## Loading tab content `onClick`

Some features require loading content `onCLick`. For example, when a user clicks
on an inactive tab to load its content async.

```ruby
# /posts.json.props

json.posts do
  json.all do
  end

  json.pending(defer: :manual) do
  end
end
```

```javascript
//...in your component
  render() {
    return (
      <ol className='tabs'>
        <li> tab1 </li>
        <li> <a href="/posts?bzq=data.posts.pending" data-bz-remote={true}>tab2</a> </li>
      <ol>
      ....
    )
  }
```

`defer: :manual` will instruct PropsTemplate to render the page without that
node. You need to manually request the missing content using
[template querying][querying guide] like the example above.

## Shopping cart

You want to update a cart count located in the header when a user clicks on "Add
to cart" on a product listing.

```javascript
  <form action='/add_to_cart?bzq=data.header.cart' method='POST' data-bz-remote={true}>
```

```ruby
def create
  ... add to cart logic here...

  # This helper will retain the `bzq` param when redirecting, which allows the
  # partial rendering of the `show` page.
  redirect_back_with_bzq fallback_url: '/'
end
```

The above will POST, and get redirected back to the original page while fetching
only the header to update.

## Chat app (Short-polling)

Say you have a list of chat messages that you want to periodically update.
Here's a simple way to do that with a simple `setTimeout`:

```javascript
  componentDidMount() {
    this.polling = setInterval(() => {
      this.props.remote('/messages?bzq=data.messages')
    })
  }
```

And corresponding  `messages/index.json.props`

```ruby
json.data(search: params['bzq'])
  json.header do
  ...
  end

  json.messages do
    json.array! @messages do |msg|
      json.body msg.body
    end
  end
end
```

## Chat app (Long-polling)

You can use a combination of Rails renderers, ActionCable, PropsTemplate
[fragments](https://github.com/thoughtbot/props_template#partial-fragments), and
preloading to stream updates to your users without much effort.

For example, if you already have an ActionCable channel setup, simply render the
props and send the rendered node over the wire:

```ruby
  # index.json.props

  json.data(search: params[:bzq]) do
    json.posts do
      json.array! @posts, partial: ['post', fragment: true] do
      end
    end
  end
```

Render and broadcast via a background job:

```ruby

renderer = PostsController.renderer.new(
  "action_dispatch.request.parameters"=>{bzq: 'data.posts.0'},
  "action_dispatch.request.formats"=>[Mime[:json]]
)

message = renderer.render(:index)

ActionCable.server.broadcast('web_notifications_channel', message: message)
```

Receive the JSON on the client-side and dispatch it to your reducer:

```javascript
window.App.cable.subscriptions.create("WebNotificationsChannel", {
  received: function({message}) {
    const response = JSON.parse(message)

    this.props.dispatch({
      type: "UPDATE_POST_FOOBAR",
      payload: response.data
    })
  }
})
```

## Replicating Turbolinks behavior

With `visit`, Breezy will always wait for a response before a navigation
transition. Turbolink's behavior is to transition first if possible while
waiting for the response. To replicate this behavior:

In your `application_visit.js` file:

```javascript

import { urlToPageKey } from '@jho406/breezy/utils/url'

const appVisit = (...args) => {

  const pageKey = urlToPageKey(args[0])
  // attempt to navigate first
  this.ref.current.navigateTo(pageKey)

  return store
    .dispatch(visit(...args))
    ....
```

## Server-Side Rendering
Breezy does not include server-side rendering out of the box, but you can easily
add it with [humid](https://github.com/thoughtbot/humid).

Follow the [instructions](https://github.com/thoughtbot/humid.md#installation).
Then create a `app/javascript/packs/server_rendering.js`:

```javascript
import React from 'react';
import { ApplicationBase } from '@jho406/breezy'
import SeatsIndex from 'views/seats/index'
import ReactDOMServer from 'react-dom/server';
require("source-map-support").install({
  retrieveSourceMap: filename => {
    console.log('--------------------hello')
    return {
      url: filename,
      map: readSourceMap(filename)
    };
  }
});

// Mapping between your props template to Component, you must add to this
// to register any new page level component you create. If you are using the
// scaffold, it will auto append the identifers for you.
//
// e.g {'posts/new': PostNew}
const identifierToComponentMapping = {
  'seats/index': SeatsIndex,
  'seats/show': SeatsIndex,
};

export default class Application extends ApplicationBase {
  mapping() {
    return identifierToComponentMapping;
  }

  visitAndRemote(navRef, store) {
    return {visit: () => {}, remote: () => {}}
  }
}

setHumidRenderer((json) => {
  const initialState = JSON.parse(json)
  return ReactDOMServer.renderToString(
    <Application
      // baseUrl={origin}
      // The global var BREEZY_INITIAL_PAGE_STATE is set by your erb
      // template, e.g., index.html.erb
      initialPage={initialState}
      // The initial path of the page, e.g., /foobar
      // path={path}
    />
  )
})
```

Modify your webpack config

```javascript
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const environment = require('./environment')
const path = require('path')
const ConfigObject = require('@rails/webpacker/package/config_types/config_object')

const webConfig = environment.toWebpackConfig()
const ssrConfig = new ConfigObject(webConfig.toObject())

ssrConfig.delete('entry')
ssrConfig.merge({
  entry: {
    server_rendering: webConfig.entry.server_rendering
  },
  resolve: {
    alias: {
      'html-dom-parser': path.resolve(__dirname, '../../node_modules/html-dom-parser/lib/html-to-dom-server')
    }
  }
})

delete webConfig.entry.server_rendering

module.exports = [ssrConfig, webConfig]
```

Replace `<div id="app">` in your ERB templates with:

```erb
<% initial_state = controller.render_to_string(@virtual_path ,formats: [:json], locals: local_assigns, layout: true) %>

<script type="text/javascript">
  window.BREEZY_INITIAL_PAGE_STATE=<%= initial_state.html_safe %>;
</script>

<div id="app">
  <%= Humid.render(initial_state).html_safe %>
</div>
```

In `application.js` change this:

```
import { render } from 'react-dom'
```

to this

```
import { hydrate } from 'react-dom'
```

and change the rest of `application.js` accordingly.

## Usage with Kaminari

SPA pagination is pretty easy to add with Kaminari and any component library you
wish to use. Let's use [antd](https://ant.design/components/pagination/) as an example:

```ruby
# index.json.props
page_num = params[:page_num]
items_per_page = 20

json.posts do
  paged_posts = @posts
    .page(page_num)
    .per(items_per_page)
    .order(created_at: :desc)

  json.list do
    json.array! paged_posts do |post|
      json.id post.id
      json.body post.body
      json.edit_post_path edit_post_path(post)
    end
  end

  json.pagination_path posts_path
  json.current paged_posts.current_page
  json.total @posts.count
  json.page_size items_per_page
end

```

Let's grab one of those fancy pagination components from
[antd](https://ant.design/components/pagination/) and some helpers

```text
yarn add antd url-parse
```

Then in your component

```javascript
class PostsIndex extends React.Component {
  onPaginateChange = (page) => {
    const pagination_path = this.props.posts
    let url = new parse(pagination_path, true)
    url.query.page_num = page
    url.query.bzq = 'shoots'

    this.props.visit(pagination_path)
  }

  render () {
    const {list, current, total} = this.props.posts

    return (
      <ul>
        {list.map(function(post){
          return <li>{post.body}</li>
        })}
        <Pagination
          showQuickJumper
          current={current}
          total={total}
          onChange={this.onPaginateChange}
        />
      </ul>
    )
  }
}

export default PostsIndex
```

## Custom reducers
Breezy generators will `yarn add reduce-reducers` and set up a `reducers.js`. If
you find yourself needing additional functionality beyond what the generated
reducers provide, just add your own reducers:

```javascript
....
import reduceReducers from 'reduce-reducers'
import {getIn} from '@jho406/breezy'
import produce from "immer"

function myCustomReducer(state = {}, action) {
  ....
}

...

const store = createStore(
  combineReducers({
    breezy: breezyReducer,
    pages: reduceReducers(pagesReducer, applicationReducer),
    additionalFoobar: myCustomReducer
  }),
  initialState,
  applyMiddleware(thunk)
)
```

[querying guide]: ./traversal-guide.md
