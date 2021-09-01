# Chat app

## Short-polling

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

## Long-polling

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
