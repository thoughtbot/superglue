# Super Turbo Streams

## vs. Turbostreams

TurboStreams is an amazing tool from the Hotwire world. It's often associated
with streaming HTML updates: replacing an element, updating an element,
appending/prepending an element to another element. If we step back and consider
what we're sending over the wire, it's less about HTML and more about content. 

When you do `broadcast_append_to :messages, @message`, you're not thinking "send
some HTML." You're thinking "add this message to the messages collection." The
semantic operation is more so about content and identity, than markup.

The same goes for Super Turbo Streams, but we're using JSON instead of HTML as
the delivery mechanism.

## Setting Up Streaming

Before you can broadcast updates, clients need to subscribe to streams. This requires setup on both the server and client side.

### Server-Side: `stream_from_props`

Use `stream_from_props` in your JSON templates to generate subscription data. It's the equivalent to [turbo_stream_from](https://rubydoc.info/github/hotwired/turbo-rails/main/Turbo%2FStreamsHelper:turbo_stream_from)

```ruby
# app/views/messages/index.json.props
json.header "Messages"

# Set up streaming subscription
json.streamFromMessages stream_from_props("messages")

json.messages(partial: ["message_list", fragment: "messages"]) do
  json.array! @messages do |message|
    json.id message.id
    json.content message.content
    json.author message.user.name
  end
end
```

**What `stream_from_props` does:**

- Generates secure ActionCable subscription data
- Returns `{ channel: "Superglue::StreamsChannel", signed_stream_name: "encrypted_data" }`

**Advanced usage:**

```ruby
# Custom channel with parameters
json.streamFromRoomMessages stream_from_props("room_#{@room.id}", 
  channel: RoomChannel,
  room: @room
)

# Multiple streams
json.streamFromMessages stream_from_props("messages")
json.streamFromNotifications stream_from_props("notifications")
```

### Client-Side: `useStreamSource`

Subscribe to streams in your React components using `useStreamSource`:

```jsx
// app/views/messages/index.jsx
import React from 'react'
import { useContent, useStreamSource } from '@thoughtbot/superglue'

export default function MessagesIndex() {
  const content = useContent()
  const { streamFromMessages, messages } = content
  
  // Subscribe to real-time updates
  const { connected } = useStreamSource(streamFromMessages)
  
  return (
    <div>
      <h1>Messages {connected ? '🟢' : '🔴'}</h1>
      <div id="messages">
        {messages().map(message => (
          <Message key={message.id} {...message} />
        ))}
      </div>
    </div>
  )
}
```

**What `useStreamSource` does:**

- Establishes ActionCable WebSocket connection
- Subscribes to the specific stream using the subscription data
- Handles incoming stream messages
- Provides connection status for UI feedback

**Connection status:**

```jsx
const { connected, subscription } = useStreamSource(streamFromMessages)

// Use connected for UI indicators
{connected ? '🟢 Live Updates' : '🔴 Connecting...'}

// subscription object is rarely needed (for manual operations)
```

**Multiple streams:**

```jsx
// Subscribe to multiple streams in the same component
useStreamSource(content.streamFromMessages)
useStreamSource(content.streamFromNotifications)
useStreamSource(content.streamFromPresence)
```
## Stream Actions

Lets imagine we have the following partials:

```
app/views/messages/_messages.json.props
app/views/messages/_message.json.props
```

### append

Appends a rendered `.props` partial to a collection fragment. Equivalent to Turbo Stream's `append` action but operates on fragment data.

```ruby
# In a controller or model
@message.broadcast_append_to "messages"

# With custom fragment targeting
@message.broadcast_append_to "chat_room", target: "room_messages"

# With extended options
@message.broadcast_append_to(
  [current_user, "chat_room"], 
  target: "my_message_list", 
  save_as: "message-#{@message.id}", 
  options: {}, # options for the js handler if any
  partial: "messages/_another_message",
  locals: {
    highlight: true
  }
)

# Using later for async execution
@message.broadcast_append_to_later "messages"
```

The partial is rendered using the model's partial path and appended to the specified fragment on connected clients.

You can also save the rendered partial as a fragment with `save_as` before it appends to the target fragment.

```ruby
# In a controller or model
@message.broadcast_append_to "messages", save_as: "message-#{@message.id}"
```

### prepend

Prepends the rendered `.props` partial to the beginning of a collection fragment.

```ruby
# Add to beginning of collection
@message.broadcast_prepend_to "messages"

# With custom fragment and stream targeting
@message.broadcast_prepend_to "notifications", target: "user_notifications"

# With extended options
@message.broadcast_prepend_to(
  [current_user, "chat_room"], 
  target: "my_message_list", 
  save_as: "message-#{@message.id}",
  options: {}, # options for the js handler if any
  partial: "messages/_another_message",
  locals: {
    highlight: true
  }
)

# Async execution
@message.broadcast_prepend_to_later "messages"
```

