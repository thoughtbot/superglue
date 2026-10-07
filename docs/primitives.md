# Primitives and Patterns

Superglue's design goal is to stay away from creating user-facing features disguised as APIs. This means there's no specialized infinite scroll API, no modal library, no virtual table component. Instead we offer you a basic toolset of hooks and methods that you can compose with any React UI library you want. No lock-in.

## The Primitives

| | Primitive | What it does |
|---|---|---|
| **Read state** | `useContent` | Reactive proxy to the current page's data. Transparently resolves fragment references. |
| | `useFragment` | Reactive proxy to a single fragment by ID. Re-renders only when that fragment changes. |
| **Mutate state** | `useUpdateFragment` | Immer-based mutations on a fragment by ID. Ideal for optimistic updates. |
| | `useUpdateContent` | Immer-based mutations on a page's data by page key. |
| **Fetch** | `visit` | Full-page navigation. Fetches, saves, swaps the page component, and updates the URL. |
| | `remote` | Background fetch. Updates the store without swapping the page component or changing the URL. |
| | `props_at` (digging) | A query parameter that tells the server to return only a branch of the page. Pairs with `remote` for surgical updates. |
| **Navigate** | `copyTo` | Clone the current page to a new page key. Preserves the original for back-button navigation. |
| | `navigateTo` | Navigate to an already-cached page without fetching. Accepts `updateContent` to mutate the page during navigation. |
| **Stream** | `useStreamSource` | Subscribe to an ActionCable channel for real-time updates. |
| | Stream Actions | Server-side `broadcast_append_to`, `broadcast_prepend_to`, `broadcast_update_to` to push fragment mutations to connected clients. |

These primitives compose to cover virtually any interactive UI pattern. The rest
of this page shows how.

## Toggling Content

Modals, tabs, drawers, tooltips — they're all variations of the same idea: content
that appears in response to user interaction. Superglue handles this server-side
with conditional rendering and digging.

**The idea:** hide content behind a condition in your Rails view, then fetch just
that branch when the user acts.

=== "View"
    ```ruby
    # app/views/posts/index.json.props

    json.posts do
      json.array! @posts do |post|
        json.id post.id
        json.title post.title
      end
    end

    if @show_modal
      json.editModal do
        json.title "Edit your post"
        json.showModal true
      end
    end
    ```

=== "Controller"
    ```ruby
    # app/controllers/posts_controller.rb

    def index
      @posts = Post.all
      @show_modal = false
    end

    def new
      @posts = Post.all
      @show_modal = true
      render :index
    end
    ```

=== "Component"
    ```jsx
    // app/views/posts/index.jsx
    import { useContent } from '@thoughtbot/superglue'

    export default function PostsIndex() {
      const { posts, editModal } = useContent()

      return (
        <>
          {posts.map(post => (
            <p key={post.id}>{post.title}</p>
          ))}

          <a href="/posts/new" data-sg-visit>New Post</a>

          {editModal?.showModal && (
            <MyModal title={editModal.title} />
          )}
        </>
      )
    }
    ```

This works, but `data-sg-visit` fetches the entire page. We only need
the modal. Add `props_at` to dig for just that node:

```ruby
json.newPostPath new_post_path(props_at: "data.editModal")
```

```jsx
<a href={newPostPath} data-sg-remote>New Post</a>
```

Now Superglue fetches only `data.editModal` and grafts it into the current
page. The rest of the page is untouched.

!!! tip
    This same pattern works for tabs, drawers, and any content you want to
    load on demand. See the full [Modals recipe](./recipes/modals.md) for a
    step-by-step walkthrough.

## Deferred Loading

Sometimes content is expensive to compute — a dashboard graph, a sidebar
with analytics, a recommendations panel. Rather than blocking the whole
page, defer it.

=== "View"
    ```ruby
    # app/views/dashboard/show.json.props

    json.header do
      json.title "Dashboard"
    end

    json.metrics(defer: [:auto, placeholder: {totalVisitors: 0}]) do
      sleep 10 # expensive query
      json.totalVisitors 30
    end
    ```

=== "Component"
    ```jsx
    import { useContent } from '@thoughtbot/superglue'

    export default function DashboardShow() {
      const { header, metrics } = useContent()

      return (
        <>
          <h1>{header.title}</h1>
          <p>Visitors: {metrics.totalVisitors}</p>
        </>
      )
    }
    ```

