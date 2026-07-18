## Classes

<a id="streamactions"></a>

### StreamActions

Defined in: [hooks/useStreamSource.tsx:36](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L36)

Actions for handling stream operations like append, prepend, and update

#### Constructors

<a id="constructor"></a>

##### Constructor

> **new StreamActions**(`__namedParameters`: \{ `store`: [`SuperglueStore`](types.md#supergluestore); \}): [`StreamActions`](#streamactions)

Defined in: [hooks/useStreamSource.tsx:40](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L40)

###### Parameters

| Parameter                 | Type                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `__namedParameters`       | \{ `store`: [`SuperglueStore`](types.md#supergluestore); \} |
| `__namedParameters.store` | [`SuperglueStore`](types.md#supergluestore)                 |

###### Returns

[`StreamActions`](#streamactions)

#### Properties

| Property                                       | Modifier | Type     | Defined in                                                                                                                                                        |
| ---------------------------------------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="attributeprefix"></a> `attributePrefix` | `public` | `string` | [hooks/useStreamSource.tsx:37](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L37) |

#### Methods

<a id="prepend"></a>

##### prepend()

> **prepend**(`fragments`: `string`[], `data`: [`JSONMappable`](types.md#jsonmappable), `options`: \{ `saveAs?`: `string`; \}): `void`

Defined in: [hooks/useStreamSource.tsx:44](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L44)

###### Parameters

| Parameter         | Type                                    |
| ----------------- | --------------------------------------- |
| `fragments`       | `string`[]                              |
| `data`            | [`JSONMappable`](types.md#jsonmappable) |
| `options`         | \{ `saveAs?`: `string`; \}              |
| `options.saveAs?` | `string`                                |

###### Returns

`void`

<a id="update"></a>

##### update()

> **update**(`fragment`: `string`, `data`: [`JSONMappable`](types.md#jsonmappable)): `void`

Defined in: [hooks/useStreamSource.tsx:52](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L52)

###### Parameters

| Parameter  | Type                                    |
| ---------- | --------------------------------------- |
| `fragment` | `string`                                |
| `data`     | [`JSONMappable`](types.md#jsonmappable) |

###### Returns

`void`

<a id="append"></a>

##### append()

> **append**(`fragments`: `string`[], `data`: [`JSONMappable`](types.md#jsonmappable), `options`: \{ `saveAs?`: `string`; \}): `void`

Defined in: [hooks/useStreamSource.tsx:56](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L56)

###### Parameters

| Parameter         | Type                                    |
| ----------------- | --------------------------------------- |
| `fragments`       | `string`[]                              |
| `data`            | [`JSONMappable`](types.md#jsonmappable) |
| `options`         | \{ `saveAs?`: `string`; \}              |
| `options.saveAs?` | `string`                                |

###### Returns

`void`

<a id="handle"></a>

##### handle()

> **handle**(`rawMessage`: `string`): `void`

Defined in: [hooks/useStreamSource.tsx:64](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L64)

###### Parameters

| Parameter    | Type     |
| ------------ | -------- |
| `rawMessage` | `string` |

###### Returns

`void`

## Type Aliases

<a id="streamsourceprops"></a>

### StreamSourceProps

> **StreamSourceProps** = `string` \| [`ChannelNameWithParams`](index.md#channelnamewithparams)

Defined in: [hooks/useStreamSource.tsx:19](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L19)

Channel configuration for stream sources

---

<a id="streammessage"></a>

### StreamMessage

> **StreamMessage** = \{ `action`: `"handleStreamMessage"`; `data`: [`JSONMappable`](types.md#jsonmappable); `fragmentIds`: `string`[]; `handler`: `"append"` \| `"prepend"` \| `"update"`; `options`: `Record`\<`string`, `string`\>; `fragments`: [`FragmentPath`](types.md#fragmentpath)[]; \}

Defined in: [hooks/useStreamSource.tsx:21](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L21)

#### Properties

<a id="action"></a>

##### action

> **action**: `"handleStreamMessage"`

Defined in: [hooks/useStreamSource.tsx:22](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L22)

<a id="data"></a>

##### data

> **data**: [`JSONMappable`](types.md#jsonmappable)

Defined in: [hooks/useStreamSource.tsx:23](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L23)

<a id="fragmentids"></a>

##### fragmentIds

> **fragmentIds**: `string`[]

Defined in: [hooks/useStreamSource.tsx:24](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L24)

<a id="handler"></a>

##### handler

> **handler**: `"append"` \| `"prepend"` \| `"update"`

Defined in: [hooks/useStreamSource.tsx:25](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L25)

<a id="options"></a>

##### options

> **options**: `Record`\<`string`, `string`\>

Defined in: [hooks/useStreamSource.tsx:26](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L26)

<a id="fragments"></a>

##### fragments

> **fragments**: [`FragmentPath`](types.md#fragmentpath)[]

Defined in: [hooks/useStreamSource.tsx:27](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L27)

## Variables

<a id="cablecontext"></a>

### CableContext

> `const` **CableContext**: `Context`\<\{ `cable`: `null` \| [`Consumer`](index.md#consumer); `streamActions`: `null` \| [`StreamActions`](#streamactions); \}\>

Defined in: [hooks/useStreamSource.tsx:73](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L73)

## Functions

<a id="usestreamsource"></a>

### useStreamSource()

> **useStreamSource**(`channel`: [`StreamSourceProps`](#streamsourceprops)): \{ `connected`: `boolean`; `subscription`: `null` \| [`Subscription`](index.md#subscription); \}

Defined in: [hooks/useStreamSource.tsx:138](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L138)

Creates a subscription to an ActionCable channel for real-time streaming
updates.

This hook manages the lifecycle of an ActionCable subscription, automatically
connecting when the cable is available and cleaning up on unmount. Stream
messages are processed through StreamActions to update the Redux store.

Typically used with channel configuration generated by the Rails helper
`stream_from_props` helper in your `props` templates.

-

#### Parameters

| Parameter | Type                                      | Description                                                                                                              |
| --------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `channel` | [`StreamSourceProps`](#streamsourceprops) | Channel configuration as string or ChannelNameWithParams object, typically generated by Rails `stream_from_props` helper |

#### Returns

Object containing connection status and subscription instance

| Name           | Type                                              | Description                                                         | Defined in                                                                                                                                                          |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `connected`    | `boolean`                                         | Whether the ActionCable subscription is currently connected         | [hooks/useStreamSource.tsx:140](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L140) |
| `subscription` | `null` \| [`Subscription`](index.md#subscription) | The active ActionCable subscription instance, null if not connected | [hooks/useStreamSource.tsx:142](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useStreamSource.tsx#L142) |

#### Examples

Using the helper:

```ruby
# app/views/chat_rooms/show.json.props
json.chatChannel stream_from_props("messages")
```

```tsx
const content = useContent()
const { connected } = useStreamSource(content.chatChannel)
```

Basic channel subscription:

```tsx
const { connected } = useStreamSource('ChatChannel')
```

Channel with parameters:

```tsx
const { connected } = useStreamSource({
  channel: 'ChatChannel',
  room_id: roomId,
})
```

Using connection status:

```tsx
const { connected, subscription } = useStreamSource('NotificationsChannel')

return (
  <div>
    {connected ? 'Connected' : 'Connecting...'}
    {subscription && <span>Subscription active</span>}
  </div>
)
```
