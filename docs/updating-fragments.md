# Updating Fragments

Much like in ERB, when building pages with PropsTemplate, we use partials to extract shared views. For example:

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

As we mentioned in the [state shape guide](docs/redux-state-shape.md) this is by design. To update these cross cutting cocerns, you will have create a reducer to iterate through each `pages` node and immutably update them. This can be error prone, but Breezy provides tooling to make this easy.

# Fragments

To help with creating reducers, Breezy provides fragments. A fragment in Breezy is a rendered partial with a given name:

```
  json.body do
    json.side_bar partial: ["application/side_bar", fragment: "some_user_side_bar_type"]
  end
```

Using the fragment functionality will create metadata about the node. There's no magic here, its up to you to include this in your response using `json.fragments!`. This has been setup for you in `application.json.props`:

```ruby
json.data(search: path) do
  yield json
  json.fragments json.fragments!
end
```

The resulting JSON looks like this:

```json
fragments: [
  { type: :some_user_side_bar_type, partial: 'application/side_bar', path: 'body.sidebar' },
]
```

# Creating reducers

You can use the metadata created by fragments to update cross cutting concerns in your reducer:

```javascript
import { getIn } from '@jho406/breezy'
import produce from "immer"

const pagesReducer = produce((draft, action) => {
  switch (action.type) {
  case UPDATE_USER_HEADER:
    for (const key in draft) {
      const { fragments } = draft[key].data
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
