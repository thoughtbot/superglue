Superglue applications are primarily server-driven, but there are times when you
need to update state on the client side without making a server request. This is
where `useSetFragment` comes in.

## When to Use Client Side Updates

Common scenarios include:

  - **Optimistic updates** - Update UI immediately, sync with server later
  - **Form state management** - Handle user input before submission
  - **UI interactions** - Toggle states, expand/collapse sections

## useSetFragment Hook

The `useSetFragment` hook returns a setter function that lets you update any
fragment by its ID:

```jsx
import React from 'react'
import { useContent, useSetFragment } from '@thoughtbot/superglue'

function ShoppingCart() {
  const content = useContent()
  const set = useSetFragment()

  const addItem = (product) => {
    set('userCart', (cartDraft) => {
      cartDraft.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      })
      cartDraft.totalCost += product.price
      cartDraft.itemCount += 1
      })
    }

  const cart = content.cart

  return (
    <div>
      <h2>Cart ({cart.itemCount} items)</h2>
      {cart.items.map(item => (
        <CartItem key={item.id} item={item} />
      ))}
      <p>Total: ${cart.totalCost}</p>
    </div>
  )
}
```

## Fragment References

The set function's first parameter can be either a string ID or a fragment
reference object:

```jsx
const set = useSetFragment()

// Using string ID
set('userCart', (cartDraft) => {
cartDraft.totalCost += 10
})

// Using fragment reference object
const cartRef = { __id: 'userCart' }
set(cartRef, (cartDraft) => {
  cartDraft.totalCost += 10
})

// Both approaches update the same fragment
```

This flexibility is especially useful when working with [fragment
references](./performance.md#preventing-over-rendering-with-fragment-refs) passed
between components:

```jsx
import React from 'react'
import { useSetFragment } from '@thoughtbot/superglue'

function PostCard({ postRef }) {
  const set = useSetFragment()

  const markAsRead = () => {
    // postRef is { __id: 'post_123' }
    set(postRef, (postDraft) => {
        postDraft.read = true
    })
  }

  return <button onClick={markAsRead}>Mark as Read</button>
}
```

## Immutable updates with Immer

The `set` function takes a fragment identifier and an updater function that
receives an Immer draft:

```jsx
const set = useSetFragment()

set('userCart', (cartDraft) => {
  cartDraft.items.push(newItem)        // Direct mutation (safe)
  cartDraft.totalCost += newItem.price // Direct assignment (safe)
})

```

Behind the scenes, Superglue takes the updated draft and uses that for the
fragment's next state.

## Nested Fragment Updates

Fragments are composable and can contain references to other fragments. If you
need to update a nested fragment, you can update them using nested `set` calls.

```jsx
import React from 'react'
import { useContent, useSetFragment} from '@thoughtbot/superglue'

function PostList() {
  const content = useContent()
  const set = useSetFragment()

  const updateFirstPost = (content) => {
    // content.posts is a fragment reference like {__id: 'postList'}
    set(content.posts, (draftList) => {
      // draftList[0] is a fragment reference like { __id: 'post_123' }
      set(draftList[0], (firstPostDraft) => {
        firstPostDraft.title = "Updated Title"
        firstPostDraft.featured = true
      })
    })
  }

  const posts = content.posts()

  return (
    <div>
      {posts.map((postRef, index) => (
        <PostCard key={index} postRef={postRef} />
      ))}
      <button onClick={updateFirstPost}>
        Feature First Post
      </button>
      </div>
  )
}
```

## Optimistic Updates with Server Sync

For optimistic updates, combine client-side updates with server requests:

```jsx
import React, { useContext } from 'react'
import { useContent, useSetFragment, NavigationContext } from '@thoughtbot/superglue'

function LikeButton({ postId }) {
  const content = useContent()
  const set = useSetFragment()
  const { remote } = useContext(NavigationContext)

  const toggleLike = async () => {
    // Optimistic update
    set(`post_${postId}`, (postDraft) => {
      postDraft.liked = !postDraft.liked
      postDraft.likeCount += postDraft.liked ? 1 : -1
    })

    try {
      // Sync with server
      await remote(`/posts/${postId}/toggle_like`, { method: 'POST' })
    } catch (error) {
      // Revert on error
      set(`post_${postId}`, (postDraft) => {
        postDraft.liked = !postDraft.liked
        postDraft.likeCount += postDraft.liked ? 1 : -1
      })
    }
  }

  const post = content.post

  return (
    <button onClick={toggleLike}>
      {post.liked ? '❤️' : '🤍'} {post.likeCount}
    </button>
  )
}
```

## Advanced Redux Scenarios

The combination of `useSetFragment`, [Fragments, and
useSetContent](./fragments.md), would be able to handle most of your state
management needs. For even more advanced use cases, we have
[conveniences](./redux.md) for you if you decide to use Redux as
your state management solution.