With `defer: :auto`, Superglue renders the placeholder immediately, then
automatically fires `remote("/dashboard?props_at=data.metrics")` in the
background. When the response arrives, the component re-renders with real
data. No client-side code required.

Use `defer: :manual` when you want to control the timing yourself — for
example, loading tab content only when the user clicks:

```ruby
json.tabContent(defer: [:manual, placeholder: {}]) do
  json.details "Expensive content here"
end
```

```jsx
const { remote } = useContext(NavigationContext)

<button onClick={() => remote("/page?props_at=data.tabContent")}>
  Load Details
</button>
```

!!! info
    See the full [Deferments](./deferments.md) docs for `success_action`,
    `fail_action`, and other options.

## List Manipulation

Pagination, infinite scroll, and "load more" buttons all follow the same
underlying pattern: fetch a page of results and either replace or
concatenate them.

### Replace (pagination)

The simplest case — each page of results replaces the previous one. Use
`data-sg-visit` with `props_at` to swap just the list:

```ruby
# app/views/posts/index.json.props

json.posts do
  json.list do
    json.array! @posts do |post|
      json.id post.id
      json.body post.body
    end
  end

  json.pathToNextPage path_to_next_page(@posts, props_at: "data.posts")
  json.pathToPrevPage path_to_prev_page(@posts, props_at: "data.posts")
end
```

```jsx
{pathToNextPage && <a href={pathToNextPage} data-sg-visit>Next Page</a>}
{pathToPrevPage && <a href={pathToPrevPage} data-sg-visit>Prev Page</a>}
```

Because `props_at` targets `data.posts`, the rest of the page (header,
sidebar, etc.) is never re-fetched.

### Concatenate (infinite scroll)

Use `beforeSave` to merge the incoming results with what's already in the
store:

```jsx
const { remote, pageKey } = useContext(NavigationContext)

const beforeSave = (prevPage, receivedPage) => {
  receivedPage.data.posts.list = [
    ...prevPage.data.posts.list,
    ...receivedPage.data.posts.list
  ]
  return receivedPage
}

const loadMore = () => {
  remote(pathToNextPage, { pageKey, beforeSave })
}
```

This composes naturally with any React infinite scroll library —
`react-infinite-scroll-hook`, `react-virtuoso`, or a simple intersection
observer. Superglue handles the data; you pick the UI.

!!! tip
    See the full [Infinite Scroll recipe](./recipes/infinite-scroll.md) and
    [Pagination recipe](./recipes/spa-pagination.md) for complete examples.

## Optimistic Updates

Update the UI immediately, sync with the server in the background, and
roll back if the request fails. This is where `useUpdateFragment` shines.

```ruby
# app/views/posts/show.json.props

json.post(partial: ["post", fragment: "post_#{@post.id}"]) do
end
```

```jsx
import { useContent, useUpdateFragment, NavigationContext } from '@thoughtbot/superglue'

function LikeButton({ postId }) {
  const { post } = useContent()
  const update = useUpdateFragment()
  const { remote } = useContext(NavigationContext)

  const toggleLike = async () => {
    const previouslyLiked = post.liked
    const previousCount = post.likeCount

    // Optimistic: update immediately
    update(`post_${postId}`, (draft) => {
      draft.liked = !draft.liked
      draft.likeCount += draft.liked ? 1 : -1
    })

    try {
      await remote(`/posts/${postId}/toggle_like`, { method: 'POST' })
    } catch {
      // Revert on failure
      update(`post_${postId}`, (draft) => {
        draft.liked = previouslyLiked
        draft.likeCount = previousCount
      })
    }
  }

  return (
    <button onClick={toggleLike}>
      {post.liked ? 'Liked' : 'Like'} ({post.likeCount})
    </button>
  )
}
```

Because fragments have identity, the optimistic update is reflected
everywhere the fragment appears — across pages, in the header cart count,
in a sidebar summary — without any extra wiring.

!!! info
    See [Client-Side Updates](./client-updates.md) for more on
    `useUpdateFragment` and `useUpdateContent`.


## Real-Time Updates

