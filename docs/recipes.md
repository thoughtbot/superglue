# Solving Problems

## Loading content later

Say you add a dashboard to you page, and eventually that part of the page becomes a bottleneck. For example:

```ruby
# /orders.js.props
json.header do
 ...
end

json.dashboard do
  sleep 10 # extremely slow content
  json.total_visitors 30
end
```

To make the dashboard of the page to load in typical async fashion, enable deferment on the node:

```ruby
json.dashboard(defer: :auto) do
  sleep 10
  json.total_visitors 30
end
```

When you `visit('/orders')` , BreezyTemplates render `orders.js.props` without the dashboard, and when the page is received by the frontend, Breezy will auto-request for the missing node:

```javascript
remote('/orders?_bz=dashboard', ....otherOpts...)
```

Its up to you to handle both cases in your Component. For example:

```javascript
// orders.jsx
//...in your component

  render() {
    return (
      <div>
        {this.props.dashboard ? this.renderLoading() : this.renderDashboard()}
      </div>
    )
  }
```

[See this in action](https://github.com/jho406/polaris-breezy-kitchen-sink/commit/412eff42835703e5279dfb21015ea5d048c6b8cc)

## Loading tab content OnClick

Say you have a 2 tabs, and you only want to show the tab 1 content on load. The tab 2 content should load only when a user clicks on tab 2.

```ruby
# /posts.js.props

json.posts do
  json.all do
  end
  json.pending (defer: :manual) do
  end
end
```

In your component

```javascript
// survey.jsx
//...in your component
  handleClick = () => {
    this.props.remote('/posts?_bz=posts.pending')
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

In this example, `defer: :manual` is used on the node. BreezyTemplate will render without that node, and you need to manual request it with [node filtering](api/react-redux.md#filtering-nodes) like the example above.

If you need to send over a list of fake line items, you can use the following approach:

```ruby
json.posts do
  json.all do
  ...
  end

  if request.format.html?
    # The pending tab will initially be fake
    json.pending nil, partial: 'fake_posts_list'
  else
    # Then a manual this.props.remote for the real thing
    json.pending do
    ...
    end
end
```

[See this in action](https://github.com/jho406/polaris-breezy-kitchen-sink/commit/103c0201ce156d3b7fc787b94559af4c5a439c31)


## Preloading content

You can also preload other pages in a single request with the help of [Rails 5 renderers](http://blog.bigbinary.com/2016/01/08/rendering-views-outside-of-controllers-in-rails-5.html). If you do so, make sure you clear out the initial preloads in your page state in `componentDidMount`.

For example:

```ruby
class PreloadController < ApplicationController
  def index
    @renderer = self.class.renderer.new(request.env)
  end
end
```

```ruby
# /preload/index.js.props
if request.format.html?
  json.preloaded_pages [
    [edit_post_path(last_updated_post), @renderer.render(:edit, assigns: {post: last_updated_post})],
  ]
end
```

Add a reducer to remove the preloaded_pages:

```javascript

  //Somewhere in your reducer
   import {getIn} from '@jho406/breezy'
   ...
   case 'CLEAR_PRELOADED': {
     const { pageKey } = action.payload
     const keyPath = [pageKey, 'data'].join('.')

      return produce(state, draft => {
       const node = getIn(draft, keyPath)
       delete node['preloadedPages']
     })
   }
```

Then in your page component:

```javascript
 preloadThenClear = () => {
   const {
     preloadedPages,
     pageKey,
     saveAndProcessSJRPage,
     clearPreloaded
   } = this.props

    if (preloadedPages) {
     preloadedPages.forEach(([preloadPageKey, renderedView])=>{
       saveAndProcessSJRPage(preloadPageKey, renderedView)
     })

      clearPreloaded(pageKey)
   }
 }

 componentDidMount() {
   this.preloadThenClear()
 }
```

[See this in action](https://github.com/jho406/polaris-breezy-kitchen-sink/commit/d58218e82b95af51c49b2a22a42969a15a81fb01)


## Replicating Turbolinks behavior

The old Turbolinks 3 behavior is to load the page from cache if you have it, if not, make a request for the missing page.

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
    if(this.props.navigateTo('/next_page')) {
      // do nothing and let navigateTo just load and transition
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

[See this in action](https://github.com/jho406/polaris-breezy-kitchen-sink/commit/3496f5359bbdcceaae1af4e06cda3196aef420af)

## Usage with Devise

For Breezy to work with devise, you'll need the following:

A custom failure app:

```ruby
require 'breezy/xhr_headers'

class BreezyDeviseFailureApp < Devise::FailureApp
  include Breezy::XHRHeaders

  def skip_format?
    %w(html js */*).include? request_format.to_s
  end

  def http_auth?
    if request.xhr? && request.format != :js
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

  before_action :use_breezy
  respond_to :html, :js
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
# index.js.props
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
    url.query._bz = 'shoots'

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

[See this in action](https://github.com/jho406/polaris-breezy-kitchen-sink/commit/2c6820e31dd7fb0102bae585b93ea93dcf22d71a)

## Streaming Updates

### Short-polling

Say you have a dashboard screen, and you want to periodically fetch updates for a specific metric. Here's a simple way to do that with just a simple `setTimeout`:

```ruby
# post/index.js.props

json.header do
...
end

json.dashboard do
  json.visitors do
    json.total rand(1..30)
  end

  json.page_views do
    json.total rand(1..30)
  end
end

json.posts do
 ...
end
```

Then when you build the component

```javascript
  componentDidMount() {
    this.polling = setInterval(() => {
      this.props.remote('/posts?_bz=dashboard.visitors')
    })
  }
```

### Long-polling

#### Updating nodes
You can use a combination of Rails 5 renderers, ActionCable and preloading to stream updates to your users without much effort.

For example, if you already have a ActionCable channel setup, simply render the props and send it over the wire:

```ruby
renderer = PostsController.renderer.new(
  "action_dispatch.request.parameters"=>{_bz: 'posts.all.items.0'},
  "action_dispatch.request.formats"=>[Mime[:js]]
)

msg = renderer.render(:index)

ActionCable.server.broadcast('web_notifications_channel', message: msg)
```

```javascript
import {
  extractNodeAndPath,
  parseSJR
} from '@jho406/breezy/dist/utils/helpers'

window.App.cable.subscriptions.create("WebNotificationsChannel", {
  received: function({message}) {
    const {node} =  extractNodeAndPath(parseSJR(message))
    store.dispatch({
      type: 'UPDATE_ALL_POST_FRAGMENTS',
      payload: node
    })
  }
})
```

## Replicating Instantclick
[InstantClick](http://instantclick.io) is a neat javascript utility that speeds up your website by preloading the next page on hover. To make this work for Breezy:

```
yarn add react-hoverintent
```

Then create your own visit function with instaclick behavior like the below. Note that we are using the `ensureSingleVisit` action creator (which powers Breezy's `visit`) and the unenhanced version of the `visit` that you receive through the props.

```javascript
import {
  mapStateToProps,
  mapDispatchToProps,
  enhanceVisitWithBrowserBehavior
} from '@jho406/breezy'
import HoverIntent from 'react-hoverintent'

class PostsIndex extends React.Component {
  constructor (props) {
    super()
    const {
      visit,
      remote,
      pageKey
    } = props

    this.enhancedVisit = enhanceVisitWithBrowserBehavior(visit)

    this.instaVisit = enhanceWithBrowserBehavior(() => {
      return this.props.ensureSingleVisit(()=> {
        // return a copy of the promise
        return this.state.instaPromise.then((v) => v)
      })
    })
  }

  prefetch = (...fetchArgs) => {
    // Here we use the unwrapped visit from props
    this.setState({
      instaPromise: this.props.visit(...fetchArgs)
    })
  }

  render () {
    return (
      <HoverIntent
        onMouseOver={() => this.prefetch('/foo')}
        sensitivity={10}
        interval={1000}
        timeout={250}
      >
        <a onClick={this.instaVisit}> </a>
      </HoverIntent>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostsIndex)

```

## Custom reducers
Breezy generators will `yarn add reduce-reducers` and set up a `reducers.js` to use to manipulate `pages`. If you find yourself needing additional functionality beyond what the generated reducers provide, just add your own reducers:

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
