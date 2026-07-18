## Classes

<a id="superglueresponseerror"></a>

### SuperglueResponseError

Defined in: [utils/request.ts:26](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/utils/request.ts#L26)

#### Extends

- `Error`

#### Constructors

<a id="constructor"></a>

##### Constructor

> **new SuperglueResponseError**(`message`: `string`): [`SuperglueResponseError`](#superglueresponseerror)

Defined in: [utils/request.ts:29](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/utils/request.ts#L29)

###### Parameters

| Parameter | Type     |
| --------- | -------- |
| `message` | `string` |

###### Returns

[`SuperglueResponseError`](#superglueresponseerror)

###### Overrides

`Error.constructor`

#### Properties

| Property                         | Type       | Defined in                                                                                                                                      |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="response"></a> `response` | `Response` | [utils/request.ts:27](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/utils/request.ts#L27) |

## Interfaces

<a id="channelmixin"></a>

### ChannelMixin

Defined in: [types/cable.ts:25](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L25)

Mixin passed to `subscriptions.create`. Mirrors the subset of the
ActionCable subscription mixin that Superglue invokes.

#### Methods

<a id="received"></a>

##### received()

> **received**(`message`: `string`): `void`

Defined in: [types/cable.ts:26](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L26)

###### Parameters

| Parameter | Type     |
| --------- | -------- |
| `message` | `string` |

###### Returns

`void`

<a id="connected"></a>

##### connected()

> **connected**(): `void`

Defined in: [types/cable.ts:27](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L27)

###### Returns

`void`

<a id="disconnected"></a>

##### disconnected()

> **disconnected**(): `void`

Defined in: [types/cable.ts:28](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L28)

###### Returns

`void`

---

<a id="subscription"></a>

### Subscription

Defined in: [types/cable.ts:35](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L35)

The handle returned from `subscriptions.create`.

#### Methods

<a id="unsubscribe"></a>

##### unsubscribe()

> **unsubscribe**(): `void`

Defined in: [types/cable.ts:39](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L39)

###### Returns

`void`

---

<a id="subscriptions"></a>

### Subscriptions

Defined in: [types/cable.ts:46](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L46)

The `subscriptions` namespace on a Consumer.

#### Methods

<a id="create"></a>

##### create()

> **create**(`channel`: `string` \| [`ChannelNameWithParams`](#channelnamewithparams), `mixin`: [`ChannelMixin`](#channelmixin)): [`Subscription`](#subscription)

Defined in: [types/cable.ts:47](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L47)

###### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `channel` | `string` \| [`ChannelNameWithParams`](#channelnamewithparams) |
| `mixin`   | [`ChannelMixin`](#channelmixin)                               |

###### Returns

[`Subscription`](#subscription)

---

<a id="consumer"></a>

### Consumer

Defined in: [types/cable.ts:59](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L59)

The minimal Consumer surface Superglue depends on. Pass an instance of
this (e.g. `createConsumer('/cable')` from `@rails/actioncable` or
`createCable()` from `@anycable/web`) as `cable` to [createApp](#createapp).

#### Properties

| Property                                     | Type                              | Defined in                                                                                                                                  |
| -------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="subscriptions-1"></a> `subscriptions` | [`Subscriptions`](#subscriptions) | [types/cable.ts:60](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L60) |

## Type Aliases

<a id="channelnamewithparams"></a>

### ChannelNameWithParams

> **ChannelNameWithParams** = \{\[`key`: `string`\]: `undefined` \| `string` \| `number` \| `boolean`; `channel`: `string`; \}

Defined in: [types/cable.ts:15](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L15)

A channel identifier. Either a bare channel name string or an object
with a `channel` key plus arbitrary identifier params.

#### Indexable

\[`key`: `string`\]: `undefined` \| `string` \| `number` \| `boolean`

#### Properties

<a id="channel"></a>

##### channel

> **channel**: `string`

Defined in: [types/cable.ts:16](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/cable.ts#L16)

## Functions

<a id="webvisit"></a>

### webVisit()

> **webVisit**(`store`: [`SuperglueStore`](types.md#supergluestore), `path`: `string`, `options?`: [`VisitProps`](types.requests.md#visitprops)): `Promise`\<[`VisitResult`](types.md#visitresult) \| [`ErrorResult`](types.md#errorresult)\>

Defined in: [action_creators/web.ts:18](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/action_creators/web.ts#L18)

Web specific wrapper around the `visit` thunk adding asset-refresh when the
response indicates the client bundle is stale.

Returns a never-settling promise on that branch so the chain terminates with
the browser unload.

#### Parameters

| Parameter  | Type                                         |
| ---------- | -------------------------------------------- |
| `store`    | [`SuperglueStore`](types.md#supergluestore)  |
| `path`     | `string`                                     |
| `options?` | [`VisitProps`](types.requests.md#visitprops) |

#### Returns

`Promise`\<[`VisitResult`](types.md#visitresult) \| [`ErrorResult`](types.md#errorresult)\>

---

<a id="webremote"></a>

### webRemote()

> **webRemote**(`store`: [`SuperglueStore`](types.md#supergluestore), `path`: `string`, `options?`: [`RemoteProps`](types.requests.md#remoteprops)): `Promise`\<[`Result`](types.md#result) \| [`ErrorResult`](types.md#errorresult)\>

Defined in: [action_creators/web.ts:39](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/action_creators/web.ts#L39)

Web specific wrapper around the `remote` thunk. Just a passthrough.

#### Parameters

| Parameter  | Type                                           |
| ---------- | ---------------------------------------------- |
| `store`    | [`SuperglueStore`](types.md#supergluestore)    |
| `path`     | `string`                                       |
| `options?` | [`RemoteProps`](types.requests.md#remoteprops) |

#### Returns

`Promise`\<[`Result`](types.md#result) \| [`ErrorResult`](types.md#errorresult)\>

---

<a id="tofragmentref"></a>

### toFragmentRef()

> **toFragmentRef**\<`T`, `P`\>(`id`: `string`): [`FragmentRef`](types.md#fragmentref)\<`T`, `P`\>

Defined in: [hooks/useFragment.tsx:14](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useFragment.tsx#L14)

Converts a string ID to a typed FragmentRef.

#### Type Parameters

| Type Parameter          | Default type |
| ----------------------- | ------------ |
| `T`                     | -            |
| `P` _extends_ `boolean` | `false`      |

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

#### Returns

[`FragmentRef`](types.md#fragmentref)\<`T`, `P`\>

#### Example

```tsx
const author = useFragment(toFragmentRef<Author>('author_123'))
```

---

<a id="usefragment"></a>

### useFragment()

> **useFragment**\<`T`, `P`\>(`fragmentRef`: [`FragmentRef`](types.md#fragmentref)\<`T`, `P`\>, `options?`: [`ValidateOption`](types.md#validateoption)): `P` _extends_ `true` ? `T` : `undefined` \| `T`

Defined in: [hooks/useFragment.tsx:62](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useFragment.tsx#L62)

Returns a proxy for accessing a fragment's content from the store.

Passing in a fragment reference scopes the tracking of
fragments to that hook usage. This is useful in performance scenarios where you
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
  const cart = useFragment(cartRef)
}
```

SlidingCart will update only if the fragment referenced by `cartRef` updates.

#### Type Parameters

| Type Parameter          | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `T`                     | The data type being accessed                     |
| `P` _extends_ `boolean` | Whether the fragment is guaranteed to be present |

#### Parameters

| Parameter     | Type                                              | Description                |
| ------------- | ------------------------------------------------- | -------------------------- |
| `fragmentRef` | [`FragmentRef`](types.md#fragmentref)\<`T`, `P`\> | A typed fragment reference |
| `options?`    | [`ValidateOption`](types.md#validateoption)       | -                          |

#### Returns

`P` _extends_ `true` ? `T` : `undefined` \| `T`

Reactive proxy to fragment data. Returns `T` if present, `T | undefined` otherwise.

#### Example

```tsx
// Access fragment via unproxied ref
const rawContent = unproxy(content)
const user = useFragment(rawContent.user)

// Access fragment via string ID
const cart = useFragment(toFragmentRef<Cart>('cart_123'))
```

---

<a id="useupdatecontent"></a>

### useUpdateContent()

> **useUpdateContent**(): \<`T`\>(`pageKey`: `string`, `updater`: (`draft`: `T`) => `void`) => `void`

Defined in: [hooks/useUpdateContent.tsx:9](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/hooks/useUpdateContent.tsx#L9)

#### Returns

> \<`T`\>(`pageKey`: `string`, `updater`: (`draft`: `T`) => `void`): `void`

##### Type Parameters

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

##### Parameters

| Parameter | Type                     |
| --------- | ------------------------ |
| `pageKey` | `string`                 |
| `updater` | (`draft`: `T`) => `void` |

##### Returns

`void`

---

<a id="createapp"></a>

### createApp()

> **createApp**(`__namedParameters`: [`CreateAppArgs`](types.md#createappargs) & \{ `_storeResult?`: `StoreResult`; \}): [`CreateAppResult`](types.md#createappresult)

Defined in: [index.tsx:80](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/index.tsx#L80)

Bootstrap a Superglue application. Performs all of the per-request setup
(resetting the store, building visit/remote, installing history, seeding
the initial page) and returns a `{ Provider, Outlet }` pair the caller can
arrange in their own React tree.

```jsx
const { Provider, Outlet, ujs } = createApp({
  initialPage: window.SUPERGLUE_INITIAL_PAGE_STATE,
  baseUrl: location.origin,
  path: location.pathname + location.search + location.hash,
  mapping: pageIdentifierToPageComponent,
  buildVisitAndRemote,
})

createRoot(el).render(
  <div onClick={ujs.onClick} onSubmit={ujs.onSubmit}>
    <Provider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </Provider>
  </div>
)
```

#### Parameters

| Parameter           | Type                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `__namedParameters` | [`CreateAppArgs`](types.md#createappargs) & \{ `_storeResult?`: `StoreResult`; \} |

#### Returns

[`CreateAppResult`](types.md#createappresult)

---

<a id="getin"></a>

### getIn()

> **getIn**(`node`: [`JSONMappable`](types.md#jsonmappable), `path`: `string`): [`JSONValue`](types.md#jsonvalue)

Defined in: [utils/immutability.ts:22](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/utils/immutability.ts#L22)

Retrieves data from a JSON object using a [Keypath](types.md#keypath)

#### Parameters

| Parameter | Type                                    | Description |
| --------- | --------------------------------------- | ----------- |
| `node`    | [`JSONMappable`](types.md#jsonmappable) |             |
| `path`    | `string`                                |             |

#### Returns

[`JSONValue`](types.md#jsonvalue)

---

<a id="urltopagekey"></a>

### urlToPageKey()

> **urlToPageKey**(`url`: `string`): `string`

Defined in: [utils/url.ts:49](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/utils/url.ts#L49)

Converts a url to a PageKey.

#### Parameters

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `url`     | `string` |             |

#### Returns

`string`

## References

<a id="usecontent"></a>

### useContent

Re-exports [useContent](hooks.useContent.md#usecontent)

---

<a id="useupdatefragment"></a>

### useUpdateFragment

Re-exports [useUpdateFragment](hooks.useUpdateFragment.md#useupdatefragment)

---

<a id="usestreamsource"></a>

### useStreamSource

Re-exports [useStreamSource](hooks.useStreamSource.md#usestreamsource)

---

<a id="usesuperglue"></a>

### useSuperglue

Re-exports [useSuperglue](hooks.md#usesuperglue)

---

<a id="useflash"></a>

### useFlash

Re-exports [useFlash](hooks.md#useflash)

---

<a id="usesetflash"></a>

### useSetFlash

Re-exports [useSetFlash](hooks.md#usesetflash)

---

<a id="navigationprovider"></a>

### NavigationProvider

Re-exports [NavigationProvider](components.Navigation.md#navigationprovider)

---

<a id="navigationoutlet"></a>

### NavigationOutlet

Re-exports [NavigationOutlet](components.Navigation.md#navigationoutlet)

---

<a id="navigationcontext"></a>

### NavigationContext

Re-exports [NavigationContext](components.Navigation.md#navigationcontext)

---

<a id="unproxy"></a>

### unproxy

Re-exports [unproxy](hooks.useContent.md#unproxy)

---

<a id="fetchargs"></a>

### FetchArgs

Re-exports [FetchArgs](types.actions.md#fetchargs)

---

<a id="graftingsuccessaction"></a>

### GraftingSuccessAction

Re-exports [GraftingSuccessAction](types.actions.md#graftingsuccessaction)

---

<a id="graftingerroraction"></a>

### GraftingErrorAction

Re-exports [GraftingErrorAction](types.actions.md#graftingerroraction)

---

<a id="validateoption"></a>

### ValidateOption

Re-exports [ValidateOption](types.md#validateoption)

---

<a id="pagekey"></a>

### PageKey

Re-exports [PageKey](types.md#pagekey)

---

<a id="restorestrategy"></a>

### RestoreStrategy

Re-exports [RestoreStrategy](types.md#restorestrategy)

---

<a id="navigationaction"></a>

### NavigationAction

Re-exports [NavigationAction](types.md#navigationaction)

---

<a id="componentidentifier"></a>

### ComponentIdentifier

Re-exports [ComponentIdentifier](types.md#componentidentifier)

---

<a id="keypath"></a>

### Keypath

Re-exports [Keypath](types.md#keypath)

---

<a id="jsonprimitive"></a>

### JSONPrimitive

Re-exports [JSONPrimitive](types.md#jsonprimitive)

---

<a id="jsonobject"></a>

### JSONObject

Re-exports [JSONObject](types.md#jsonobject)

---

<a id="jsonmappable"></a>

### JSONMappable

Re-exports [JSONMappable](types.md#jsonmappable)

---

<a id="jsonkeyable"></a>

### JSONKeyable

Re-exports [JSONKeyable](types.md#jsonkeyable)

---

<a id="jsonvalue"></a>

### JSONValue

Re-exports [JSONValue](types.md#jsonvalue)

---

<a id="flashstate"></a>

### FlashState

Re-exports [FlashState](types.md#flashstate)

---

<a id="fragment"></a>

### Fragment

Re-exports [Fragment](types.md#fragment)

---

<a id="unproxy-1"></a>

### Unproxy

Re-exports [Unproxy](types.md#unproxy)

---

<a id="parsedresponse"></a>

### ParsedResponse

Re-exports [ParsedResponse](types.md#parsedresponse)

---

<a id="defer"></a>

### Defer

Re-exports [Defer](types.md#defer)

---

<a id="saveresponse"></a>

### SaveResponse

Re-exports [SaveResponse](types.md#saveresponse)

---

<a id="page"></a>

### Page

Re-exports [Page](types.md#page)

---

<a id="graftresponse"></a>

### GraftResponse

Re-exports [GraftResponse](types.md#graftresponse)

---

<a id="streammessage"></a>

### StreamMessage

Re-exports [StreamMessage](types.md#streammessage)

---

<a id="streamresponse"></a>

### StreamResponse

Re-exports [StreamResponse](types.md#streamresponse)

---

<a id="pageresponse"></a>

### PageResponse

Re-exports [PageResponse](types.md#pageresponse)

---

<a id="fragmentpath"></a>

### FragmentPath

Re-exports [FragmentPath](types.md#fragmentpath)

---

<a id="fragmentref"></a>

### FragmentRef

Re-exports [FragmentRef](types.md#fragmentref)

---

<a id="allpages"></a>

### AllPages

Re-exports [AllPages](types.md#allpages)

---

<a id="allfragments"></a>

### AllFragments

Re-exports [AllFragments](types.md#allfragments)

---

<a id="supergluestate"></a>

### SuperglueState

Re-exports [SuperglueState](types.md#supergluestate)

---

<a id="rootstate"></a>

### RootState

Re-exports [RootState](types.md#rootstate)

---

<a id="result"></a>

### Result

Re-exports [Result](types.md#result)

---

<a id="visitresult"></a>

### VisitResult

Re-exports [VisitResult](types.md#visitresult)

---

<a id="errorresult"></a>

### ErrorResult

Re-exports [ErrorResult](types.md#errorresult)

---

<a id="visitcreator"></a>

### VisitCreator

Re-exports [VisitCreator](types.md#visitcreator)

---

<a id="remotecreator"></a>

### RemoteCreator

Re-exports [RemoteCreator](types.md#remotecreator)

---

<a id="dispatch"></a>

### Dispatch

Re-exports [Dispatch](types.md#dispatch)

---

<a id="supergluestore"></a>

### SuperglueStore

Re-exports [SuperglueStore](types.md#supergluestore)

---

<a id="handlers"></a>

### Handlers

Re-exports [Handlers](types.md#handlers)

---

<a id="ujshandlers"></a>

### UJSHandlers

Re-exports [UJSHandlers](types.md#ujshandlers)

---

<a id="historystate"></a>

### HistoryState

Re-exports [HistoryState](types.md#historystate)

---

<a id="saveandprocesspagethunk"></a>

### SaveAndProcessPageThunk

Re-exports [SaveAndProcessPageThunk](types.md#saveandprocesspagethunk)

---

<a id="metathunk"></a>

### MetaThunk

Re-exports [MetaThunk](types.md#metathunk)

---

<a id="visitmetathunk"></a>

### VisitMetaThunk

Re-exports [VisitMetaThunk](types.md#visitmetathunk)

---

<a id="defermentthunk"></a>

### DefermentThunk

Re-exports [DefermentThunk](types.md#defermentthunk)

---

<a id="basicrequestinit"></a>

### BasicRequestInit

Re-exports [BasicRequestInit](types.md#basicrequestinit)

---

<a id="navigateto"></a>

### NavigateTo

Re-exports [NavigateTo](types.md#navigateto)

---

<a id="copyto"></a>

### CopyTo

Re-exports [CopyTo](types.md#copyto)

---

<a id="navigationcontextprops"></a>

### NavigationContextProps

Re-exports [NavigationContextProps](types.md#navigationcontextprops)

---

<a id="navigationproviderprops"></a>

### NavigationProviderProps

Re-exports [NavigationProviderProps](types.md#navigationproviderprops)

---

<a id="navigationoutletprops"></a>

### NavigationOutletProps

Re-exports [NavigationOutletProps](types.md#navigationoutletprops)

---

<a id="buildstore"></a>

### BuildStore

Re-exports [BuildStore](types.md#buildstore)

---

<a id="buildvisitandremote"></a>

### BuildVisitAndRemote

Re-exports [BuildVisitAndRemote](types.md#buildvisitandremote)

---

<a id="buildvisitandremotecontext"></a>

### BuildVisitAndRemoteContext

Re-exports [BuildVisitAndRemoteContext](types.md#buildvisitandremotecontext)

---

<a id="createappargs"></a>

### CreateAppArgs

Re-exports [CreateAppArgs](types.md#createappargs)

---

<a id="providerprops"></a>

### ProviderProps

Re-exports [ProviderProps](types.md#providerprops)

---

<a id="createappresult"></a>

### CreateAppResult

Re-exports [CreateAppResult](types.md#createappresult)

---

<a id="visit"></a>

### Visit

Re-exports [Visit](types.requests.md#visit)

---

<a id="visitprops"></a>

### VisitProps

Re-exports [VisitProps](types.requests.md#visitprops)

---

<a id="remote"></a>

### Remote

Re-exports [Remote](types.requests.md#remote)

---

<a id="remoteprops"></a>

### RemoteProps

Re-exports [RemoteProps](types.requests.md#remoteprops)

---

<a id="beforesave"></a>

### BeforeSave

Re-exports [BeforeSave](types.requests.md#beforesave-2)

---

<a id="applicationremote"></a>

### ApplicationRemote

Re-exports [ApplicationRemote](types.requests.md#applicationremote)

---

<a id="applicationvisit"></a>

### ApplicationVisit

Re-exports [ApplicationVisit](types.requests.md#applicationvisit)
