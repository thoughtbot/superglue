Superglue applications are primarily server-driven, but there are times when you
need to update state on the client side without making a server request. This is
where `useUpdateFragment` and `useUpdateContent` come in.

## When to Use Client Side Updates

Common scenarios include:

  - **Optimistic updates** - Update UI immediately, sync with server later
  - **Form state management** - Handle user input before submission
  - **UI interactions** - Toggle states, expand/collapse sections

## useUpdateFragment Hook

The `useUpdateFragment` hook returns a setter function that lets you update any
fragment:

```jsx
import React from 'react'
import { useContent, useUpdateFragment } from '@thoughtbot/superglue'

function ShoppingCart() {
  const content = useContent()
  const update = useUpdateFragment()

  const addItem = (product) => {
    update(content.cart, (cartDraft) => {
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

The update function's first parameter is a fragment from your content, or a
fragment reference. If you only have the fragment's ID, use `toFragmentRef` to
create a reference:

```jsx
import { useContent, useUpdateFragment, toFragmentRef } from '@thoughtbot/superglue'

const content = useContent()
const update = useUpdateFragment()

// Using a fragment from your content
update(content.cart, (cartDraft) => {
  cartDraft.totalCost += 10
})

// Using a fragment reference created from an ID
update(toFragmentRef('userCart'), (cartDraft) => {
  cartDraft.totalCost += 10
})

// Both approaches update the same fragment
```

!!! warning
    Passing a plain string ID, e.g., `update('userCart', ...)`, will not work.
    The setter throws an error if the fragment does not exist.

This flexibility is especially useful when working with [fragment
references](./performance.md#preventing-over-rendering-with-fragment-refs) passed
between components:

```jsx
import React from 'react'
import { useUpdateFragment } from '@thoughtbot/superglue'

function PostCard({ postRef }) {
  const update = useUpdateFragment()

  const markAsRead = () => {
    // postRef is { __id: 'post_123' }
    update(postRef, (postDraft) => {
        postDraft.read = true
    })
  }

  return <button onClick={markAsRead}>Mark as Read</button>
}
```

## Immutable updates with Immer

The `update` function takes a fragment or fragment reference and an updater
function that receives an Immer draft:

```jsx
const update = useUpdateFragment()

update(toFragmentRef('userCart'), (cartDraft) => {
  cartDraft.items.push(newItem)        // Direct mutation (safe)
  cartDraft.totalCost += newItem.price // Direct assignment (safe)
})
```

Behind the scenes, Superglue takes the updated draft and uses that for the
fragment's next state.

## Nested Fragment Updates

Fragments are composable and can contain references to other fragments. If you
need to update a nested fragment, you can update them using nested `update` calls.

```jsx
import React from 'react'
import { useContent, useUpdateFragment} from '@thoughtbot/superglue'

function PostList() {
  const content = useContent()
  const update = useUpdateFragment()

  const updateFirstPost = () => {
    // content.posts is a fragment reference like {__id: 'postList'}
    update(content.posts, (draftList) => {
      // draftList[0] is a fragment reference like { __id: 'post_123' }
      update(draftList[0], (firstPostDraft) => {
        firstPostDraft.title = "Updated Title"
        firstPostDraft.featured = true
      })
    })
  }

  const posts = content.posts

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

## Reverting an update

The setter returns an object with a `reset` function. Calling it restores the
fragment to the state it was in before the update:

```jsx
const update = useUpdateFragment()

const { reset } = update(content.cart, (cartDraft) => {
  cartDraft.totalCost += 10
})

// Later, undo the change
reset()
```

`reset` restores a snapshot taken when `update` was called, so any changes
made to the fragment after that, including ones from the server, are
overwritten.

## useUpdateContent Hook

The `useUpdateContent` hook lets you update any page's content by its pageKey:

```jsx
import { useUpdateContent } from '@thoughtbot/superglue'

function MyComponent() {
  const updateContent = useUpdateContent()

  const handleClick = () => {
    updateContent('/posts', (draft) => {
      draft.title = "Updated Title"
    })
  }

  return <button onClick={handleClick}>Update</button>
}
```

## Optimistic Updates with Server Sync

For optimistic updates, combine client-side updates with server requests, and
use `reset` to revert if the request fails. Note that `remote` resolves with
`hasError: true` when the server responds with an error status, and only
rejects when the request itself fails, for example on a network error. See
[results and errors](./requests.md#results-and-errors) for more.

```jsx
import React, { useContext } from 'react'
import { useContent, useUpdateFragment, toFragmentRef, NavigationContext } from '@thoughtbot/superglue'

function LikeButton({ postId }) {
  const content = useContent()
  const update = useUpdateFragment()
  const { remote } = useContext(NavigationContext)

  const toggleLike = async () => {
    // Optimistic update
    const { reset } = update(toFragmentRef(`post_${postId}`), (postDraft) => {
      postDraft.liked = !postDraft.liked
      postDraft.likeCount += postDraft.liked ? 1 : -1
    })

    try {
      // Sync with server
      const result = await remote(`/posts/${postId}/toggle_like`, { method: 'POST' })

      if (result.hasError) {
        reset()
      }
    } catch (error) {
      reset()
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