Push updates from the server to all connected clients using Super Turbo
Streams. This builds on ActionCable and Rails' broadcasting conventions.

=== "View"
    ```ruby
    # app/views/messages/index.json.props

    json.streamFromMessages stream_from_props("messages")

    json.messages(partial: ["message_list", fragment: "messages"]) do
      json.array! @messages do |message|
        json.id message.id
        json.content message.content
      end
    end
    ```

=== "Component"
    ```jsx
    import { useContent, useStreamSource } from '@thoughtbot/superglue'

    export default function MessagesIndex() {
      const { streamFromMessages, messages } = useContent()
      const { connected } = useStreamSource(streamFromMessages)

      return (
        <div>
          <h1>Messages {connected ? 'Live' : 'Connecting...'}</h1>
          {messages().map(msg => (
            <p key={msg.id}>{msg.content}</p>
          ))}
        </div>
      )
    }
    ```

=== "Broadcasting"
    ```ruby
    # In a controller, model callback, or background job
    @message.broadcast_append_to "messages"
    @message.broadcast_update_to "messages"
    @message.broadcast_prepend_to "messages"
    ```

Stream Actions operate on fragments. When you `broadcast_append_to
"messages"`, the rendered partial is appended to the `"messages"` fragment
on every connected client. Components using `useContent` or `useFragment`
that access that fragment will re-render automatically.

!!! tip
    See [Super Turbo Streams](./super-turbo-streams.md) for stream
    responses, model-level configuration, `save_as`, and custom channels.


## Local State and Faceted Search

Sometimes you already have the data you need in the store and just want to
navigate to a different view of it — filtering a list, toggling a tab
state, or switching a view mode. `navigateTo` lets you do this without a
network request.

The catch: `navigateTo` requires the target page to already exist in the
store. Use `copyTo` first to clone the current page's state to the new
page key.

Why copy instead of reusing? Because each page key is its own entry in the
store. Copying preserves the original page's state so the back button
restores exactly what the user saw. Without the copy, navigating back
would show stale or missing state.

You can also mutate the copied page during navigation using `navigateTo`'s
`updateContent` option — useful for pre-filtering or resetting UI state on
the new page:

```jsx
import { useContext } from 'react'
import { NavigationContext, useContent } from '@thoughtbot/superglue'

export default function PostsIndex() {
  const { posts } = useContent()
  const { navigateTo, copyTo, pageKey, search } = useContext(NavigationContext)

  const filterActive = () => {
    const nextPageKey = pageKey + "?status=active"
    copyTo(nextPageKey)
    navigateTo(nextPageKey, {
      action: 'push',
      updateContent: (draft) => {
        draft.activeFilter = 'active'
      }
    })
  }

  const activeFilter = search.status

  const filtered = activeFilter
    ? posts.filter(p => p.status === activeFilter)
    : posts

  return (
    <>
      <button onClick={filterActive}>Active Only</button>
      {filtered.map(post => (
        <p key={post.id}>{post.title}</p>
      ))}
    </>
  )
}
```

`copyTo` clones the current page to the target key, preserving the
original for back-button navigation. Then `navigateTo` switches to the
copy, updates the URL, and optionally mutates it via `updateContent`. The
`search` object gives you the parsed query params to drive your filtering
logic.

!!! info
    See [NavigationContext](./navigation-context.md) for `action` options
    and more on `copyTo`.


## Composing Patterns

These patterns aren't isolated — they compose. A few examples:

- **Deferred tabs + digging**: Each tab uses `defer: :manual`. Clicking a
  tab fires `remote` with `props_at` to load just that tab's content.

- **Optimistic update + streaming**: Update the UI optimistically with
  `useUpdateFragment`, then let a `broadcast_update_to` from the server
  confirm or correct the state for all clients.

- **Infinite scroll + fragments**: Each item in the list is a fragment.
  Use `beforeSave` to concatenate, and `useUpdateFragment` to mutate
  individual items without re-fetching the list.

- **Local filtering + remote refresh**: Filter client-side with
  `navigateTo` for instant feedback, then fire `remote` in the background
  to fetch server-filtered results for accuracy.

The primitives are intentionally small so they can be combined freely.
When you find yourself reaching for a specialized library, check whether
a composition of these tools gets you there first.
