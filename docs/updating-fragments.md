# Updating Fragments

Much like in ERB, when building pages with PropsTemplate, we use partials to
extract shared views. For example:

```
views/
  application/
    _header.json.props
  posts/
    index.json.props
  comments/
    index.json.props
```

This results in duplicate JSON nodes across our Redux state:

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

As we mentioned in the [state shape guide](./redux-state-shape.md) this is
by design. To update these cross-cutting cocerns, you will have to create a
reducer to iterate through each `pages` node and immutably update them. This
can be error-prone, but Breezy provides tooling to make this easy.

# Fragments

To help with creating reducers, Breezy has a featured called fragments. A
fragment in Breezy is a rendered partial with a given name:

```
  json.body do
    json.side_bar partial: ["application/side_bar", fragment: "some_user_side_bar_type"]
  end
```

Using the fragment functionality will create metadata about the node. This has
been set up for you in `application.json.props`:

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

1. When a new page loads with a fragment Breezy will look at the page store and
update nodes marked with the same fragment name across all pages. For example,
a header that appears across multiple pages. This is similar to the idea of
a [Turbo-Frame](https://turbo.hotwired.dev/handbook/frames).

2. If you use a custom reducer to update the page state, fragments of the same
name across all pages will also update. This behavior is controlled by a
middleware. This is included by default when generating a breezy app:

```
// packs/application.js

import { ApplicationBase, fragmentMiddleware } from '@thoughtbot/breezy'

...
composeEnhancers(applyMiddleware(thunk, fragmentMiddleware))

```

You can turn this behavior off by removing the middleware.

## Manual updates

If you choose to turn off the middleware. You can still use the metadata
created by fragments to update cross-cutting concerns in your reducer:

```javascript
import { getIn } from '@thoughtbot/breezy'
import produce from "immer"

const pagesReducer = produce((draft, action) => {
  switch (action.type) {
  case UPDATE_USER_HEADER:
    for (const key in draft) {
      const { fragments } = draft[key]
      const { email } = action.payload

      fragments
        .filter({type, partial} => type === "user_side_bar" && partial === "application/side_bar")
        .forEach({path} => {
          const node = getIn(page, path)
          node.email = email
        })
    }
  }
}, { pages: {} })
```