You can also save the rendered partial as a fragment with `save_as` before it appends to the target fragment.

```ruby
# In a controller or model
@message.broadcast_prepend_to "messages", save_as: "message-#{@message.id}"
```

### update

Serves the same purpose as turbostream's `replace`, and `update`. Update will update an existing fragment with new content. This is the most commonly used action for updating individual records.

```ruby
# Update existing fragment
@message.broadcast_update_to "messages"

# Update with custom fragment name
@message.broadcast_update_to "chat_room"

# With extended options
@message.broadcast_update_to(
  [current_user, "chat_room"],
  target: "custom-message-#{@message.id}",
  options: {}, # options for the js handler if any
  partial: "messages/_another_message",
  locals: {
    highlight: true
  }
)

# Async execution
@message.broadcast_update_to_later "messages"
```

The fragment id is auto generated by using `ActionView::RecordIdentifier.dom_id` to override this you can pass in the `fragment` option.

```ruby
@message.broadcast_update_to "messages", target: "spotlight-message"
```

## Stream Responses

Stream responses let you update fragments directly from a controller action
without broadcasting over ActionCable. When you `render layout: "stream"`, the
response is processed client-side exactly like a broadcast — fragments are
updated, appended to, or prepended to — but delivered as a regular HTTP response
instead of a WebSocket message.

This is useful when the current user needs immediate feedback from their own
action (e.g., creating a message) while broadcasts handle updating other
connected clients.

```ruby
class MessagesController < ApplicationController
  def create
    @message = Message.create(message_params)

    respond_to do |format|
      format.html { redirect_to messages_path }
      format.json { render layout: "stream" }
    end
  end
end
```

The `stream` layout wraps your template's output in a `StreamResponse`, setting
`action` to `"handleStreamResponse"` and including flash messages automatically.
Your `.json.props` template then uses `broadcast_*_props` helpers to define the
stream messages:

```ruby
# create.json.props
broadcast_append_props(model: @message)
broadcast_update_props(model: current_user)
```

Each `broadcast_*_props` call adds a `StreamMessage` to the response's `data`
array. They are processed in order on the client.

### `append`

Appends rendered content to the end of a collection fragment. Use this when
adding new items to a list.

```ruby
# create.json.props
broadcast_append_props(model: @message)

# With explicit target fragment
broadcast_append_props(model: @message, target: "recent_messages")

# Save the rendered partial as its own fragment before appending
broadcast_append_props(model: @message, save_target: @message)
```

### `prepend`

Prepends rendered content to the beginning of a collection fragment. Use this
when new items should appear at the top (e.g., most recent first).

```ruby
# create.json.props
broadcast_prepend_props(model: @message)

# With explicit target fragment
broadcast_prepend_props(model: @message, target: "recent_messages")

# Save the rendered partial as its own fragment before prepending
broadcast_prepend_props(model: @message, save_target: @message)
```

### `update`

Replaces an existing fragment with new content. Use this for updating individual
records that have already been rendered as fragments.

```ruby
# update.json.props
broadcast_update_props(model: @message)

# With explicit target fragment
broadcast_update_props(model: @message, target: "featured_message")
```

The target fragment ID is automatically derived from the model using
`ActionView::RecordIdentifier.dom_id` unless you specify a `target`.

!!! tip
    You don't need to update any fragments to use a stream response. If you just
    need flash messages, leave your `.json.props` template empty. The stream
    layout always includes the `flash`.

    ```ruby
    def create
      @message = Message.new(message_params)

      respond_to do |format|
        format.html { redirect_to messages_path }
        format.json do
          if @message.save
            flash[:notice] = "Message created"
          else
            flash[:error] = "Could not create message"
          end

          # use a empty create.json.props
          render layout: "stream"
        end
      end
    end
    ```

## Model Configuration

Configure broadcasting behavior at the model level is also supported:

```ruby
class Message < ApplicationRecord
  include Superglue::Broadcastable
  
  # Default configuration - broadcasts to model name stream
end

class Article < ApplicationRecord
  include Superglue::Broadcastable
  
  # Custom stream and fragment
  broadcasts "articles_stream", target: "article_list"
end

class Comment < ApplicationRecord
  include Superglue::Broadcastable
  
  # Dynamic configuration with lambdas
  broadcasts_to ->(comment) { [comment.article, :comments] },
    fragment: ->(comment) { "article_#{comment.article_id}_comments" },
    partial: "comments/comment",
    locals: { highlight: true }
end
```

## Broadcasting Suppression

Temporarily disable broadcasting within a block:

```ruby
suppressing_superglue_broadcasts do
  # These operations won't trigger broadcasts
  Message.create(content: "Silent message")
  @message.update(content: "Updated silently")
end
```

This is useful for bulk operations or when you want to manually control broadcast timing.