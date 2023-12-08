## The `page` response
Superglue expects your JSON responses to contain the following attributes. If you
used Superglue's generators, this would be all set for you in
`application.json.props`.

```
{
  data: {
    ...
  },
  componentIdentifier,
  defers,
  assets,
  csrfToken,
  action,
  path,
  renderedAt,
  fragments,
  restoreStrategy,
  slices
}
```

### `data`
Passed to your page component as its props. In a Superglue application, this would
be the contents of your templates, e.g., `index.json.props`. Note that `csrfToken`, 
`fragments`, and `pageKey` will be merged with your props. `ownProps` are also 
merged when [navigating](./react-redux.md#navigateto)

### `componentIdentifier`
A `string` to instruct Superglue which component to render. The generated
`application.json.props` will set this to the `controller_path` and
`action_name`, but you can customize this to fit your needs.

```ruby
# application.json.props
json.componentIdentifier "#{controller_path}/#{action_name}"
```

You can control which `componentIdentifier` will render which component in the
`page_to_page_mapping.js`.

```js
const pageIdentifierToPageComponent = {
  'posts/edit': PostsEdit,
  'posts/new': PostsNew,
  'posts/show': PostsShow,
  'posts/index': PostsIndex,
}
```

It's not uncommon to have multiple identifiers pointing to the same component.
This can be used when building `index` pages use modals instead of a new page for
`show`.

```js
const pageIdentifierToPageComponent = {
  'posts/index': PostsIndex,
  'posts/show': PostsIndex,
}
```

### `assets`
An `array` of asset fingerprint `string`s. Used by Superglue to detect the need to
refresh the browser due to new assets. You can control the refresh behavior in
`application_visit.js`.

### `csrfToken`
The authenticity token that Superglue will use for non-GET request made by using
`visit` or `remote` thunks. This includes forms that have the `data-sg-visit`
or `data-sg-remote` attribute.

### `action` and `path`
Only included when `props_at` is part of the request parameters. `action` is always
set to `graft` and `path` is the camelCase keypath to the requested node.
Superglue uses these attributes to immutably graft a node from the server-side to
the client-side.

### `renderedAt`
An UNIX timestamp representing the time the response was rendered.

### `fragments`
An `array` of [fragments](./fragments-and-slices.md#fragments). In
`application.json.props` this is set to `json.fragments!`.

### `restoreStrategy`
By specifying the restore strategy used (`fromCacheOnly`, `revisitOnly`, or
`fromCacheAndRevisitInBackground`), you can control what superglue does when
encountering the page again when pressing the back or forward browser navigation
buttons.
  - `fromCacheAndRevisitInBackground` will transition to the cached page, then
  issue a visit in the background, redirecting and replacing history if needed.
  This is the option set in `application.json.props` when using the generators.
  - `revisitOnly` will always issue a visit request in the background before
  - `fromCacheOnly` will only restore the page from cache
  transitioning

### `slices`
An object merged with the `initialState` when implementing `buildStore` inside
of `application.js`. You can use this as the initial state for redux slices.
Take advantage of the `SAVE_RESPONSE` to continually update your slice everytime
superglue recieves a new page request.
