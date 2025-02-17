# Cross cutting concerns

## Layouts

If you have state that is shared between pages, simply put it in your layout.
For example. In the generated `application.json.props`

```ruby
path = request.format.json? ? param_to_dig_path(params[:props_at]) : nil

json.data(dig: path) do
  json.temperature "HOT HOT HOT"
  yield json
end
```

In the above, every page that gets rendered will have `temperature` as part of
the [page response]. 

## Partials

We can also use partials to extract crosscutting concerns. For example, a shared header:

```treeview
app/
|-- controllers/
|-- views/
|   |-- shared/
|   |   |-- _header.json.props
|   |-- posts/
|   |   |-- index.js
|   |   |-- index.json.props
|   |-- comments/
|   |   |-- index.js
|   |   |-- index.json.props
```

By [design](./redux-state-shape.md) this results in duplicate JSON nodes
across our `pages` slice:

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


## Advanced functionality

For most cases where you don't have to mutate your store, using layouts or
partials would be good enough. Its a fine tradeoff for simplicity.

Sometimes we have global concerns that we'd like to keep updated. This can be
for across pages when navigating or if we'd like to perform client-side
updates. For example, if we're showing a shopping cart quantity on the
header, we want to keep that updated as we navigate back, and when updating
line items locally.

For this, Superglue has fragments and Redux slices.

!!! hint
    You may not need to use fragments and Redux slices. For some apps, the only
    slices you'll ever need is the generated `flash.js` slice that comes with the
    install step.

## Fragments

A fragment in Superglue is any props_template block with given name:

```
  json.body do
    json.cart(fragment: "shoppingCart"]) do
    end
  end
```

Now whenever we encounter a fragment from a new `visit` or update a fragment using `remote`,
Superglue will dispatch an `updateFragment` action.

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: See reference](reference/index.md#updatefragments)
     for `updateFragments`
</div>

That's not a very useful thing by itself, but when combined with Redux toolkit
[createSlice] and [useSelector], it offers a way to easily build global
concerns.

[useSelector]: https://react-redux.js.org/api/hooks#useselector
[createSlice]: https://redux-toolkit.js.org/api/createSlice


## Slices

Whenever a fragment is received or updated, a `UPDATE_FRAGMENTS` action is
dispatched with the value. You can return that value as your state to
keep your slice updated as the user navigates.

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

### initialState

You can render your slice's initial state in the [slices] `key` of the page
object, it'll be merged with the `initialState` passed to your `buildStore`
function in your [application.js](./configuration.md#applicationjs)

[slices]: ./page-response.md#slices

## Other actions

Aside from `UPDATE_FRAGMENTS`, superglue comes with other actions that get
dispatched during lifecycle events that you can make use of. The `flashSlice`
that was generated with the installation is a good example of this.

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

`SAVE_RESPONSE` - Whenever a [page response] is received.

```
{
  type: "@@superglue/SAVE_RESPONSE",
  payload: {
    pageKey: "/posts",
    page: {...the page response},
  },
}
```

[page response]: ./page-response.md
[extraReducers]: https://redux-toolkit.js.org/api/createSlice#extrareducers

