## Redux

If you have a usecase that requires complex updates to frontend state. You
can use your own state management. If you're using Redux, Superglue does have
a few conviences for you.

### initialState

You can render your slice's initial state in the [slices] `key` of the [page
response]. This has been configured for you in the
`application.json.props` layout.  It'll be merged with the `initialState` passed
to your `buildStore` function in your
[application.js](./configuration.md#applicationjs)

### Helpful actions to listen to

#### Fragments
Whenever a fragment is received or updated, a `UPDATE_FRAGMENTS` action is
dispatched with the value. You can return that value as your state to
keep your slice updated as the user navigates.

!!! warning
  If you use this technique, keep your fragments simple, and try not to nest
  fragments inside of a fragment as Superglue will denormalize them.

For example:

```javascript
import { createSlice } from '@reduxjs/toolkit'
import { updateFragment } from '@thoughtbot/superglue'

export const cartSlice = createSlice({
  name: 'cart',
  extraReducers: (builder) => {
    builder.addCase(updateFragments, (state, action) => {
      const { value, name } = action.payload;

      if (name === "cart") {
        return value
      } else {
        return state;
      }
    })
  }
})
```

Then somewhere in a component you can [useSelector]:

```
  import { useSelector } from 'react-redux'

  ...

  const cart = useSelector((state) => state.cart)
```


And as this is just a normal Redux [slice], you can also add custom [reducers]
to the mix for client-side updates.

[useSelector]: https://redux-toolkit.js.org/tutorials/quick-start#use-redux-state-and-actions-in-react-components
[slice]: https://redux-toolkit.js.org/api/createSlice
[reducers]: https://redux-toolkit.js.org/api/createSlice#reducers


### Save page

`SAVE_RESPONSE` is called whenever a [page response] is received.

```
{
  type: "@@superglue/SAVE_RESPONSE",
  payload: {
    pageKey: "/posts",
    page: {...the page response},
  },
}
```

If you expect your intial state to change, you can look in the payload for the most recent data
in the [slices] key.

## Other actions

Superglue comes with other actions that gets dispatched during lifecycle events
that you can make use of. The `flashSlice` that was generated with the
installation is a good example of this.

To higlight a few:


`BEFORE_FETCH` - Action created before a before a fetch is called.

```
{
  type: "@@superglue/BEFORE_FETCH",
  payload: [..array args that are passed to fetch]
}
```

`BEFORE_VISIT` - Same as above, but called only for a `visit` action.

```
{
  type: "@@superglue/BEFORE_VISIT",
  payload: [..array args that are passed to fetch]
}
```

`BEFORE_REMOTE` - Same as above, but called only a `remote` action.

```
{
  type: "@@superglue/BEFORE_REMOTE",
  payload: [..array args that are passed to fetch]
}
```


[page response]: ./page-response.md
[extraReducers]: https://redux-toolkit.js.org/api/createSlice#extrareducers
[slices]: ./page-response.md#slices