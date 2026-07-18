## Functions

<a id="usesuperglue"></a>

### useSuperglue()

> **useSuperglue**(): [`SuperglueState`](types.md#supergluestate)

Defined in: [hooks/index.ts:17](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/index.ts#L17)

A lightweight hook that grabs the superglue state from the store.

#### Returns

[`SuperglueState`](types.md#supergluestate)

---

<a id="useflash"></a>

### useFlash()

> **useFlash**\<`T`\>(): `T`

Defined in: [hooks/index.ts:31](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/index.ts#L31)

A hook that returns the current flash state from the store.
Flash is cleared automatically on every visit.

Pass a type parameter to narrow the flash shape:

```ts
const flash = useFlash<{ notice?: string; alert?: string }>()
```

#### Type Parameters

| Type Parameter | Default type                        |
| -------------- | ----------------------------------- |
| `T`            | [`FlashState`](types.md#flashstate) |

#### Returns

`T`

---

<a id="usesetflash"></a>

### useSetFlash()

> **useSetFlash**(): \{ `setFlash`: (`flash`: [`FlashState`](types.md#flashstate)) => `void`; `clearFlash`: (`key?`: `string`) => `void`; \}

Defined in: [hooks/index.ts:47](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/index.ts#L47)

A hook that returns functions to set and clear flash messages
on the client side.

```ts
const { setFlash, clearFlash } = useSetFlash()

setFlash({ notice: 'Saved!' })
clearFlash('notice')
clearFlash() // clears all
```

#### Returns

\{ `setFlash`: (`flash`: [`FlashState`](types.md#flashstate)) => `void`; `clearFlash`: (`key?`: `string`) => `void`; \}

| Name           | Type                                                     | Defined in                                                                                                                                  |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `setFlash()`   | (`flash`: [`FlashState`](types.md#flashstate)) => `void` | [hooks/index.ts:64](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/index.ts#L64) |
| `clearFlash()` | (`key?`: `string`) => `void`                             | [hooks/index.ts:64](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/index.ts#L64) |

## References

<a id="usecontent"></a>

### useContent

Re-exports [useContent](hooks.useContent.md#usecontent)

---

<a id="unproxy"></a>

### unproxy

Re-exports [unproxy](hooks.useContent.md#unproxy)

---

<a id="usefragment"></a>

### useFragment

Re-exports [useFragment](index.md#usefragment)

---

<a id="tofragmentref"></a>

### toFragmentRef

Re-exports [toFragmentRef](index.md#tofragmentref)

---

<a id="useupdatefragment"></a>

### useUpdateFragment

Re-exports [useUpdateFragment](hooks.useUpdateFragment.md#useupdatefragment)

---

<a id="useupdatecontent"></a>

### useUpdateContent

Re-exports [useUpdateContent](index.md#useupdatecontent)

---

<a id="usestreamsource"></a>

### useStreamSource

Re-exports [useStreamSource](hooks.useStreamSource.md#usestreamsource)
