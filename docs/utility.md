# Utility

## API

### enhanceVisitWithBrowserBehavior

Enhances `visit` with navigation behavior on the returned Promises. For example, if the request `500`s, Breezy will navigate to '/500.html'. You can read the full behavior [here](https://github.com/jho406/Breezy/blob/master/breezy/lib/utils/react.js#L131).

```javascript
  import {...someStuff..., enhanceVisitWithBrowserBehavior} from '@jho406/breezy'

  constructor (props) {
    const visit = enhanceVisitWithBrowserBehavior(props.visit)
    this.visit = visit.bind(this)
  }
```

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| visit | `Function` | The visit function injected by `mapDispatchToProps` |
| remote | `Function` | The remote function injected by `mapDispatchToProps`. The wrapped `remote` function will add the `pageKey` argument automatically for you. |

### getIn

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| obj | `Object` | Typically the redux state.
| path | `String ` | A keypath to the node in your state, 'posts.post_id=1.comment.0.body'

Traverses to the node using a keypath. For example, given a page that looks like this:

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
getIn(state, 'posts.0.comment.0.body')
```

or find first by its attribute and value

```text
getIn(state, 'posts.post_id=0.comment.0.body')
```

The above would find the first occurance where `post_id=1` before continuing traversing.

### forEachJointPathAcrossAllPages
Iterates through each key path of where the joint is located across all pages.

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pages | `Object` | The pages object from your root Redux state
| name | `String ` | The name of the joint, e.g, header
| callback | `Function` | The function to call while iterating

| Callback options | Type | Notes |
| :--- | :--- | :--- |
| keypath | `String` | The path to the joint from the `pages` root, use with (getIn)[#getIn]

For example, say we have a partial:

```ruby
#_header.js.props

json.email 'foo@bar.com'
```

and two pages that uses it.
```ruby
#index.js.props

json.header nil, partial: ['header', joint: true]
```

```ruby
#edit.js.props

json.header nil, partial: ['header', joint: true]
```

To update the email optimistically, just iterate through all the `header` joints and update the email on the client side:

```javascript
import {
  forEachJointPathAcrossAllPages,
} from '@jho406/breezy/dist/utils/helpers'
import produce from "immer"

function myCustomReducer(state = {}, action) {
  switch(action.type) {
  case 'USER_CHANGES_EMAIL': {
    const {email} = action
    return produce(state, draft => {
      forEachJointPathAcrossAllPages(state, 'header', (pathToJoint) => {
        const headerNode = getIn(draft, pathToJoint)
        header.email = email
      })
    })
  }
  default:
    return state
  }
}
```

### forEachJointPathInPage
Iterates through each key path of where the joint is located in a single page.

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| page | `Object` | A page object from the `pages` root.
| name | `String ` | The name of the joint, e.g, header
| callback | `Function` | The function to call while iterating

| Callback options | Type | Notes |
| :--- | :--- | :--- |
| keypath | `String` | The path to the joint from the chosen page root, use with (getIn)[#getIn].

