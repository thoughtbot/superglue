# Shopping cart

You want a shopping cart with state that can be reflected on the header as a count and a slide out.

Render the cart in your props across all pages and mark it as a fragment.

```ruby
json.header do
  json.cart partial: ['cart', fragment: true] do
  end
end
...more
```

Add a slice

```javascript
import { createSlice, createAction } from '@reduxjs/toolkit'
import { UPDATE_FRAGMENTS } from '@thoughtbot/superglue'
export const updateFragments = createAction(UPDATE_FRAGMENTS)

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
      const { changedFragments } = action.payload;

      if ('cart' in changedFragments) {
        return changedFragments['cart'];
      } else {
        return state;
      }
    })
  }
})
```

The above will render and allow you to add client side logic for optimistic
updates. You can use this cart slice as you normally would with Redux selectors

```
  const cart = useSelector(state => state.cart)
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

The above will POST, and get redirected back to the original page while
fetching only the cart to update. This will be picked up by `extraReducers` and
update the entire cart state.
