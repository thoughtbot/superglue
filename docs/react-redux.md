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

Breezy will include all props you build in your `xyz.js.props` and the following:

| prop | Notes |
| :--- | :--- |
| csrfToken | Breezy will automatically append this to your `POST`, `PUT`, and `DELETE` requests, but if you need to write your own fetch, this prop is available to your components. |

You will also receive additional props from the use of the `<NavComponent>`

| prop | Notes |
| :--- | :--- |
| pageKey | The pageKey Breezy used to fetch your `xyz.js.props` from the store. |
| {...ownProps} | Any props that you passed from the use of `navigateTo`, see [navigateTo](react-redux.md#navigateto) |

### mapDispatchToProps

A map of handy thunks.

```javascript
export const mapDispatchToProps = {
  ensureSingleVisit,
  visit,
  remote,
  saveAndProcessSJRPage,
}
```

You will also receive the following when using `<NavComponent>`

| actionCreator | Notes |
| :--- | :--- |
| navigateTo | See [navigateTo](react-redux.md#navigateto). |

## NavComponent

A nav component for your redux application.

```javascript
import Nav from '@jho406/breezy/dist/NavComponent'
...
<Provider store={store}>
  <Nav
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

If there is an existing page in your store `navigateTo` will restore the props, render the correct component, and return `true`. Otherwise it will return `false`. This is useful if you want to restore an existing page before making a call to `visit` or `remote`.

| Parameter | Notes |
| :--- | :--- |
| pageKey | Use your rails `foo_path` helpers. This is the location where your props are stored in stored in breezy. |
| options | Additional options, see below. |

| Options | Notes |
| :--- | :--- |
| ownProps | Any additional props to be passed to the next page component. |

## Thunks

### visit

Makes an ajax call to a page, and sets the response to the `pages` store. Use `visit` when you want full page-to-page transitions on the user's last click.There can only ever be one visit at a time. If you happen to call `visit` while another visit is taking place, only the most recent visit will callback with `canNavigate: true`.

For a browser-like navigational experience, including History pushes, combine with [enhanceVisitWithBrowserBehavior](react-redux.md#enhancevisitwithbrowserbehavior)

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
| pageKey | `String` | Optional. The key that breezy will use to store the recieved page. If not specified, Breezy will use the response's `content-location` headers. See [setting the content location](rails.md#setting-the-content-location) |

| Callback options | Type | Notes |
| :--- | :--- | :--- |
| canNavigate | `Boolean` | There can only be one visit anytime. If 2 visits happen at the same time, both will be fufilled, but only the last one will be passed a `canNavigate = true` in its callback. |
| needsRefresh | `Boolean` | If the new request has new JS assets to get - i.e., the last fingerprint is different from the new fingerprint, then it will return true. |
| screen | `String` | The screen that your react application should render next. |
| page | `Object` | The full parsed page response from your `foobar.js.props` template. |
| rsp | `Object` | The raw response object |
| pageKey | `String` | Location in the Breezy store where `page` is stored. |

| Additional `.catch` error attributes\* | Type | Notes |
| :--- | :--- | :--- |
| fetchArgs | `Array` | The arguments passed to `fetch`, as tuple `[url, {req}]`. You can use this to implement your own retry logic. |
| url | `String` | The full url, passed to `fetch`. |
| pageKey | `String` | Location in the Breezy store where `page` is stored |

### remote

Remote makes an ajax call and saves the response to the `pages` store in async fashion. Use this if you want to [update parts](react-redux.md#filtering-nodes) of the current page or preload other pages.

```javascript
remote(pathQuery, {}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})
```

Shares the same arguments as `visit` with a few key differences:

* `canNavigate` is not available as an option passed to your then-able function.

### saveAndProcessSJRPage

Save and process a rendered view from BreezyTemplate. It will also handle any deferment, and fragment updating. Useful if you want to stream a fully rendered `your_template.js.props` to preload, or graft nodes via websockets.

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pageKey | `String` | The page key where you want template to be saved in. Use your rails `foo_path` helpers. |
| pageSJR | `String` | A rendered BreezyTemplate |

## Filtering nodes

Breezy can filter your content tree for a specific node. This is done by adding a `_bz=keypath.to.node` in your URL param and setting the content type to `.js`. BreezyTemplates will no-op all node blocks that are not in the keypath, ignore deferment and caching while traversing, and return the node. Breezy will then immutably set that node back onto its tree on the client side. Fragments will also automatically be updated where needed.

For example:

```javascript
store.dispatch(visit('/?_bz=header.shopping_cart'))
```

## Updating Fragments

A Fragment is a way for breezy to know that this node in your page is linked across all pages. They can only be enabled as an option on partials using [BreezyTemplate](breezy-template.md#partial-fragments)

For example:

```ruby
json.header partial: ['header', fragment: true]
```

### Automatically

Breezy will automatically update all pages using information about fragment usage from the last request.

For example, if you had this in your `cart.js.props`:

```ruby
json.header partial: ['header', fragment: true]
```

And you dispatch a visit to `/cart`

```javascript
  this.enhancedVisit('/cart')
```

Breezy will track all fragments used in `cart.js.props` and use it to update the equivalent fragments across all pages in your store.

### Manually updating fragments

If you want finer control, or want to perform optimistic updates, use [custom reducers](recipes.md#custom-reducers) along side with breezy [helpers](utility.md).

