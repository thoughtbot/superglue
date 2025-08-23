## Variables

<a id="grafting_error"></a>

### GRAFTING\_ERROR

> `const` **GRAFTING\_ERROR**: `"@@superglue/GRAFTING_ERROR"` = `'@@superglue/GRAFTING_ERROR'`

Defined in: [actions.ts:12](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L12)

***

<a id="grafting_success"></a>

### GRAFTING\_SUCCESS

> `const` **GRAFTING\_SUCCESS**: `"@@superglue/GRAFTING_SUCCESS"` = `'@@superglue/GRAFTING_SUCCESS'`

Defined in: [actions.ts:13](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L13)

***

<a id="saveresponse"></a>

### saveResponse

> `const` **saveResponse**: `ActionCreatorWithPreparedPayload`\<\[\{ `pageKey`: `string`; `page`: [`SaveResponse`](types.md#saveresponse); \}\], \{ `pageKey`: `string`; `page`: [`SaveResponse`](types.md#saveresponse); \}, `"@@superglue/SAVE_RESPONSE"`, `never`, `never`\>

Defined in: [actions.ts:15](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L15)

***

<a id="copypage"></a>

### copyPage

> `const` **copyPage**: `ActionCreatorWithPayload`\<\{ `from`: `string`; `to`: `string`; \}, `string`\>

Defined in: [actions.ts:61](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L61)

A redux action you can dispatch to copy a page from one pageKey to another. Its
a very useful way to create optimistic updates with a URL change. For example:

```
import { copyPage, remote } from '@thoughtbot/superglue'

dispatch(copyPage({ from: originalKey, to: targetKey}))

... make edits to target page and finally

navigateTo(targetKey)
```

***

<a id="removepage"></a>

### removePage

> `const` **removePage**: `ActionCreatorWithPayload`\<\{ `pageKey`: `string`; \}, `string`\>

Defined in: [actions.ts:74](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L74)

A redux action you can dispatch to remove a page from your store.

```
import { removePage } from '@thoughtbot/superglue'

dispatch(removePage({ pageKey: '/delete_me_please"}))
```

***

<a id="beforefetch"></a>

### beforeFetch

> `const` **beforeFetch**: `ActionCreatorWithPayload`\<\{ `fetchArgs`: [`FetchArgs`](types.actions.md#fetchargs); \}, `string`\>

Defined in: [actions.ts:92](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L92)

A redux action called before a `fetch` takes place. It will fire in `remote`
and `visit`. You can hook into this event in your redux slices like this:

```
import { beforeFetch } from '@thoughtbot/superglue'

export const exampleSlice = createSlice({
 name: 'Example',
 initialState: {},
 extraReducers: (builder) => {
   builder.addCase(beforeFetch, (state, action) => {
```

***

<a id="beforevisit"></a>

### beforeVisit

> `const` **beforeVisit**: `ActionCreatorWithPayload`\<\{ `currentPageKey`: `string`; `fetchArgs`: [`FetchArgs`](types.actions.md#fetchargs); \}, `string`\>

Defined in: [actions.ts:110](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L110)

A redux action called before a `visit` takes place. You can hook into this event
in your redux slices like this:

```
import { beforeVisit } from '@thoughtbot/superglue'

export const exampleSlice = createSlice({
 name: 'Example',
 initialState: {},
 extraReducers: (builder) => {
   builder.addCase(beforeVisit, (state, action) => {
```

***

<a id="beforeremote"></a>

### beforeRemote

> `const` **beforeRemote**: `ActionCreatorWithPayload`\<\{ `currentPageKey`: `string`; `fetchArgs`: [`FetchArgs`](types.actions.md#fetchargs); \}, `string`\>

Defined in: [actions.ts:129](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L129)

A redux action called before `remote` takes place. You can hook into this event
in your redux slices like this:

```
import { beforeRemote } from '@thoughtbot/superglue'

export const exampleSlice = createSlice({
 name: 'Example',
 initialState: {},
 extraReducers: (builder) => {
   builder.addCase(beforeRemote, (state, action) => {
```

***

<a id="receiveresponse"></a>

### receiveResponse

> `const` **receiveResponse**: `ActionCreatorWithPreparedPayload`\<\[\{ `pageKey`: `string`; `response`: [`PageResponse`](types.md#pageresponse); \}\], \{ `pageKey`: `string`; `response`: [`PageResponse`](types.md#pageresponse); \}, `"@@superglue/RECEIVE_RESPONSE"`, `never`, `never`\>

Defined in: [actions.ts:176](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/actions.ts#L176)

***

<a id="rootreducer"></a>

### rootReducer

> `const` **rootReducer**: \{ `superglue`: (`state`: [`SuperglueState`](types.md#supergluestate), `action`: `Action`) => [`SuperglueState`](types.md#supergluestate); `pages`: (`state`: [`AllPages`](types.md#allpages), `action`: `Action`) => [`AllPages`](types.md#allpages); `fragments`: (`state`: [`AllFragments`](types.md#allfragments), `action`: `Action`) => [`AllFragments`](types.md#allfragments); \}

Defined in: [reducers/index.ts:290](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/reducers/index.ts#L290)

#### Type declaration

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue"></a> `superglue()` | (`state`: [`SuperglueState`](types.md#supergluestate), `action`: `Action`) => [`SuperglueState`](types.md#supergluestate) | `superglueReducer` | [reducers/index.ts:291](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/reducers/index.ts#L291) |
| <a id="pages"></a> `pages()` | (`state`: [`AllPages`](types.md#allpages), `action`: `Action`) => [`AllPages`](types.md#allpages) | `pageReducer` | [reducers/index.ts:292](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/reducers/index.ts#L292) |
| <a id="fragments"></a> `fragments()` | (`state`: [`AllFragments`](types.md#allfragments), `action`: `Action`) => [`AllFragments`](types.md#allfragments) | `fragmentReducer` | [reducers/index.ts:293](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/reducers/index.ts#L293) |

## Functions

<a id="saveandprocesspage"></a>

### saveAndProcessPage()

> **saveAndProcessPage**(`pageKey`: `string`, `page`: [`PageResponse`](types.md#pageresponse)): [`SaveAndProcessPageThunk`](types.md#saveandprocesspagethunk)

Defined in: [action\_creators/index.ts:91](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/action_creators/index.ts#L91)

Save and process a rendered view from PropsTemplate. This is the primitive
function that `visit` and `remote` calls when it receives a page.

If you render a page outside the normal request response cycle, e.g,
websocket, you can use this function to save the payload.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pageKey` | `string` |
| `page` | [`PageResponse`](types.md#pageresponse) |

#### Returns

[`SaveAndProcessPageThunk`](types.md#saveandprocesspagethunk)

***

<a id="usesetfragment"></a>

### useSetFragment()

> **useSetFragment**(): \{\<`T`\>(`fragmentRef`: `T`, `updater`: (`draft`: [`Unproxy`](types.md#unproxy)\<`Unpack`\<`T`\>\>) => `void`): `void`; \<`T`\>(`fragmentId`: `string`, `updater`: (`draft`: `T`) => `void`): `void`; \}

Defined in: [hooks/useSetFragment.tsx:32](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useSetFragment.tsx#L32)

Hook for mutating fragments using Immer drafts.

#### Returns

> \<`T`\>(`fragmentRef`: `T`, `updater`: (`draft`: [`Unproxy`](types.md#unproxy)\<`Unpack`\<`T`\>\>) => `void`): `void`

Updates a fragment using a [FragmentRef](types.md#fragmentref) object.

##### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* [`Fragment`](types.md#fragment)\<`unknown`\> |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fragmentRef` | `T` | Fragment reference object containing __id |
| `updater` | (`draft`: [`Unproxy`](types.md#unproxy)\<`Unpack`\<`T`\>\>) => `void` | Immer draft function for mutating fragment data |

##### Returns

`void`

> \<`T`\>(`fragmentId`: `string`, `updater`: (`draft`: `T`) => `void`): `void`

Updates a fragment using a fragment ID string.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fragmentId` | `string` | The fragment ID string |
| `updater` | (`draft`: `T`) => `void` | Immer draft function for mutating fragment data |

##### Returns

`void`

#### Example

```tsx
const set = useSetFragment()

// Update via fragment reference
set(userRef, draft => {
  draft.name = "Updated Name"
  draft.email = "new@email.com"
})

// Update via fragment ID directly
set('user_123', draft => {
  draft.profile.bio = "Updated bio"
})
```

***

<a id="usestreamsource"></a>

### useStreamSource()

> **useStreamSource**(`channel`: `StreamSourceProps`): \{ `connected`: `boolean`; `subscription`: `null` \| `Subscription`\<`Consumer`\>; \}

Defined in: [hooks/useStreamSource.tsx:172](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useStreamSource.tsx#L172)

Creates a subscription to an ActionCable channel for real-time streaming
updates.

This hook manages the lifecycle of an ActionCable subscription, automatically
connecting when the cable is available and cleaning up on unmount. Stream
messages are processed through StreamActions to update the Redux store.

Typically used with channel configuration generated by the Rails helper
`stream_from_props` helper in your `props` templates.

 *

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | `StreamSourceProps` | Channel configuration as string or ChannelNameWithParams object, typically generated by Rails `stream_from_props` helper |

#### Returns

Object containing connection status and subscription instance

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `connected` | `boolean` | Whether the ActionCable subscription is currently connected | [hooks/useStreamSource.tsx:174](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useStreamSource.tsx#L174) |
| `subscription` | `null` \| `Subscription`\<`Consumer`\> | The active ActionCable subscription instance, null if not connected | [hooks/useStreamSource.tsx:176](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/hooks/useStreamSource.tsx#L176) |

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
  room_id: roomId
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

***

<a id="preparestore"></a>

### prepareStore()

> **prepareStore**(`store`: [`SuperglueStore`](types.md#supergluestore), `initialPage`: [`SaveResponse`](types.md#saveresponse), `path`: `string`): `void`

Defined in: [index.tsx:71](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L71)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `store` | [`SuperglueStore`](types.md#supergluestore) |
| `initialPage` | [`SaveResponse`](types.md#saveresponse) |
| `path` | `string` |

#### Returns

`void`

***

<a id="setup"></a>

### setup()

> **setup**(`__namedParameters`: [`SetupProps`](types.md#setupprops)): \{ `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); `nextHistory`: `History`; `initialPageKey`: `string`; `ujs`: [`Handlers`](types.md#handlers); `streamActions`: `StreamActions`; \}

Defined in: [index.tsx:95](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L95)

This is the setup function that the Application calls. Use this function if
you like to build your own Application component.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`SetupProps`](types.md#setupprops) |

#### Returns

\{ `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); `nextHistory`: `History`; `initialPageKey`: `string`; `ujs`: [`Handlers`](types.md#handlers); `streamActions`: `StreamActions`; \}

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| `visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) | - | [index.tsx:123](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L123) |
| `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | - | [index.tsx:124](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L124) |
| `nextHistory` | `History` | - | [index.tsx:125](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L125) |
| `initialPageKey` | `string` | - | [index.tsx:126](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L126) |
| `ujs` | [`Handlers`](types.md#handlers) | `handlers` | [index.tsx:127](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L127) |
| `streamActions` | `StreamActions` | - | [index.tsx:128](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L128) |

***

<a id="application"></a>

### Application()

> **Application**(`__namedParameters`: [`ApplicationProps`](types.md#applicationprops)): `Element`

Defined in: [index.tsx:139](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/index.tsx#L139)

The entry point to your superglue application. It sets up the redux Provider,
redux state and the Navigation component.

This is a simple component, you can override this by copying the source code and
use the exported methods used by this component (`start` and `ujsHandler`).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`ApplicationProps`](types.md#applicationprops) |

#### Returns

`Element`

***

<a id="pagereducer"></a>

### pageReducer()

> **pageReducer**(`state`: [`AllPages`](types.md#allpages), `action`: `Action`): [`AllPages`](types.md#allpages)

Defined in: [reducers/index.ts:159](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/reducers/index.ts#L159)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `state` | [`AllPages`](types.md#allpages) |
| `action` | `Action` |

#### Returns

[`AllPages`](types.md#allpages)

***

<a id="supergluereducer"></a>

### superglueReducer()

> **superglueReducer**(`state`: [`SuperglueState`](types.md#supergluestate), `action`: `Action`): [`SuperglueState`](types.md#supergluestate)

Defined in: [reducers/index.ts:192](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/reducers/index.ts#L192)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `state` | [`SuperglueState`](types.md#supergluestate) |
| `action` | `Action` |

#### Returns

[`SuperglueState`](types.md#supergluestate)

***

<a id="getin"></a>

### getIn()

> **getIn**(`node`: [`JSONMappable`](types.md#jsonmappable), `path`: `string`): [`JSONValue`](types.md#jsonvalue)

Defined in: [utils/immutability.ts:22](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/utils/immutability.ts#L22)

Retrieves data from a JSON object using a [Keypath](types.md#keypath)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node` | [`JSONMappable`](types.md#jsonmappable) |  |
| `path` | `string` |  |

#### Returns

[`JSONValue`](types.md#jsonvalue)

***

<a id="urltopagekey"></a>

### urlToPageKey()

> **urlToPageKey**(`url`: `string`): `string`

Defined in: [utils/url.ts:49](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/utils/url.ts#L49)

Converts a url to a PageKey.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` |  |

#### Returns

`string`

## References

<a id="usecontent"></a>

### useContent

Re-exports [useContent](hooks.useContent.md#usecontent)

***

<a id="usesuperglue"></a>

### useSuperglue

Re-exports [useSuperglue](hooks.md#usesuperglue)

***

<a id="navigationprovider"></a>

### NavigationProvider

Re-exports [NavigationProvider](components.Navigation.md#navigationprovider)

***

<a id="navigationcontext"></a>

### NavigationContext

Re-exports [NavigationContext](components.Navigation.md#navigationcontext)

***

<a id="unproxy"></a>

### unproxy

Re-exports [unproxy](hooks.useContent.md#unproxy)

***

<a id="fetchargs"></a>

### FetchArgs

Re-exports [FetchArgs](types.actions.md#fetchargs)

***

<a id="graftingsuccessaction"></a>

### GraftingSuccessAction

Re-exports [GraftingSuccessAction](types.actions.md#graftingsuccessaction)

***

<a id="graftingerroraction"></a>

### GraftingErrorAction

Re-exports [GraftingErrorAction](types.actions.md#graftingerroraction)

***

<a id="pagekey"></a>

### PageKey

Re-exports [PageKey](types.md#pagekey)

***

<a id="restorestrategy"></a>

### RestoreStrategy

Re-exports [RestoreStrategy](types.md#restorestrategy)

***

<a id="navigationaction"></a>

### NavigationAction

Re-exports [NavigationAction](types.md#navigationaction)

***

<a id="componentidentifier"></a>

### ComponentIdentifier

Re-exports [ComponentIdentifier](types.md#componentidentifier)

***

<a id="keypath"></a>

### Keypath

Re-exports [Keypath](types.md#keypath)

***

<a id="jsonprimitive"></a>

### JSONPrimitive

Re-exports [JSONPrimitive](types.md#jsonprimitive)

***

<a id="jsonobject"></a>

### JSONObject

Re-exports [JSONObject](types.md#jsonobject)

***

<a id="jsonmappable"></a>

### JSONMappable

Re-exports [JSONMappable](types.md#jsonmappable)

***

<a id="jsonkeyable"></a>

### JSONKeyable

Re-exports [JSONKeyable](types.md#jsonkeyable)

***

<a id="jsonvalue"></a>

### JSONValue

Re-exports [JSONValue](types.md#jsonvalue)

***

<a id="fragment"></a>

### Fragment

Re-exports [Fragment](types.md#fragment)

***

<a id="unproxy-1"></a>

### Unproxy

Re-exports [Unproxy](types.md#unproxy)

***

<a id="parsedresponse"></a>

### ParsedResponse

Re-exports [ParsedResponse](types.md#parsedresponse)

***

<a id="defer"></a>

### Defer

Re-exports [Defer](types.md#defer)

***

<a id="saveresponse-1"></a>

### SaveResponse

Re-exports [SaveResponse](types.md#saveresponse)

***

<a id="page"></a>

### Page

Re-exports [Page](types.md#page)

***

<a id="graftresponse"></a>

### GraftResponse

Re-exports [GraftResponse](types.md#graftresponse)

***

<a id="streammessage"></a>

### StreamMessage

Re-exports [StreamMessage](types.md#streammessage)

***

<a id="streamresponse"></a>

### StreamResponse

Re-exports [StreamResponse](types.md#streamresponse)

***

<a id="pageresponse"></a>

### PageResponse

Re-exports [PageResponse](types.md#pageresponse)

***

<a id="fragmentpath"></a>

### FragmentPath

Re-exports [FragmentPath](types.md#fragmentpath)

***

<a id="fragmentref"></a>

### FragmentRef

Re-exports [FragmentRef](types.md#fragmentref)

***

<a id="allpages"></a>

### AllPages

Re-exports [AllPages](types.md#allpages)

***

<a id="allfragments"></a>

### AllFragments

Re-exports [AllFragments](types.md#allfragments)

***

<a id="supergluestate"></a>

### SuperglueState

Re-exports [SuperglueState](types.md#supergluestate)

***

<a id="rootstate"></a>

### RootState

Re-exports [RootState](types.md#rootstate)

***

<a id="meta"></a>

### Meta

Re-exports [Meta](types.md#meta)

***

<a id="visitmeta"></a>

### VisitMeta

Re-exports [VisitMeta](types.md#visitmeta)

***

<a id="visitcreator"></a>

### VisitCreator

Re-exports [VisitCreator](types.md#visitcreator)

***

<a id="remotecreator"></a>

### RemoteCreator

Re-exports [RemoteCreator](types.md#remotecreator)

***

<a id="dispatch"></a>

### Dispatch

Re-exports [Dispatch](types.md#dispatch)

***

<a id="supergluestore"></a>

### SuperglueStore

Re-exports [SuperglueStore](types.md#supergluestore)

***

<a id="handlers"></a>

### Handlers

Re-exports [Handlers](types.md#handlers)

***

<a id="ujshandlers"></a>

### UJSHandlers

Re-exports [UJSHandlers](types.md#ujshandlers)

***

<a id="historystate"></a>

### HistoryState

Re-exports [HistoryState](types.md#historystate)

***

<a id="saveandprocesspagethunk"></a>

### SaveAndProcessPageThunk

Re-exports [SaveAndProcessPageThunk](types.md#saveandprocesspagethunk)

***

<a id="metathunk"></a>

### MetaThunk

Re-exports [MetaThunk](types.md#metathunk)

***

<a id="visitmetathunk"></a>

### VisitMetaThunk

Re-exports [VisitMetaThunk](types.md#visitmetathunk)

***

<a id="defermentthunk"></a>

### DefermentThunk

Re-exports [DefermentThunk](types.md#defermentthunk)

***

<a id="basicrequestinit"></a>

### BasicRequestInit

Re-exports [BasicRequestInit](types.md#basicrequestinit)

***

<a id="navigateto"></a>

### NavigateTo

Re-exports [NavigateTo](types.md#navigateto)

***

<a id="navigationcontextprops"></a>

### NavigationContextProps

Re-exports [NavigationContextProps](types.md#navigationcontextprops)

***

<a id="navigationproviderprops"></a>

### NavigationProviderProps

Re-exports [NavigationProviderProps](types.md#navigationproviderprops)

***

<a id="buildstore"></a>

### BuildStore

Re-exports [BuildStore](types.md#buildstore)

***

<a id="buildvisitandremote"></a>

### BuildVisitAndRemote

Re-exports [BuildVisitAndRemote](types.md#buildvisitandremote)

***

<a id="setupprops"></a>

### SetupProps

Re-exports [SetupProps](types.md#setupprops)

***

<a id="applicationprops"></a>

### ApplicationProps

Re-exports [ApplicationProps](types.md#applicationprops)

***

<a id="visit"></a>

### Visit

Re-exports [Visit](types.requests.md#visit)

***

<a id="visitprops"></a>

### VisitProps

Re-exports [VisitProps](types.requests.md#visitprops)

***

<a id="remote"></a>

### Remote

Re-exports [Remote](types.requests.md#remote)

***

<a id="remoteprops"></a>

### RemoteProps

Re-exports [RemoteProps](types.requests.md#remoteprops)

***

<a id="beforesave"></a>

### BeforeSave

Re-exports [BeforeSave](types.requests.md#beforesave-2)

***

<a id="applicationremote"></a>

### ApplicationRemote

Re-exports [ApplicationRemote](types.requests.md#applicationremote)

***

<a id="applicationvisit"></a>

### ApplicationVisit

Re-exports [ApplicationVisit](types.requests.md#applicationvisit)
