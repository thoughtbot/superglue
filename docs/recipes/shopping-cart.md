# Shopping cart

In this recipe, we'll look at how to build a global shopping cart state. One
that can be used in a header for a count of all quantity, a shopping cart
panel, optimistic updates, etc. Here's how to achieve that:

Render the cart in your props [across all pages] in your
`application.json.props` and mark it as a fragment.

```ruby
json.data do
  json.cart partial: ['cart', fragment: true] do
  end

  yield
end
```

[across all pages]: ../cross-cutting-concerns.md#layouts

Add a slice

```javascript
import { createSlice, createAction } from '@reduxjs/toolkit'
import { updateFragments } from '@thoughtbot/superglue'

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {},
  reducers: {
    addToCart: (state, action) => {
      ....logic to add something to the cart ...
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateFragments, (state, action) => {
     // Update the slice with the latest and greatest.
      return action.value
    })
  }
})
```

With `fragment` enabled, the above will populate the slice whenever a page
is received, while allowing you the flexibility to make local edits using
the custom `addToCart` reducer.

You can use this cart slice as you normally would with Redux selectors

```
  // For the cart component
  const cart = useSelector(state => state.cart)

  // For a header quantity component
  const cartCount = cart.lineItems.reduce((memo, line) => memo + line.qty, 0)
```

For updates to the backend, add a ujs attribute to a normal form.

```javascript
  <form action='/add_to_cart?props_at=data.header.cart' method='POST' data-sg-remote={true}>
```

```ruby
def create
  ... add to cart logic here...

  # This helper will retain the `props_at` param when redirecting, which allows the
  # partial rendering of the `show` page.
  redirect_back_with_props_at fallback_url: '/'
end
```

The above will `POST`, and get redirected back to the original page while
fetching only the cart to update. This will be picked up by `extraReducers` and
update the entire cart state.
