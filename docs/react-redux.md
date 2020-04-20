# React Redux

## React Redux helpers

Breezy comes with ready-to-use `mapStateToProps` and `mapDispatchToProps` that you can feed into React-Redux's connect.

```javascript
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {connect} from "react-redux"

....

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyComponent)
```

### mapStateToProps

Breezy will pass the props you created in your `xyz.json.props` and the following:

| prop | Notes |
| :--- | :--- |
| csrfToken | Breezy will automatically append this to your `POST`, `PUT`, and `DELETE` requests, but if you need to write your own fetch, this prop is available to your components. |

You will also receive additional props from the use of the `<NavComponent>`

| prop | Notes |
| :--- | :--- |
| pageKey | The pageKey Breezy used to fetch your `xyz.json.props` from the store. |
| {...ownProps} | Any props that you passed from the use of `navigateTo`, see [navigateTo](react-redux.md#navigateto) |

### mapDispatchToProps

A map of handy [thunks](#thunks).

```javascript
export const mapDispatchToProps = {
  ensureSingleVisit,
  visit,
  remote,
  saveAndProcessPage,
}
```

You will also receive the following when using the `<NavComponent>`

| actionCreator | Notes |
| :--- | :--- |
| navigateTo | See [navigateTo](react-redux.md#navigateto). |

## NavComponent

A nav component for your application.

```javascript
import Nav from '@jho406/breezy/dist/NavComponent'
...
<Provider store={store}>
  <Nav
    store={store}
    mapping={this.props.mapping}
    history={history}
    initialPageKey={initialPageKey}
  />
</Provider>
```

### navigateTo

```javascript
this.props.navigateTo('/posts', {ownProps:{restored: true}})
```

If there is an existing page in your store `navigateTo` will restore the props, render the correct component, and return `true`. Otherwise, it will return `false`. This is [useful](recipes#replicating-turbolinks-behavior) if you want to restore an existing page before making a call to `visit` or `remote`.

| Parameter | Notes |
| :--- | :--- |
| pageKey | Use your rails `foo_path` helpers. This is the location where your props are stored in breezy. |
| options | Additional options, see below. |

| Options | Notes |
| :--- | :--- |
| ownProps | Any additional props to be passed to the next page component. |

## Thunks

### visit

Makes an ajax call to a page, and sets the response to the `pages` store. Use `visit` when you want full page-to-page transitions on the user's last click. There can only ever be one visit at a time. If you happen to call `visit` while another visit is taking place, only the most recent visit will callback with `canNavigate: true`.

For a browser-like navigational experience, including History pushes, combine with [enhanceVisitWithBrowserBehavior](utility.md#enhancevisitwithbrowserbehavior)

**Note** `visit` will strip any `bzq` query parameters from your pathQuery. If you need to use traversals, use [remote](#remote) instead.

```javascript
visit(pathQuery).then(({rsp, page, pageKey, screen, needsRefresh, canNavigate}) => {})

visit(pathQuery, {...fetchRequestOptions}).then(({rsp, page, pageKey, screen, needsRefresh, canNavigate}) => {})

visit(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, pageKey, screen, needsRefresh, canNavigate}) => {})

visit(pathQuery, {...fetchRequestOptions}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})
```

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pathQuery | `String` | The path and query of the url you want to fetch from. The path will be prefixed with a `BASE_URL` that you configure. |
| fetchRequestOptions | `Object` | Any fetch request options. Note that breezy will override the following headers: `accept`, `x-requested-with`, `x-breezy-request`, `x-xhr-referer`, `x-csrf-token`, and `x-http-method-override`. |

| Callback options | Type | Notes |
| :--- | :--- | :--- |
| canNavigate | `Boolean` | There can only be one visit anytime. If 2 visits happen at the same time, both will be fulfilled, but only the last one will be passed a `canNavigate = true` in its callback. |
| needsRefresh | `Boolean` | If the new request has new JS assets to get - i.e., the last fingerprint is different from the new fingerprint, then it will return true. |
| screen | `String` | The screen that your react application should render next. |
| page | `Object` | The full parsed page response from your `foobar.json.props` template. |
| rsp | `Object` | The raw response object |

| Additional `.catch` error attributes\* | Type | Notes |
| :--- | :--- | :--- |
| fetchArgs | `Array` | The arguments passed to `fetch`, as tuple `[url, {req}]`. You can use this to implement your own retry logic. |
| url | `String` | The full url, passed to `fetch`. |
| pageKey | `String` | Location in the Breezy store where `page` is stored |

### remote

Remote makes an ajax call and saves the response to the `pages` store in async fashion. Use this if you want to [update parts](react-redux.md#traversing-nodes) of the current page or preload other pages.

**Note** Unlike `visit`, `remote` will retain any `bzq` url parameters.

```javascript
remote(pathQuery, {...fetchRequestOptionsAndMore}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptionsAndMore}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})
```

Shares the same arguments as `visit` with a few differences:

* `canNavigate` is not available as an option passed to your then-able function.
* You can override where the response is saved with a `pageKey` options

| fetchRequestOptionsAndMore options | Type | Notes |
| :--- | :--- | :--- |
| pageKey | `String` | Where the response should be saved, by default its the current url.

### saveAndProcessPage

Save and process a rendered view from PropsTemplate. It will also handle any deferment, and fragment updating. Useful if you want to [stream](recipes#chat-app-long-polling) a fully rendered `your_template.json.props` to via websockets.

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pageKey | `String` | Optional, but recommended. The page key where you want a rendered response to be saved in. Use your rails url helpers. If this is skipped, only [fragments](props_template/README.md#partial-fragments) will be updated|
| page | `String` | A rendered PropsTemplate|

### Behavior with Fragments
If a fragment was rendered in any response to a `visit` or `remote`, all fragments across all pages in Breey's Redux store are automatically updated. For more information see [PropsTemplate](props_template/README.md#partial-fragments)

## Search nodes

Breezy can search your content tree for a specific node. This is done by adding a `bzq=keypath.to.node` in your URL param, then passing the params in your `application.json.props`. PropsTemplate will ignore blocks that are not in the keypath, disable deferment and caching, and return the node. Breezy will then immutably set that node back onto its tree on the client-side. Fragments will also automatically be updated where needed. See our [traversal guide](docs/traversal-guide) for more examples.

For example:

```javascript
this.props.remote('/?bzq=header.shopping_cart')
```

and in your `application.json.props`

```ruby
path = param_to_search_path(params[:bzq])

json.data(search: path) do
  yield json
end

...

```

## Updating Fragments

A Fragment is a way for breezy to know that this node on your page is linked across all pages. They can only be enabled as an option on partials using [PropsTemplate](props-template.md#partial-fragments)

For example:

```ruby
json.header partial: ['header', fragment: true] do
end
```

Breezy will automatically update all pages across your store using information about fragment usage from the last request.
