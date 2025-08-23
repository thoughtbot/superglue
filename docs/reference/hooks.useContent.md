## Type Aliases

<a id="proxiedcontent"></a>

### ProxiedContent\<T\>

> **ProxiedContent**\<`T`\> = `T` & \{ readonly \[K in keyof T\]: T\[K\] extends Fragment\<infer U, true\> ? ProxiedContent\<U\> : T\[K\] extends Fragment\<infer U, false \| undefined\> ? ProxiedContent\<U\> \| undefined : T\[K\] extends (infer U)\[\] ? ProxiedContent\<U\>\[\] : T\[K\] extends object ? ProxiedContent\<T\[K\]\> : T\[K\] \}

Defined in: [hooks/useContent.tsx:17](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useContent.tsx#L17)

A proxy type that enables reactive access to nested content with automatic fragment resolution

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

<a id="fragmentreforid"></a>

### FragmentRefOrId

> **FragmentRefOrId** = [`FragmentRef`](types.md#fragmentref) \| `string`

Defined in: [hooks/useContent.tsx:33](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useContent.tsx#L33)

Union type for fragment references, accepting either FragmentRef objects or string IDs

## Functions

<a id="usecontent"></a>

### useContent()

#### Call Signature

> **useContent**\<`T`\>(): [`ProxiedContent`](#proxiedcontent)\<`T`\>

Defined in: [hooks/useContent.tsx:79](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useContent.tsx#L79)

Returns a proxy for accessing your page's content e.g, `index.json.props`,
`show.json.props`, etc.

For advanced scenarios where you are using Fragments.

```js
{
  data: {
    body: {
      cart: {__id: 'user_cart'}
    },
   footer: {title: "welcome"}},
  },
  fragments: {user_cart: {total: 100}}
}
```

The proxy will lazily and automatically resolve any [FragmentRef](types.md#fragmentref)s making it
as easy as

```
const data = useContent()
const total = data.body.cart.total
```

The hook will also automatically tracks fragment dependencies and triggers
re-renders only when accessed fragments change.

##### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) | The data type being accessed (defaults to JSONMappable) |

##### Returns

[`ProxiedContent`](#proxiedcontent)\<`T`\>

Reactive proxy to page data or fragment data, undefined if fragment not found

##### Example

```tsx
// Access current page data
const page = useContent()

// Access specific fragment by reference
const user = useContent({__id: 'user_123'})

// Access specific fragment by ID string
const cart = useContent('userCart')
```

#### Call Signature

> **useContent**\<`T`\>(`fragmentRef`: [`FragmentRefOrId`](#fragmentreforid)): [`ProxiedContent`](#proxiedcontent)\<`T`\>

Defined in: [hooks/useContent.tsx:109](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useContent.tsx#L109)

Passing in a fragment to useContent allows us to scope the tracking of
fragments to that hook usage. Its useful in performance scenarios where you
want a child component to update, but not the parent.

```js
import {unproxy} from '@thoughtbot/superglue'

const content = useContent()
const rawContent = unproxy(content)

<h1>{content.title}</h1>
<SlidingCart cartRef={rawContent.cart} />
```

then in SlidingCart

```js
const SlidingCart = (cartRef) => {
  const cart = useContent(cartRef)
}
```

SlidingCart will update only if the fragment referenced by `cartRef` updates.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fragmentRef` | [`FragmentRefOrId`](#fragmentreforid) | Optional fragment reference for scoped access |

##### Returns

[`ProxiedContent`](#proxiedcontent)\<`T`\>

***

<a id="unproxy"></a>

### unproxy()

> **unproxy**\<`T`\>(`proxy`: `T`): [`Unproxy`](types.md#unproxy)\<`T`\>

Defined in: [hooks/useContent.tsx:173](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useContent.tsx#L173)

Extracts the underlying state from an [useContent](#usecontent) proxy

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `proxy` | `T` |

#### Returns

[`Unproxy`](types.md#unproxy)\<`T`\>
