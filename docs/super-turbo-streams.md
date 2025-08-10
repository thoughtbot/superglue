# Super Turbo Streams

## vs. Turbostreams

TurboStreams is an amazing tool from the Hotwire world. Its often associated with streaming HTML updates: replacing an element, updating an element, appending/prepending an element to another element. If we step back and consider what we're sending over the wire, its less about HTML and more about content. 

When you do `broadcast_append_to :messages, @message`, you're not thinking "send some HTML." You're thinking "add this message to the messages
collection." The semantic operation is moreso about content and identity, than markup.

The same goes for Super TurboStreams, but we're using JSON instead of HTML as the delivery mechanism.

## Setting Up Streaming

Before you can broadcast updates, clients need to subscribe to streams. This requires setup on both the server and client sides.

### Server-Side: `stream_from_props`

Use `stream_from_props` in your JSON templates to generate subscription data:

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
- Handles authentication and authorization automatically

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
- Automatically handles incoming stream messages
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
## Actions

Lets imagine we have the following partials:

```
app/views/messages/_messages.json.props
app/views/messages/_message.json.props
```

### Append

Appends a rendered `.props` partial to a collection fragment. Equivalent to Turbo Stream's `append` action but operates on fragment data.

```ruby
# In a controller or model
@message.broadcast_append_to "messages"

# With custom fragment targeting
@message.broadcast_append_to "chat_room", fragment: "room_messages"

# Using later for async execution
@message.broadcast_append_to_later "messages"
```

The partial is rendered using the model's partial path and appended to the specified fragment on connected clients.

You can also save the rendered partial as a fragment with `save_to` before it appends to the target fragment.

```ruby
# In a controller or model
@message.broadcast_append_to "messages", save_to: "message-#{@message.id}"
```

### Prepend

Prepends the rendered `.props` partial to the beginning of a collection fragment.

```ruby
# Add to beginning of collection
@message.broadcast_prepend_to "messages"

# With custom fragment and stream targeting
@message.broadcast_prepend_to "notifications", fragment: "user_notifications"

# Async execution
@message.broadcast_prepend_to_later "messages"
```

You can also save the rendered partial as a fragment with `save_to` before it appends to the target fragment.

```ruby
# In a controller or model
@message.broadcast_prepend_to "messages", save_to: "message-#{@message.id}"
```

### Save

Serves the same purpose as turbostream's `replace`, and `update`. Save will update an existing fragment with new content. This is the most commonly used action for updating individual records.

```ruby
# Update existing fragment
@message.broadcast_save_to "messages"

# Save with custom fragment name
@message.broadcast_save_to "chat_room"

# Async execution
@message.broadcast_save_to_later "messages"
```

The fragment id is auto generated by using `ActionView::RecordIdentifier.dom_id` to override this you can pass in the `fragment` option.

```ruby
@message.broadcast_save_to "messages", fragment: "spotlight-message"
```

### Refresh

Triggers a page or fragment refresh on connected clients. 

```ruby
# Simple refresh
@board.broadcast_refresh_to "board_updates"

# Refresh with debouncing (prevents rapid refreshes)
@board.broadcast_refresh_to "board_updates", debounce: 1.second

# Async refresh
@board.broadcast_refresh_to_later "board_updates"
```

Refreshes are automatically debounced to prevent performance issues from rapid successive updates.

## Stream Responses

Stream responses are supported for `append`, `prepend`, and `save`.

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

and in `create.json.props`

```ruby
broadcast_append_props(model: @message)
broadcast_save_props(model: current_user)
```

### Model Configuration

Configure broadcasting behavior at the model level is also supported:

```ruby
class Message < ApplicationRecord
  include Superglue::Broadcastable
  
  # Default configuration - broadcasts to model name stream
end

class Article < ApplicationRecord
  include Superglue::Broadcastable
  
  # Custom stream and fragment
  broadcasts "articles_stream", fragment: "article_list"
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

### Broadcasting Suppression

Temporarily disable broadcasting within a block:

```ruby
suppressing_superglue_broadcasts do
  # These operations won't trigger broadcasts
  Message.create(content: "Silent message")
  @message.update(content: "Updated silently")
end
```

This is useful for bulk operations or when you want to manually control broadcast timing.