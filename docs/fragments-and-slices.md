# Fragments and Slices

When building pages, we commonly use partials to extract crosscutting concerns.
For example, a shared header:

```
views/
  application/
    _header.json.props
  posts/
    index.json.props
  comments/
    index.json.props
```

By [design](./redux-state-shape.md) this results in duplicate JSON nodes
across our `pages` slice:

```json
{
  pages: {
    "/posts": {
      data: {
        header: {
          email: "foo@foo.com"
        }
      }
    },
    "/comments": {
      data: {
        header: {
          email: "foo@foo.com"
        }
      }
    },
  }
}
```

Superglue fragments, and Redux slices are two recommended ways for updating cross-cutting
concerns.

# Fragments

A fragment in Superglue is a rendered partial with a given name:

```
  json.body do
    json.side_bar partial: ["application/side_bar", fragment: "some_user_side_bar_type"]
  end
```

By indicating that a partial is a fragment, we store the name of the fragment,
and the path where it was found. This metadata is then rendered at the top
level of the [page response].

This has been set up for you in `application.json.props`:

```ruby
json.data(search: path) do
  yield json
end

json.fragments json.fragments!
```

The resulting JSON looks like this:

```json
data: {
  ...
},
fragments: [
  { type: :some_user_side_bar_type, partial: 'application/side_bar', path: 'body.sidebar' },
]
```

?> Fragments used in nodes that are [deferred](./navigation.md#deferments) do
not show up inside the metadata until the deferred nodes are loaded.

## Automatic updates

Fragments are automatically updated in two cases:

1. When a new page loads with a fragment Superglue will look at the page store and
update nodes marked with the same fragment name across all pages. For example,
a header that appears across multiple pages. This is similar to the idea of
a [Turbo-Frame](https://turbo.hotwired.dev/handbook/frames).

2. If you use a custom reducer to update the fragment, fragments of the same
name across all pages will also update. This behavior is controlled by a
`fragmentMiddleware`. This is included when generating a superglue app in
your `store.js` file.

You can turn this behavior off by removing the middleware.

## Slices

Fragments are a lightweight solution to updating cross cutting concerns. With
more complex needs, a Redux slice is recommended. Superglue has a few helpers
that can make this process easier.

### InitialState
You can render your slice's initial state in the [slices] `key` of the page
object, it'll be merged with the `initialState` passed to your `buildStore`
function in your [application.js](./react-redux.md#applicationbase)


### extraReducers
Use Superglue's redux actions in your slice's [extraReducers] to modify state
in response to lifecycle events. The `flashSlice` that was generated
with the installation is a good example of this.

`BEFORE_FETCH` - Action created before a before a fetch is called.

```
{
  type: "@@superglue/BEFORE_FETCH",
  payload: [..array args that are passed to fetch]
}
```

`BEFORE_VISIT` - Same as above, but called only for a [visit] action.

```
{
  type: "@@superglue/BEFORE_VISIT",
  payload: [..array args that are passed to fetch]
}
```

`BEFORE_REMOTE` - Same as above, but called only a [remote] action.

```
{
  type: "@@superglue/BEFORE_REMOTE",
  payload: [..array args that are passed to fetch]
}
```

`SAVE_RESPONSE` - Whenever a [page response] is received.

```
{
  type: "@@superglue/SAVE_RESPONSE",
  payload: {
    pageKey: "/posts",
    page: {...the page response},
  },
}
```

`UPDATE_FRAGMENTS` - Whenever a fragment is recieved or changed.

```
{
  type: "@@superglue/UPDATE_FRAGMENTS",
  payload: {
    changedFragments: {
      nameOfYourFragment: renderedFragment,
      ...
    },
  },
}
```

### Turning a fragment into a slice

Whenever a fragment is received or updated `UPDATE_FRAGMENTS` is called.
You can pass the state from the payload to your slice to keep it updated.

For example:
```javascript
import { createSlice, createAction } from '@reduxjs/toolkit'
import { UPDATE_FRAGMENTS } from '@thoughtbot/superglue'
export const updateFragments = createAction(UPDATE_FRAGMENTS)

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {},
  extraReducers: (builder) => {
    builder.addCase(updateFragments, (state, action) => {
      const { changedFragments } = action.payload;

      if ('cart' in changedFragments) {
        return changedFragments['cart'];
      } else {
        return state;
      }
    })
  }
})
```

[page response]: ./page-response.md
[slices]: ./page-response.md#slices
[extraReducers]: https://redux-toolkit.js.org/api/createSlice#extrareducers
