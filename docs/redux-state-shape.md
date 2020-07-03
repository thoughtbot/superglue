# The store shape

Breezy occupies 2 nodes in your Redux state tree:

```javascript
{
  breezy: {
    csrfToken,
    currentPageKey,
    pathname,
    search,
    hash,
  },
  pages: {
    '/dashboard': { ..page received from `/dashboad`.. },
    '/posts?foo=123': {... page received from `/posrs?foo=123` },
  }
}
```


### The `breezy` node
The `breezy` node contains information about your application that you may find useful. You may read from this store, but do not write.

### The `pages` node
The `pages` is where rendered JSON templates live. Its a hash where the keys are the pathname + query of your url, known throughout the documentation as `pageKey`, and the values are received JSON responses.

The `pageKey` does not include the location hash of your URL. This is by design, Breezy ignores the location hash and fallsback to browser defaults. So while you can visit `/posts#foo` and `/posts` in the browser, Breezy will store both as `/posts`.

This shape differs from conventional Redux approaches where state is normalized into "tables". In Breezy, we work with denormalized UI state. In other words, Breezy prefers updating state in terms of "updating the user email at each page header", instead of "updating the email in the user model".

#### why?

**There's less guess work.** Business logic is complex and diverse across industry verticals, but the presentational aspects remain largely unchanged. There will always be a header, a footer, a menu, a body with a list of items, etc. Breezy shapes its store with this observation in mind so that **any developer can look at a running application, easily guess the shape of the store, and make close-to-correct assumptions on how to update the store without looking at any code.**

**Its extremely productive with PropsTemplate.** A keypath in your thunk like so `remote(/dashboard?bzq=data.content.bar_chart)` is enough to traverse your content on the server-side, respond with a node, and graft it at the same location in your redux state.

#### Fragments

The `pages` node also serves as a cache of your previous visits. That means there's a chance for some data in your Redux state to be out of date. For example, your most recent visit may have an updated header that your previous page does not have.

PropsTemplate has a feature called fragments that identifies and updates cross-cutting concerns on each new visit.

To use fragments you have to
1. Extract the nodes in your template into a partial
2. Mark it as a fragment

```ruby
## views/dashboard/index.json

json.header(partial: 'shared/header', fragment: true) do
end
...
```

```ruby
## views/posts/index.json

json.header(partial: 'shared/header', fragment: true) do
end
...
```

All pages in your store will update whenever a response is recieved with a header. This applies to both full page visits via `data-bz-visit` or partial updates via `data-bz-remote`.

## The `page` response
Breezy expects your JSON responses to contain the following attributes. If you used Breezy's generators, this would be set for you in `application.json.props`.

```
{
  data: {

  },
  componentIdentifier:,
  defers,
  fragments,
  assets,
  csrfToken,
  action,
  path,
  renderedAt,
  flash,
}
```

### `data`
Passed to your page component as props. In a Breezy application, this would be the the contents of your templates, e.g., `index.json.props`. Note that `flash` will be merged with data when using Breezy's `mapStateToProps`.

### `componentIdentifier`
A `string` to instruct Breezy which component to render. The generated `application.json.props` will set this to the virtual path of the template, but you can customize this to fit your needs.

```ruby
# application.json.props
json.component_identifier local_assigns[:virtual_path_of_template]
```

You can control which `componentIdentifier` will render which component in the `application.js`.

```
const identifierToComponentMapping = {
  'posts/edit': PostsEdit,
  'posts/new': PostsNew,
  'posts/show': PostsShow,
  'posts/index': PostsIndex,
}
```

Its also not uncommon to have multiple indenfiers pointing to the same component. This can be used when building `index` pages that link to `show ` modals living on a different URL path.

```
const identifierToComponentMapping = {
  'posts/index': PostsIndex,
  'posts/show': PostsIndex,
}
```

### `assets`
An `array` of asset fingerprint `string`s. Used by Breezy to detect the need to refresh the browser due to new assets. You can control the refresh behavior in `application_visit.js`.

### `csrfToken`
The authenticity token that Breezy will use for non-GET request made by using `visit` or `remote` thunks. This includes forms that have the `data-bz-visit` or `data-bz-remote` attribute.

### `action` and `path`
Only included when `bzq` is part of the request parameters. `action` is always set to `graft` and `path` is the camelCase keypath to the requested node. Breezy uses these attributes to immutably graft a node from the server-side to the client-size.

### `renderedAt`
An `integer` unix timestamp representing the time the response was rendered.

### `flash`
A `hash` of [flash messages](./rails.md#rails-flash). In `application.json.props` this is set to `flash.to_h`.


