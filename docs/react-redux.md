# React Redux

## ApplicationBase
```
import { ApplicationBase } from '@thoughtbot/superglue'

export default class Application extends ApplicationBase {
  ...
}
```

Your `Application` component entry point inherits from this component. It
performs setup of redux, UJS, and other functionality when rendered. This would
be created for you if you used Superglue's generators. Components that inherits
from `ApplicationBase` will not work without implementing the following methods:

- `mapping` override this and return a [mapping](https://github.com/thoughtbot/Superglue/blob/main/superglue_rails/lib/install/templates/web/application.js)
between your `prop` templates to the page component.
- `visitAndRemote` override this and return an object with `visit` and `remote`.
If you used the generators, a customizable one has been created for you in
`application_visit.js`

## Nav

A nav component for your application. It is used by the render method in
`ApplicationBase`.

```javascript
import Nav from '@thoughtbot/superglue/components/Nav'
...
<Provider store={store}>
  <Nav
    store={store}
    visit={myVisit}
    remote={myRemote}
    mapping={this.props.mapping}
    history={history}
    initialPageKey={initialPageKey}
  />
</Provider>
```

### navigateTo

Use to `navigateTo` to perform a full-page navigation using your cached state.

```javascript
this.props.navigateTo('/posts', {ownProps:{something: true}})
```

If there is an existing page in your store `navigateTo` will restore the props,
render the correct component, and return `true`. Otherwise, it will return
`false`. This is [useful](./recipes/turbolinks) if you want
to restore an existing page before making a call to `visit` or `remote`.

| Parameter | Notes |
| :--- | :--- |
| pageKey | Use your rails `foo_path` helpers. This is the location where your props are stored in superglue. |
| options | Additional options, see below. |

| Options | Notes |
| :--- | :--- |
| ownProps | Any additional props to be passed to the next page component. |

## Action Creators

### visit

Makes an ajax call to a page, and sets the response to the `pages` store. Use
`visit` when you want full page-to-page transitions on the user's last click.
There can only ever be one visit at a time. If you happen to call `visit` while
another visit is taking place, it will abort the previous one.

?> `visit` is used for full-page transitions and will strip the `props_at` query string
from your pathQuery parameters that target a specific node. The exception to this
rule is if you use a `props_at` query string with a `placeholderKey` option. This is
allowed because `props_at` would have a page to graft onto.


```javascript
visit(pathQuery).then(({rsp, page, pageKey, screen, needsRefresh}) => {})

visit(pathQuery, {...fetchRequestOptions}).then(({rsp, page, pageKey, screen, needsRefresh}) => {})

visit(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, pageKey, screen, needsRefresh}) => {})

visit(pathQuery, {...fetchRequestOptions}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})
```

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pathQuery | `String` | The path and query of the url you want to fetch from. The path will be prefixed with a `BASE_URL` that you configure. |
| fetchRequestOptionsAndMore | `Object` | Any fetch request options plus extras. Note that superglue will override the following headers: `accept`, `x-requested-with`, `x-superglue-request`, `x-csrf-token`, and `x-http-method-override`. |

| fetchRequestOptionsAndMore | Type | Notes
| :--- | :--- | :--- |
| placeholderKey | `String` | When passing a url that has a `props_at` param, you can provide a `placeholderKey`, which superglue will use to copy the state over to the new url before making a request. If you do not provide this param, Superglue will remove any `props_at` param from the url.
|      |      | Other options are passed on to `fetch`|

| Callback options | Type | Notes |
| :--- | :--- | :--- |
| needsRefresh | `Boolean` | If the new request has new JS assets to get - i.e., the last fingerprint is different from the new fingerprint, then it will return true. |
| componentIdentifier | `String` | The screen that your react application should render next. |
| page | `Object` | The full parsed page response from your `foobar.json.props` template. |
| pageKey | `String` | The key that Superglue uses to store the response |
| suggestedAction | `String` | `push` or `replace`, to be used to `navigateTo`|
| redirected | `Boolean` | `true` if the response was the result of a redirect, `false` otherwise|
| rsp | `Object` | The raw response object |

| Additional `.catch` error attributes\* | Type | Notes |
| :--- | :--- | :--- |
| fetchArgs | `Array` | The arguments passed to `fetch`, as tuple `[url, {req}]`. You can use this to implement your own retry logic. |
| url | `String` | The full url, passed to `fetch`. |
| pageKey | `String` | Location in the Superglue store where `page` is stored |

### `data-sg-visit`

A UJS equivalent of `visit` is available. For example:

```javascript
<a href='/some_url' data-sg-visit={true} />
```

or if you're using a form

```javascript
<form action='/some_url' data-sg-visit={true} />
```

`data-sg-visit` also has 2 companion attributes:

1. `data-sg-placeholder` will allow you to add a placeholder.
2. `data-sg-method` will set the method of the request (GET, POST, PUT, DELETE)
for a `<a>` tag.


### remote

Remote makes an ajax call and saves the response to the `pages` store in async
fashion. Use this if you want to [update parts](react-redux.md#traversing-nodes)
of the current page or preload other pages.

?> Unlike `visit`, `remote` will not strip any `props_at` url parameters.

```javascript
remote(pathQuery, {...fetchRequestOptionsAndMore}, pageKey).then(({rsp, page, screen, needsRefresh}) => {})

remote(pathQuery, {...fetchRequestOptionsAndMore}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})
```

Shares the same arguments as `visit` with a few differences:

* `suggestedAction` is not available as an option passed to your then-able function.
* `placeholder` is not available
* You can override where the response is saved with a `pageKey` options

| fetchRequestOptionsAndMore options | Type | Notes |
| :--- | :--- | :--- |
| pageKey | `String` | Where the response should be saved. By default, it is the current url.
|      |      | Other options are passed on to `fetch`|

### `data-sg-remote`

A UJS equivalent of remote is available. Use this if you want to update parts
of the current page, or another page in the Redux store without updating
`window.history` for example:

```javascript
<a href='/some_url' data-sg-remote={true} />
```

### saveAndProcessPage

Save and process a rendered view from PropsTemplate and fetch any deferments.

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pageKey | `String` | The key that Superglue uses to store the response |
| page | `String` | A rendered PropsTemplate|

### copyPage

Copies an existing page in the store, and sets it to a different `pageKey`.
Useful for optimistic updates on the next page before you navigate.

```
this.props.copyPage({
  from: '/current_page',
  to '/next_page'
})
```

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| {from} | `String` | The key of the page you want to copy from.
| {to} | `String` | The key of the page you want to copy to.


## Searching for nodes

Superglue can search your content tree for a specific node. This is done by adding
a `props_at=keypath.to.node` in your URL param, then passing the params in your
`application.json.props`. PropsTemplate will ignore blocks that are not in the
keypath, disable deferment and caching, and return the node. Superglue will then
immutably set that node back onto its tree on the client-side. Fragments will
also automatically be updated where needed. See our [querying guide]
for more examples.

For example:

```javascript
this.props.remote('/?props_at=header.shopping_cart')
```

and in your `application.json.props`

```ruby
path = param_to_search_path(params[:props_at])

json.data(search: path) do
  yield json
end

...

```

## Updating Fragments

A Fragment is a way to mark a node as shared across all pages. They can only be
enabled as an option on partials using [PropsTemplate](props-template.md#partial-fragments)

For example:

```ruby
json.header partial: ['header', fragment: true] do
end
```

This metadata can then be used by your reducers to make updates that span
[across pages](./updating-fragments.md).

[querying guide]: ./traversal-guide.md
