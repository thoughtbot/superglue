# Chat app

## Short-polling

Say you have a list of chat messages that you want to periodically update.
Here's a simple way to do that with a simple `setTimeout`:

```javascript
  componentDidMount() {
    this.polling = setInterval(() => {
      this.props.remote('/messages?props_at=data.messages')
    })
  }
```

And corresponding  `messages/index.json.props`

```ruby
# index.json.props

json.header do
...
end

json.messages do
  json.array! @messages do |msg|
    json.body msg.body
  end
end
```

## Long-polling

You can use a combination of Rails renderers, ActionCable, PropsTemplate
[fragments](https://github.com/thoughtbot/props_template#partial-fragments), and
to stream updates to your users.

Using the same `index.json.props` as above. Render the props using Rails renderers
and broadcast via a background job:

```ruby

renderer = MessagesController.renderer.new(
  "action_dispatch.request.parameters"=>{props_at: "data.messages.id=10"},
  "action_dispatch.request.formats"=>[Mime[:json]]
)

message = renderer.render(:index)

ActionCable.server.broadcast('web_notifications_channel', message: message)
```

?> Here were using attribute based selection with `data.messages.id=10`. See
the [traversal guide](../traversal-guide.md) for more information.

Receive the JSON on the client-side and dispatch it to your reducer:

```javascript
window.App.cable.subscriptions.create("WebNotificationsChannel", {
  received: function({message}) {
    const response = JSON.parse(message)

    store.dispatch({
      type: "UPDATE_MESSAGE",
      payload: response.data
    })
  }
})
```
