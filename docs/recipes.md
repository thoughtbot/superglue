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

To make the dashboard of the page to load in typical async fashion. You would just enable deferment:

```ruby
json.dashboard(defer: :auto) do
  sleep 10
  json.total_visitors 30
end
```

When you `visit('/orders')` , BreezyTemplates will return `orders.js.props` without the dashboard, and when the page is received by the frontend, Breezy will auto-request for the missing node:

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

## Loading tab content OnClick

Say you have a 2 tabs, and you only want to show the tab 1 content on load. The tab 2 content should load only when a user clicks on tab 2.

```ruby
# /survey.js.props

json.questions do
  json.question_set_1 do
  end
  json.question_set_2(defer: :manual) do
  end
end
```

In your component

```javascript
// survey.jsx
//...in your component
  handleTab2Click = () => {
    this.remote('/survey?_bz=questions.question_set_2')
  }
  render() {
    return (
      <ol className='tabs'>
        <li> tab1 </li>
        <li> <a onClick={this.handleTab2Click}>tab2</a> </li>
      <ol>
      ....
    )
  }
```

In this example, `defer: :manual` is used on the node. BreezyTemplate will render without that node, and you need to manual request it with [node filtering](api/react-redux.md#filtering-nodes) like the example above.

## Preloading content

You can also preload other pages in a single request with the help of [Rails 5 renderers](http://blog.bigbinary.com/2016/01/08/rendering-views-outside-of-controllers-in-rails-5.html). If you do so, you should create a `PreloadController` controller and redirect when finished loading in your component.

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
last_post = Post.last
json.next_path posts_path

json.preloaded_pages [
  [edit_post_path(last_post), @renderer.render(:edit, assigns: {post: last_post})],
  [post_path(last_post), @renderer.render(:show, assigns: {post: last_post})]
]
```

Then in your page component:

```javascript
import {
  mapStateToProps,
  mapDispatchToProps,
  enhanceVisitWithBrowserBehavior
} from '@jho406/breezy'

class PreloadIndex extends React.Component {
  constructor (props) {
    super()
    const visit = enhanceVisitWithBrowserBehavior(props.visit)
    this.visit = visit.bind(this)
  }

  componentDidMount() {
    this.props.preloaded_page.forEach(([pageKey, renderedView])=>{
        this.props.saveAndProcessSJRPage(pageKey, renderedView)
    })

    this.visit(this.props.next_path) //Redirect
  }
  render () {
    return <div className='loading'>loading other resources</div>
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreloadIndex)
```

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
    this.visit = visit.bind(this)
  }

  turboVisit = () => {
    if(this.props.navigateTo('/next_page')) {
      // do nothing and let navigateTo just load and transition
    } else {
      // can't navigate due to missing cache, attempt to visit instead
      this.visit('/next_page')
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreloadIndex)
```

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
    this.visit = visit.bind(this)
  }

  onPaginateChange = (page) => {
    const pagination_path = this.props.posts
    let url = new parse(pagination_path, true)
    url.query.page_num = page
    url.query._bz = 'shoots'

    this.visit(pagination_path)
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
      this.remote('/posts?_bz=dashboard.visitors')
    })
  }
```

### Long-polling

Let's grab [react-actioncable-provider](https://github.com/cpunion/react-actioncable-provider/)

```text
yarn add react-actioncable-provider
```

#### Appending chat messages

```ruby
class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'messages'
  end

  def speak(body)
    msg = Messages.create(body: body)

    ActionCable.server.broadcast('messages',
      message: render_message(msg.id))
  end

  private

  def render_message(message_id)
    ChatController.render(
      :index,
      assigns: {
        breezy_filter: "messages.id=#{msg.id}"
      })
  end
end
```


```javascript
...
import {
  mapStateToProps,
  mapDispatchToProps,
  enhanceVisitWithBrowserBehavior
} from '@jho406/breezy'

import {ActionCable} from 'react-actioncable-provider'
import {
  extractNodeAndPath,
  parseSJR
} from '@jho406/breezy/dist/utils/helpers'

export default class ChatRoom extends React.Component {
  onReceived (rendered) {
    //first we extract the node
    const {node, pathToNode} =  extractNodeAndPath(parseSJR(rendered))

    //pathToNode is "messages.id=1", but we won't use it. Instead, we'll extend it to "messages"

    //then we extend the existing array and a new single element array
    this.props.extendInJoint({
      pageKey: this.props.pageKey,
      keypath: 'messages',
      value: [node],
    })
  }

  render () {
    return (
      <div>
        <ActionCable channel={'messages'} onReceived={this.onReceived} />
        <ul>
            {this.props.messages.map((message) =>
                <li key={message.id}>{message.body}</li>
            )}
        </ul>
        <input ref='newMessage' type='text' />
        <button onClick={this.sendMessage}>Send</button>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatRoom)
```

## Replicating Instantclick
[InstantClick](http://instantclick.io) is a neat javascript utility that speeds up your website by preloading the next page on hover. To make this work for Breezy:

```
yarn add react-hoveritent
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

    this.visit = enhanceVisitWithBrowserBehavior(visit)

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


