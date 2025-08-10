# The store shape

Superglue occupies 3 nodes in a redux state tree:

```javascript
{
  superglue: {
    csrfToken,
    currentPageKey,
    pathname,
    search,
    hash,
  },
  pages: {
    '/dashboard': { ..page received from `/dashboard`.. },
    '/posts?foo=123': {... page received from `/posts?foo=123` },
  },
  fragments: {}
}
```

## `superglue`
The `superglue` node contains information about your application that you may
find useful. You may read from this store, but do not write.

## `pages`
The `pages` node is where rendered [pages] live. It's a hash where the keys are
the pathname + query of your url, known throughout the documentation as
`pageKey`, and the values are received JSON responses.

The `pageKey` does not include the location hash of your URL. This is by design,
Superglue ignores the location hash and falls back to browser defaults. So while
you can visit `/posts#foo` and `/posts` in the browser, Superglue will store
both as `/posts`.

[pages]: ./page-response.md

### `fragments`

[Fragments](./fragments.md) are rendered Rails partials with an identity. They're created when a
response is recieved. Superglue takes the payload and [denormalizes](./fragments.md#denormalization) it into
fragments and fragment refs.

```js
  { 
    ...,
    pages: {
      "/messages": {
        data: {
          title: "Chat Room",
          messages: { __id: "chat_messages" },  // Fragment reference
          user: { __id: "current_user" }
        }
      }
    },
    fragments: {
      "chat_messages": [
        { id: 1, content: "Hello", author: "John" },
        { id: 2, content: "Hi there", author: "Jane" }
      ],
      "current_user": {
        name: "John Doe",
        avatar: "/avatars/john.jpg"
      }
    }
  }
```