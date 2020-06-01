# Solving Problems

## Loading content later

When parts of your page become slow, for example, a metrics table that takes a long time to generate because of some expensive operation:

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

A common approach is to load content in async fashion by building out another set of routes, controllers, tests, with more work on the frontend to manage state, call fetch, etc. With Breezy, we can load async content in a single setting.

```ruby
json.metrics(defer: :auto) do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```

With `defer: :auto`, PropsTemplate will render `order.json.props` as usual, but without `json.metrics`, then when the content is received by the client, Breezy will automatically make an `remote` request for anything that was skipped:

```javascript
remote('/dashboard?bzq=data.metrics')
```

It is up to you to handle the case when `metrics` starts out empty. For example:

```javascript
// orders.jsx
//...in your component

  render() {
    return (
      <div>
        {_.isEmpty(this.props.metrics) ? this.renderLoading() : this.renderDashboard()}
      </div>
    )
  }
```

Note that you can add a placeholder like so:

```ruby
json.metrics(defer: [:auto, placeholder: {}]) do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```


## Loading tab content `onClick`

Say you have two tabs of content, and the content from the second tab takes a bit of time to load. Since the 2nd tab is inactive on a first visit anyway, you decided to load the 2nd tab only if a user clicks it.

With Breezy, this is a few lines of code:

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
  handleClick = () => {
    this.props.remote('/posts?bzq=data.posts.pending')
  }

  render() {
    return (
      <ol className='tabs'>
        <li> tab1 </li>
        <li> <a onClick={this.handleClick}>tab2</a> </li>
      <ol>
      ....
    )
  }
```

In this example, `defer: :manual` is used on the node. PropsTemplate will render without that node, and you need to manually request it using [traversals](docs/traversal-guide.md) like the example above.


## Shopping cart

You want to update a cart count located in the header when a user clicks on 'Add to cart' on a product listing

```javascript
//...in your submit handler
handleSubmit = () => {
  this.props.remote('/add_to_cart?bzq=data.header.cart', {method: 'POST', body: {.....}})
}
```

```ruby
def create
  redirect_to :back, bzq: params[:bzq]
end
```

Recall that since Breezy makes an immutable update to the store, your component will update as appropriate.

## Chat app (Short-polling)

Say you have a list of chat messages that you want to periodically update. Here's a simple way to do that with a simple `setTimeout`:

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

You can use a combination of Rails 5 renderers, ActionCable, PropsTemplate  [fragments](props_template/README.md#partial-fragments) and preloading to stream updates to your users without much effort.

For example, if you already have a ActionCable channel setup, simply render the props and send it over the wire:

```ruby
renderer = PostsController.renderer.new(
  "action_dispatch.request.parameters"=>{bzq: 'data.posts.0'},
  "action_dispatch.request.formats"=>[Mime[:json]]
)

msg = renderer.render(:index)

ActionCable.server.broadcast('web_notifications_channel', message: msg)
```

```javascript
window.App.cable.subscriptions.create("WebNotificationsChannel", {
  received: function({message}) {
    this.props.saveAndProcessPage(null, message),
  }
})
```

```ruby
  json.data(search: params[:bzq]) do
    json.posts do
      json.array! @posts, partial: ['post', fragment: true] do
      end
    end
  end
```

`saveAndProcessPage(pageKey, page)` is the function that `remote` uses to sends a payload to. However, because we don't know what pageKey to save this streamed response, we set it to `null`. Breezy will still update any cross-cutting [fragments](props_template/README.md#partial-fragments)


## Replicating Turbolinks behavior

With `visit`, Breezy will always wait for a response before a navigation transition. Turbolink's behavior is to transition first if possible while waiting for the response. To replicate this behavior:

```javascript
import {
  mapStateToProps,
  mapDispatchToProps,
  enhanceVisitWithBrowserBehavior
} from '@jho406/breezy'

class SurveyIndex extends React.Component {
  constructor (props) {
    super()
    const visit = enhanceVisitWithBrowserBehavior(props.visit)
    this.enhancedVisit = visit.bind(this)
  }

  turboVisit = () => {
    // Navigate if possible
    if(this.props.navigateTo('/next_page')) {
      //load the latest page async
      this.props.remote('/next_page')
    } else {
      // can't navigate due to missing cache, attempt to visit instead
      this.enhancedVisit('/next_page')
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreloadIndex)
```


## Usage with Devise

For Breezy to work with Devise, you'll need the following:

A custom failure app:

```ruby
require 'breezy/xhr_headers'

class BreezyDeviseFailureApp < Devise::FailureApp
  include Breezy::XHRHeaders

  def skip_format?
    %w(html jsson */*).include? request_format.to_s
  end

  def http_auth?
    if request.xhr? && request.format != :json
      Devise.http_authenticatable_on_xhr
    else
      !(request_format && is_navigational_format?)
    end
  end
end
```

A custom responder to use in your devise controllers

```ruby

class BreezyResponder < ActionController::Responder
  include Responders::FlashResponder
  include Responders::HttpCacheResponder

  def to_js
    set_flash_message! if set_flash_message?
    default_render
  rescue ActionView::MissingTemplate => e
    breezy_behavior(e)
  end

  def breezy_behavior(e)
    if get?
      raise error
    elsif has_errors? && default_action
      action = rendering_options[:action]
      controller_name = @controller.controller_name
      content_location = @controller.url_for(action: action, controller: controller_name, only_path: true)
      @controller.response.set_header("content-location", content_location)

      render rendering_options
    else
      redirect_to navigation_location
    end
  end
end
```

In your Devise controllers
```ruby
class Users::PasswordsController < Devise::PasswordsController
  layout 'application'
  self.responder = BreezyResponder

  respond_to :html, :json
end

```

And finally, in your Devise initializer

```ruby
Devise.setup do |config|
  config.navigational_formats = ['*/*', :html, :js]

  config.warden do |manager|
    manager.failure_app = BreezyDeviseFailureApp
  end
end
```

## Usage with Kaminari

SPA Pagination is pretty easy to add with Kaminari and component from [antd](https://ant.design/components/pagination/)

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

Let's grab one of those fancy pagination components from [antd](https://ant.design/components/pagination/) and some helpers

```text
yarn add antd url-parse
```

Then in your component

```javascript
import {
  mapStateToProps,
  mapDispatchToProps,
  enhanceVisitWithBrowserBehavior
} from '@jho406/breezy'
import { Pagination } from 'antd'
import parse from 'url-parse'

class PostsIndex extends React.Component {
  constructor (props) {
    super()
    const visit = enhanceVisitWithBrowserBehavior(props.visit)
    this.enhancedVisit = visit.bind(this)
  }

  onPaginateChange = (page) => {
    const pagination_path = this.props.posts
    let url = new parse(pagination_path, true)
    url.query.page_num = page
    url.query.bzq = 'shoots'

    this.enhancedVisit(pagination_path)
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostsIndex)

```

## Custom reducers
Breezy generators will `yarn add reduce-reducers` and set up a `reducers.js`. If you find yourself needing additional functionality beyond what the generated reducers provide, just add your own reducers:

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
