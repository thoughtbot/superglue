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

A map of thunks and useful immutable action creators.

Here's what's included:

```javascript
export const mapDispatchToProps = {
  visit,
  remote,
  setInPage,
  delInPage,
  extendInPage,
  setInJoint,
  delInJoint,
  extendInJoint,
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

Makes an ajax call to a page, pushes to `History`, and sets the response to the `pages` store. Use `visit` when you want full page-to-page transitions on the user's last click.

For a browser-like navigational experience, combine with [withBrowserBehavior](react-redux.md#withbrowserbehavior)

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

Remote DOES NOT affect your `History`. Remote makes an ajax call and saves the response to the `pages` store in async fashion. Use this if you want to [update parts](react-redux.md#filtering-nodes) of the current page or preload other pages.

Combine with [withBrowserBehavior](react-redux.md#withbrowserbehavior)

```javascript
remote(pathQuery, {}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})
```

Shares the same arguments as `visit` with a few key differences:

* You must explicitly provide it with a `pageKey`. This is to prevent async requests from saving into the wrong state. Use with the included `mapStateToProps`, which provides a `this.props.pageKey`. For example:

```text
this.props.remote(url.toString(), {}, this.props.pageKey)
```

You can also wrap this function with sane defaults using `withBrowserBehavior` which will [automatically](react-redux.md#withbrowserbehavior) add the `pageKey` for you.

* `canNavigate` is not available as an option passed to your then-able function.

### saveAndProcessSJRPage

Save and process a rendered view from BreezyTemplate. It will also handle any deferment, and joint updating. Useful if you want to stream a fully rendered `your_template.js.props` to preload, or graft nodes via websockets.

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pageKey | `String` | The page key where you want template to be saved in. Use your rails `foo_path` helpers. |
| pageSJR | `String` | A rendered BreezyTemplate |

## Filtering nodes

Breezy can filter your content tree for a specific node. This is done by adding a `_bz=keypath.to.node` in your URL param and setting the content type to `.js`. BreezyTemplates will no-op all node blocks that are not in the keypath, ignore deferment and caching while traversing, and return the node. Breezy will then `setIn` that node back onto its tree on the client side. Joints will also automatically be updated where needed.

For example:

```javascript
store.dispatch(visit('/?_bz=header.shopping_cart'))
```

## The Breezy store shape

How should you structure your store? Should I replicate my business models, like `User`, on the client side? Use an [ORM](https://github.com/tommikaikkonen/redux-orm) to manage it? How much should I denormalize or normalize? How much business logic should I bring over?

Breezy's store shape falls on the extreme end of denormalization, every page is given a node in the redux tree. There is likely duplication of state across children for example, a shared `User` header. Instead of normalizing state, Breezy give you tools that make it [easy](react-redux.md#updating-joints) to update and manage cross-cutting concerns like a shared header.

Breezy's opinion is that its much saner to leave the business models to the backend, and shape state on the frontend for ~~only~~ mostly presentational purposes. In other words, there is no `User` model on the front end, just pages with `User`-like data.

### How does it look like

Breezy occupies 2 nodes in your Redux state tree.

```javascript
{
  breezy, // <-breezy's private store.
  pages, // where the results of your props live
  ...yourStuff
}
```

`pages` is where the results of your props templates live. Its a hash where the keys are the path of your visited url. Internally, it looks like this:

```javascript
pages: {
  '/bar': {
    data:{...propsFromBreezyTemplates},
    ...otherMetaInfoLikeCSRFTokensOrPartials
  },
  '/bar?foo=123': {
    data:{...propsFromBreezyTemplates},
    ...otherMetaInfoLikeCSRFTokensOrPartials
  },
  '/foo':{
    data:{...propsFromBreezyTemplates},
    ...otherMetaInfoLikeCSRFTokensOrPartials
  }
}
```

## Updating Joints

A Joint is a way for breezy to know that this node in your page is linked across all pages. They can only be enabled as an option on partials using [BreezyTemplate](breezy-template.md)

For example:

```ruby
json.header partial: ['header', joint: true]
```

### Automatically

Breezy will automatically update all pages using information about joint usage from the last request.

For example, if you had this in your `cart.js.props`:

```ruby
json.header partial: ['header', joint: true]
```

And you dispatch a visit to `/cart`

```javascript
  this.visit('/cart')
