## Functions

<a id="usecontent"></a>

### useContent()

#### Call Signature

> **useContent**\<`T`\>(): `T`

Defined in: [hooks/useContent.tsx:52](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useContent.tsx#L52)

Returns a proxy for accessing your page's content e.g, `index.json.props`,
`show.json.props`, etc.

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

The proxy will lazily and automatically resolve any `FragmentRef`s making it
as easy as

```
const data = useContent()
const total = data.body.cart.total
```

The hook will also automatically tracks fragment dependencies and triggers
re-renders only when accessed fragments change.

##### Type Parameters

| Type Parameter | Default type                            | Description                                             |
| -------------- | --------------------------------------- | ------------------------------------------------------- |
| `T`            | [`JSONMappable`](types.md#jsonmappable) | The data type being accessed (defaults to JSONMappable) |

##### Returns

`T`

Reactive proxy to page data

##### Example

```tsx
// Access current page data
const page = useContent()

// Access a specific page's data by key
const posts = useContent('/posts')
```

#### Call Signature

> **useContent**\<`T`\>(`pageKey?`: `string`): `undefined` \| `T`

Defined in: [hooks/useContent.tsx:57](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useContent.tsx#L57)

##### Type Parameters

| Type Parameter | Default type                            |
| -------------- | --------------------------------------- |
| `T`            | [`JSONMappable`](types.md#jsonmappable) |

##### Parameters

| Parameter  | Type     | Description                                                                                          |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `pageKey?` | `string` | Optional page key to access a specific page's data. When omitted, returns data for the current page. |

##### Returns

`undefined` \| `T`

---

<a id="unproxy"></a>

### unproxy()

> **unproxy**\<`T`\>(`proxy`: `T`): [`Unproxy`](types.md#unproxy)\<`T`\>

Defined in: [hooks/useContent.tsx:127](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useContent.tsx#L127)

Extracts the underlying state from an [useContent](#usecontent) proxy

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters

| Parameter | Type |
| --------- | ---- |
| `proxy`   | `T`  |

#### Returns

[`Unproxy`](types.md#unproxy)\<`T`\>
