# Fragments

__Rails partials are powerful__

They're not just about DRY'ing your views - they're also about semantic
identification. When you extract a `_header.html.erb`, you're declaring "this
thing is a header" with its own identity and boundary. Its valuable information
that is often lost when rendered with a view. Preserving that on the client side
would be invaluable.

Enter fragments:

__A fragment is a rendered partial with referential identity__ on the client side.
Its a powerful feature that lets you update client state using an id.

For example:

```ruby
json.title "Hello"

json.cart(partial: ["user/cart", fragment: "userCart"]) do
end
```

```jsx
const content = useContent()
const set = useSetFragment()

set("userCart", (cartDraft) => {
  cartDraft.totalCost = 100
})

<Cart {...content.cart}/>
<CartSummaryHeader {...content.cart}/>
```

!!! success "Turbo Streams"
    Because fragments are just Rails partial, it enables a familiar and powerful
    feature of Superglue: [Super Turbo Streams](./super-turbo-streams.md).

## Denormalization

A page response that uses fragments first returns a normalized state. A response
from the previous example would look like:

```json
  {
    "data": {
      "title": "Hello",
      "cart": {
        "items": [
          { "id": 1, "name": "Widget", "price": 19.99, "quantity": 2 },
          { "id": 2, "name": "Gadget", "price": 29.99, "quantity": 1 }
        ],
        "availableCoupons": [
          {"title": "free shipping", "code": "abc123"}
        ]
        "totalCost": 69.97,
        "itemCount": 3
      }
    },
    "fragments": [
      { "type": "userCart", "path": ["cart"] }
    ]
  }
```

On the client side, Superglue will denormalize when saving to the [Redux state](./redux-state-shape.md#fragments):

```js
  {
    pages: {
      "/current-page": {
        data: {
          "title": "Hello",
          "cart": { "__id": "userCart" }  // Fragment reference
        }
      }
    },
    fragments: {
      "userCart": {
        "items": [
          { "id": 1, "name": "Widget", "price": 19.99, "quantity": 2 },
          { "id": 2, "name": "Gadget", "price": 29.99, "quantity": 1 }
        ],
        "availableCoupons": [
          {title: "free shipping", code: "abc123"}
        ]
        "totalCost": 69.97,
        "itemCount": 3
      }
    }
  }
```

Like partials, fragments are also composible:

```js
  {
    pages: {
      "/current-page": {
        data: {
          "title": "Hello",
          "cart": { "__id": "userCart" }  // Fragment reference
        }
      }
    },
    fragments: {
      "userCart": {
        "items": [
          { "id": 1, "name": "Widget", "price": 19.99, "quantity": 2 },
          { "id": 2, "name": "Gadget", "price": 29.99, "quantity": 1 }
        ],
        "availableCoupons": {__id: "userCoupons"} // Fragment reference
        "totalCost": 69.97,
        "itemCount": 3
      },
      "userCoupons": [
        {title: "free shipping", code: "abc123"}
      ]
    }
  }
```

## Normalization

When reading content, Superglue's `useContent` hook will return a proxy that lazily normalizes the data.

```js
const content = useContent()

<h1>{content.title}</h1>

<p>Num of items in cart</p>
<p>{content.cart.items.length}</p>
```

!!! Info
    Behind the scenes, the `useContent` hook will track every fragment accessed through the proxy. If any of those fragments gets updated, the React component will rerender. This can be [selectively tuned for performance](./performance.md#frontend).


## Mutations

!!! Important
    Proxies created by `useContent` can't be mutated directly. This is by design, use `useSetFragment` for [mutations](./client-updates.md#usesetfragment-hook).

Having an identity makes optimistic updates easy. Superglue offers a `useSetFragment` [hook](./client-updates.md#usesetfragment-hook) that helps with mutations. Here's a more complex example.

```js
const set = useSetFragment()

set('userCart', (cartDraft) => {
  // carDraft.availableCoupons is a fragment ref in the shape of {__id: 'availableCoupons'}
  // you can use the fragment ref instead of a string
  set(cartDraft.availableCoupons, (couponsDraft) => {
    couponsDraft[0].title = "super free shipping"
  })
})
```

In the example, you recieve an immer draft of the fragment and you can mutate it however you want.