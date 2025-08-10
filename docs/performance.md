# Performance

Superglue handles performance on two fronts:

## Frontend

On the frontend, Superglue has `useContent` which uses fragment-based dependency tracking for reactivity. Components only re-render when the current page or specific fragments they consume actually change, not when any part of the global state updates.

For example:

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
        "totalCost": 69.97,
        "itemCount": 3
      }
    }
  }
```

```js
const content = useContent()

<h1>{content.title}</h1>

<p>Num of items in cart</p>
<p>{content.cart.items.length}</p>
```

By accessing `content.cart`, `useContent` will track that fragment's change and update the component where the hook is used when appropriate.

## Preventing over-rendering with fragment refs

Sometimes we don't want to the dependency to be tracked. This is especially true if we're just passing data off to another component.

```js
const content = useContent()

<h1>{content.title}</h1>
<SlidingCart cart={content.cart} />
```

The above would cause the parent and child components to rerender if `userCart` was updated. What we want here is for the `SlidingCart` component to update without the parent component updating. We can use Superglue's `unproxy`:

```js
import {unproxy} from '@thoughtbot/superglue'

const content = useContent()
const rawContent = unproxy(content)

<h1>{content.title}</h1>
<SlidingCart cartRef={rawContent.cart} />
```

and use `useContent` in the child component to set up its own dependency tracking:

```js

const SlidingCart = (cartRef) => {
  const cart = useContent(cartRef)
}
```

Now if the `userCart` fragment updates, only the `SlidingCart` component will update.

## Stable references with `unproxy`

When you need stable references for React.memo, referential equality, or dependency arrays, use `unproxy` to get the raw value behind the proxy:

```js
import { unproxy } from '@thoughtbot/superglue'

const content = useContent()
const rawCart = unproxy(content.cart)

const memoizedValue = useMemo(() => {
  // An expensive calculation
}, [rawCart]);
```

Its also useful in `useEffect` dependencies

```js
useEffect(() => {
  // side effect
}, [rawCart]) 
```

## Backend

On the backend, `props` are shaped with [props_template](./props-template.md).
Its one of the fastest json builders in the rubyverse and has been used in
[production] to speed up API rendering times. 

[production]: https://dev.to/yutakusuno/rails-reduced-rendering-time-by-30-in-an-api-response-4ji
