## Type Aliases

<a id="unpack"></a>

### Unpack\<T\>

> **Unpack**\<`T`\> = `T` _extends_ [`Fragment`](types.md#fragment)\<infer U, `unknown`\> ? `U` : `never`

Defined in: [hooks/useUpdateFragment.tsx:14](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useUpdateFragment.tsx#L14)

Utility type to extract the data type from a Fragment wrapper

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

## Functions

<a id="useupdatefragment"></a>

### useUpdateFragment()

> **useUpdateFragment**(): \{\<`T`, `P`\>(`fragmentRef`: [`FragmentRef`](types.md#fragmentref)\<`T`, `P`\>, `updater`: (`draft`: [`Unproxy`](types.md#unproxy)\<`T`\>) => `void`): `void`; \<`T`\>(`fragment`: `T`, `updater`: (`draft`: [`Unproxy`](types.md#unproxy)\<[`Unpack`](#unpack)\<`T`\>\>) => `void`): `void`; \}

Defined in: [hooks/useUpdateFragment.tsx:36](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useUpdateFragment.tsx#L36)

Hook for mutating fragments using Immer drafts.

#### Returns

> \<`T`, `P`\>(`fragmentRef`: [`FragmentRef`](types.md#fragmentref)\<`T`, `P`\>, `updater`: (`draft`: [`Unproxy`](types.md#unproxy)\<`T`\>) => `void`): `void`

Updates a fragment using a [FragmentRef](types.md#fragmentref) object.

##### Type Parameters

| Type Parameter          |
| ----------------------- |
| `T`                     |
| `P` _extends_ `boolean` |

##### Parameters

| Parameter     | Type                                                      | Description                                     |
| ------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `fragmentRef` | [`FragmentRef`](types.md#fragmentref)\<`T`, `P`\>         | Fragment reference from unproxied content       |
| `updater`     | (`draft`: [`Unproxy`](types.md#unproxy)\<`T`\>) => `void` | Immer draft function for mutating fragment data |

##### Returns

`void`

> \<`T`\>(`fragment`: `T`, `updater`: (`draft`: [`Unproxy`](types.md#unproxy)\<[`Unpack`](#unpack)\<`T`\>\>) => `void`): `void`

Updates a fragment using a [Fragment](types.md#fragment) object.

##### Type Parameters

| Type Parameter                        |
| ------------------------------------- |
| `T` _extends_ \{ `__id`: `string`; \} |

##### Parameters

| Parameter  | Type                                                                             | Description                                     |
| ---------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| `fragment` | `T`                                                                              | Fragment object from proxied content            |
| `updater`  | (`draft`: [`Unproxy`](types.md#unproxy)\<[`Unpack`](#unpack)\<`T`\>\>) => `void` | Immer draft function for mutating fragment data |

##### Returns

`void`

#### Example

```tsx
const update = useUpdateFragment()

// Update via fragment reference
update(userRef, (draft) => {
  draft.name = 'Updated Name'
  draft.email = 'new@email.com'
})

// Update via fragment ID directly
update('user_123', (draft) => {
  draft.profile.bio = 'Updated bio'
})
```
