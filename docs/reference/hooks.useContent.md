## Type Aliases

<a id="fragmentproxy"></a>

### FragmentProxy

> **FragmentProxy** = \{ `__fragment`: `true`; \}

Defined in: [hooks/useContent.tsx:13](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/hooks/useContent.tsx#L13)

#### Properties

<a id="__fragment"></a>

##### \_\_fragment

> **\_\_fragment**: `true`

Defined in: [hooks/useContent.tsx:13](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/hooks/useContent.tsx#L13)

***

<a id="proxiedcontent"></a>

### ProxiedContent\<T\>

> **ProxiedContent**\<`T`\> = `T` *extends* [`Fragment`](types.md#fragment)\<infer U, `true`\> ? [`ProxiedContent`](#proxiedcontent)\<`U`\> & [`FragmentProxy`](#fragmentproxy) : `T` *extends* [`Fragment`](types.md#fragment)\<infer U, `false` \| `undefined`\> ? [`ProxiedContent`](#proxiedcontent)\<`U`\> & [`FragmentProxy`](#fragmentproxy) \| `undefined` : `T` *extends* infer U[] ? [`ProxiedContent`](#proxiedcontent)\<`U`\>[] : `T` *extends* `object` ? `{ [K in keyof T]: ProxiedContent<T[K]> }` : `T`

Defined in: [hooks/useContent.tsx:18](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/hooks/useContent.tsx#L18)

A proxy type that enables reactive access to nested content with automatic fragment resolution

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

<a id="fragmentreforid"></a>

### FragmentRefOrId

> **FragmentRefOrId** = [`FragmentRef`](types.md#fragmentref) \| `string`

Defined in: [hooks/useContent.tsx:32](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/hooks/useContent.tsx#L32)

Union type for fragment references, accepting either FragmentRef objects or string IDs

## Functions

<a id="usecontent"></a>

### useContent()

#### Call Signature

> **useContent**\<`T`\>(`pageKey?`: `PageKey`): [`ProxiedContent`](#proxiedcontent)\<`T`\>

Returns a proxy for accessing your page's content e.g, `index.json.props`,
`show.json.props`, etc. Defaults to the current page but can target a
specific page via `pageKey`.

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

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pageKey?` | `PageKey` | Optional pageKey to target a specific page (defaults to current page) |

##### Returns

[`ProxiedContent`](#proxiedcontent)\<`T`\>

Reactive proxy to page data or fragment data, undefined if fragment not found

##### Example

```tsx
// Access current page data
const page = useContent()

// Access a specific page's data
const otherPage = useContent('/posts')
```

***

<a id="unproxy"></a>

### unproxy()

> **unproxy**\<`T`\>(`proxy`: `T`): [`Unproxy`](types.md#unproxy)\<`T`\>

Defined in: [hooks/useContent.tsx:172](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/hooks/useContent.tsx#L172)

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