```

Breezy will track all joints used in `cart.js.props` and use it to update the equivalent joints across all pages in your store.

### Manually updating joints

If you want finer control, or want to perform optimistic updates, breezy provides [action creators](react-redux.md#setinjoint) that will immutably update across `pages`.

## Custom reducers

If you find yourself needing functionality beyond what the default reducers provide, take a look at how [Breezy shapes it store](react-redux.md#how-does-it-look-like) and add your own reducers:

```javascript
yarn add reduce-reducers
```

and modify your `application.js`

```javascript
....
import reduceReducers from 'reduce-reducers'
import {setIn} from '@jho406/breezy/dist/utils/immutability'
import {pagePath} from '@jho406/breezy/dist/utils/helpers'

function myCustomReducer(state = {}, action) {
  switch(action.type) {
  case 'USER_UPLOADS_FILES': {
    const {pageKey, keypath, someValue} = action
    const path = pagePath(pageKey, keypath)
    const nextState = setIn(state, path, someValue)

    return nextState
  }
  default:
    return state
  }
}

const {reducer, ...otherStuff} = Breezy.start({...})

const {
  breezy: breezyReducer,
  pages: pagesReducer,
} = reducer

const store = createStore(
  combineReducers({
    breezy: breezyReducer,
    pages: reduceReducers(pagesReducer, myCustomReducer),
  }),
  initialState,
  applyMiddleware(thunk)
)
```

## Immutability action creators

Breezy includes immutable action creators inspired by [Scour.js](https://github.com/rstacruz/scour). You would need to use keypaths to traverse the prop tree. For example, given a page that looks like this:

```text
'/posts': {
  posts: [
  {
    post_id: 1
    title: 'hello world'
    comments: [
      {
        comment_id: 1,
        body: 'Here's a comment
      }
    ]
  }
  ]
}
```

To reach the comment body you could do this:

```text
'posts.0.comment.0.body'
```

or find first by its attribute and value

```text
'posts.post_id=1.comment.0.body'
```

The above would find the first occurance where `post_id=1` before continuing traversing.

### setInJoint

```javascript
setInJoint({name, keypath, value})
```

Traverses to the node by joint name, then keypath, and immutably sets a value across all `pages`.

```javascript
this.props.setInJoint({
  name: 'header',
  keypath: 'cart.total',
  value: 100
})
```

### extendInJoint

```javascript
extendInJoint({name, keypath, value})
```

Traverses to the node by joint name, then keypath, and immutably extends the value across all `pages`.

```javascript
this.props.extendInJoint({
  name: 'header',
  keypath: 'profile.address',
  value: {zip: 11214}
})
```

### delInJoint

```javascript
delInJoint({name, keypath})
```

Traverses to the node by joint name, then keypath, and immutably delete the value across all `pages`.

```javascript
this.props.delInJoint({
  name: 'header',
  keypath: 'profile.address',
})
```

### setInPage

```javascript
setInPage({pagekey, keypath, value})
```

At the page specificed by the URL, traverses to the node by keypath and immutably set the value.

```javascript
this.props.setInPage({
  pageKey: '/foo?bar=5',
  keypath: 'header.cart.total',
  value: 100
})
```

### extendInPage

```javascript
extendInPage({pageKey, keypath, value})
```

At the page specificed by the URL, traverses to the node by keypath and immutably extend the value.

```javascript
this.props.extendInPage({
  pageKey: '/foo?bar=5',
  keypath: 'header.cart',
  value: {total: 100}
})
```

### delInPage

```javascript
delInPage({pageKey, keypath})
```

At the page specificed by the URL, traverses to the node by keypath and immutably delete the value.

```javascript
this.props.delInPage({
  pageKey: '/foo?bar=5',
  keypath: 'header.cart'
})
```

## Utility

### withBrowserBehavior

Enhances `visit` and `remote` with navigation behavior on the returned Promises. For example, if the request `500`s, Breezy will navigate to '/500.html'. You can read the full behavior [here](https://github.com/jho406/Breezy/blob/master/breezy/lib/utils/react.js#L131).

```javascript
  import {...someStuff..., withBrowserBehavior} from '@jho406/breezy'

  constructor (props) {
    const {visit, remote} = withBrowserBehavior(props.visit, props.remote)
    this.visit = visit.bind(this)
    this.remote = remote.bind(this) //Note that the wrapped remote will automatically add the `pageKey` parameter for you. You do not need to explicity provide it if you wrap it.
  }
```

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| visit | `Function` | The visit function injected by `mapDispatchToProps` |
| remote | `Function` | The remote function injected by `mapDispatchToProps`. The wrapped `remote` function will add the `pageKey` argument automatically for you. |

