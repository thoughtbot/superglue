# Fragments

**Rails partials are powerful**

They're not just about DRY'ing your views - they're also about semantic
identification. When you extract a `_header.html.erb`, you're declaring "this
thing is a header" with its own identity and boundary. It's valuable information
that is often lost when rendered with a view.

Enter fragments:

**A fragment is a rendered partial with frontend referential identity**.
Its a powerful feature that lets you update client state using an id and have that
reflected instantly across all pages that use the same fragment.

For example, let say you have a shopping cart that shows across all pages:

```ruby
json.title "Hello"

json.cart(partial: ["user/cart", fragment: "userCart"]) do
end
```

```jsx
const content = useContent()
const update = useUpdateFragment()

update(content.cart, (cartDraft) => {
  cartDraft.totalCost = 100
})

// or alternatively

update(toFragmentRef("userCart"), (cartDraft) => {
  cartDraft.totalCost = 100
})

<Cart {...content.cart}/>
<CartSummaryHeader {...content.cart}/>
```

!!! success "Hello Turbo Streams!"
Because fragments are just Rails partials, we also ported a fan favorite
that allows you to update [append](./super-turbo-streams.md#append), [prepend](./super-turbo-streams.md#append), [update](./super-turbo-streams.md#update) to mutate them. We call it [Super Turbo
Streams](./super-turbo-streams.md).

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

On the client side, Superglue will denormalize the payload to something that looks like this:

```js
  {
    pages: {
      "/current-page": {
        data: {
          "title": "Hello",
          "cart": { "_id": "userCart" }  // Fragment reference
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

Like partials, you can nest fragments:

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

When reading content, Superglue's `useContent`, or `useFragment` hook will return a proxy that lazily normalizes the data.

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
Proxies created by `useContent` or `useFragment` can't be mutated directly. This is by design, use `useUpdateFragment` for [mutations](./client-updates.md#useupdatefragment-hook).

Having an identity makes optimistic updates easy. Superglue offers a `useUpdateFragment` [hook](./client-updates.md#useupdatefragment-hook) that helps with mutations. Here's a more complex example.

```js
const update = useUpdateFragment()

update(toFragmentRef('userCart'), (cartDraft) => {
  // carDraft.availableCoupons is a fragment ref in the shape of {__id: 'availableCoupons'}
  // you can use the fragment ref instead of a string
  update(cartDraft.availableCoupons, (couponsDraft) => {
    couponsDraft[0].title = 'super free shipping'
  })
})
```

In the example, you receive an immer draft of the fragment and you can mutate it however you want.
