## Classes

<a id="superglueresponseerror"></a>

### SuperglueResponseError

Defined in: [utils/request.ts:26](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/utils/request.ts#L26)

#### Extends

- `Error`

#### Constructors

<a id="constructor"></a>

##### Constructor

> **new SuperglueResponseError**(`message`: `string`): [`SuperglueResponseError`](#superglueresponseerror)

Defined in: [utils/request.ts:29](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/utils/request.ts#L29)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

###### Returns

[`SuperglueResponseError`](#superglueresponseerror)

###### Overrides

`Error.constructor`

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="response-1"></a> `response` | `Response` | [utils/request.ts:27](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/utils/request.ts#L27) |

## Interfaces

<a id="graftingsuccessaction"></a>

### GraftingSuccessAction

Defined in: [types/actions.ts:11](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L11)

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type"></a> `type` | `string` | `Action.type` | [types/actions.ts:12](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L12) |
| <a id="payload"></a> `payload` | \{ `pageKey`: `string`; `keyPath`: `string`; \} | - | [types/actions.ts:13](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L13) |
| `payload.pageKey` | `string` | - | [types/actions.ts:14](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L14) |
| `payload.keyPath` | `string` | - | [types/actions.ts:15](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L15) |

***

<a id="graftingerroraction"></a>

### GraftingErrorAction

Defined in: [types/actions.ts:19](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L19)

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-1"></a> `type` | `string` | `Action.type` | [types/actions.ts:20](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L20) |
| <a id="payload-1"></a> `payload` | \{ `pageKey`: `string`; `url`: `string`; `err`: `unknown`; `keyPath`: `string`; \} | - | [types/actions.ts:21](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L21) |
| `payload.pageKey` | `string` | - | [types/actions.ts:22](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L22) |
| `payload.url` | `string` | - | [types/actions.ts:23](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L23) |
| `payload.err` | `unknown` | - | [types/actions.ts:24](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L24) |
| `payload.keyPath` | `string` | - | [types/actions.ts:25](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L25) |

***

<a id="channelmixin"></a>

### ChannelMixin

Defined in: [types/cable.ts:25](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L25)

Mixin passed to `subscriptions.create`. Mirrors the subset of the
ActionCable subscription mixin that Superglue invokes.

#### Methods

<a id="received"></a>

##### received()

> **received**(`message`: `string`): `void`

Defined in: [types/cable.ts:26](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L26)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

###### Returns

`void`

<a id="connected"></a>

##### connected()

> **connected**(): `void`

Defined in: [types/cable.ts:27](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L27)

###### Returns

`void`

<a id="disconnected"></a>

##### disconnected()

> **disconnected**(): `void`

Defined in: [types/cable.ts:28](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L28)

###### Returns

`void`

***

<a id="subscription"></a>

### Subscription

Defined in: [types/cable.ts:35](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L35)

The handle returned from `subscriptions.create`.

#### Methods

<a id="unsubscribe"></a>

##### unsubscribe()

> **unsubscribe**(): `void`

Defined in: [types/cable.ts:39](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L39)

###### Returns

`void`

***

<a id="subscriptions"></a>

### Subscriptions

Defined in: [types/cable.ts:46](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L46)

The `subscriptions` namespace on a Consumer.

#### Methods

<a id="create"></a>

##### create()

> **create**(`channel`: `string` \| [`ChannelNameWithParams`](#channelnamewithparams), `mixin`: [`ChannelMixin`](#channelmixin)): [`Subscription`](#subscription)

Defined in: [types/cable.ts:47](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L47)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `channel` | `string` \| [`ChannelNameWithParams`](#channelnamewithparams) |
| `mixin` | [`ChannelMixin`](#channelmixin) |

###### Returns

[`Subscription`](#subscription)

***

<a id="consumer"></a>

### Consumer

Defined in: [types/cable.ts:59](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L59)

The minimal Consumer surface Superglue depends on. Pass an instance of
this (e.g. `createConsumer('/cable')` from `@rails/actioncable` or
`createCable()` from `@anycable/web`) as `cable` to [createApp](#createapp).

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="subscriptions-1"></a> `subscriptions` | [`Subscriptions`](#subscriptions) | [types/cable.ts:60](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L60) |

***

<a id="parsedresponse"></a>

### ParsedResponse

Defined in: [types/index.ts:199](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L199)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="rsp"></a> `rsp` | `Response` | [types/index.ts:200](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L200) |
| <a id="json"></a> `json` | [`PageResponse`](#pageresponse) | [types/index.ts:201](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L201) |

***

<a id="defer"></a>

### Defer

Defined in: [types/index.ts:225](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L225)

Defer is a node in the page response thats been intentionally filled
with empty or placeholder data for the purposes of fetching it later.

You would typically use it with props_template for parts of a page that you
know would be slower to load.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="url"></a> `url` | `string` | A url with props_at keypath in the query parameter to indicate how to dig for the data, and where to place the data. | [types/index.ts:226](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L226) |
| <a id="type-2"></a> `type` | `"auto"` \| `"manual"` | When set to `auto` Superglue will automatically make the request using the `url`. When set to `manual`, Superglue does nothing, and you would need to manually use `remote` with the `url` to fetch the missing data. | [types/index.ts:227](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L227) |
| <a id="path"></a> `path` | `string` | A keypath indicates how to dig for the data and where to place the data. | [types/index.ts:228](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L228) |
| <a id="successaction"></a> `successAction` | `string` | a user defined action for Superglue to dispatch when auto deferement is successful | [types/index.ts:229](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L229) |
| <a id="failaction"></a> `failAction` | `string` | a user defined action for Superglue to dispatch when auto deferement failed | [types/index.ts:230](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L230) |

***

<a id="graftresponse"></a>

### GraftResponse\<T\>

Defined in: [types/index.ts:266](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L266)

The GraftResponse is responsible for partial updates using props_template's
digging functionality in Superglue.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data-1"></a> `data` | `T` | - | [types/index.ts:267](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L267) |
| <a id="componentidentifier-2"></a> `componentIdentifier` | `string` | - | [types/index.ts:268](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L268) |
| <a id="assets-1"></a> `assets` | `string`[] | - | [types/index.ts:269](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L269) |
| <a id="csrftoken-1"></a> `csrfToken?` | `string` | - | [types/index.ts:270](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L270) |
| <a id="fragments-1"></a> `fragments` | [`FragmentPath`](#fragmentpath)[] | - | [types/index.ts:271](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L271) |
| <a id="defers-1"></a> `defers` | [`Defer`](#defer)[] | - | [types/index.ts:272](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L272) |
| <a id="flash-1"></a> `flash` | [`FlashState`](#flashstate) | - | [types/index.ts:273](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L273) |
| <a id="action-1"></a> `action` | `"graft"` | - | [types/index.ts:274](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L274) |
| <a id="renderedat-1"></a> `renderedAt` | `number` | - | [types/index.ts:275](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L275) |
| <a id="path-1"></a> `path` | `string` | Used by superglue to replace the data at that location. | [types/index.ts:277](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L277) |
| <a id="fragmentcontext"></a> `fragmentContext?` | `string` | - | [types/index.ts:278](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L278) |

***

<a id="fragmentpath"></a>

### FragmentPath

Defined in: [types/index.ts:315](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L315)

A FragmentPath identifies a fragment inside of a PageResponse. Its used internally by Superglue to
denormalize a page response into fragments, if any.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="id"></a> `id` | `string` | - | [types/index.ts:316](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L316) |
| <a id="path-2"></a> `path` | `string` | A Keypath specifying the location of the fragment | [types/index.ts:317](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L317) |

***

<a id="fragmentref"></a>

### FragmentRef\<T, Present\>

Defined in: [types/index.ts:328](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L328)

A FragmentRef is a reference to a Fragment.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |
| `Present` *extends* `boolean` | `false` |

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="__id"></a> `__id` | `string` | A user supplied string identifying the fragment. This is usually created using [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments) | [types/index.ts:329](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L329) |
| <a id="__type"></a> `__type?` | `T` | - | [types/index.ts:330](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L330) |
| <a id="__present"></a> `__present?` | `Present` | - | [types/index.ts:331](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L331) |

***

<a id="supergluestate"></a>

### SuperglueState

Defined in: [types/index.ts:350](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L350)

A read only state that contains meta information about
the current page.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="currentpagekey"></a> `currentPageKey` | `string` | The [PageKey](#pagekey) (url pathname + search) of the current page. This can be pass to [Remote](#remote-3). | [types/index.ts:352](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L352) |
| <a id="search"></a> `search` | `Record`\<`string`, `string` \| `undefined`\> | The query string object of the current url. | [types/index.ts:354](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L354) |
| <a id="csrftoken-3"></a> `csrfToken?` | `string` | The Rails csrfToken that you can use for forms. | [types/index.ts:356](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L356) |
| <a id="assets-3"></a> `assets` | `string`[] | The tracked asset digests. | [types/index.ts:358](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L358) |

***

<a id="rootstate"></a>

### RootState\<T\>

Defined in: [types/index.ts:365](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L365)

The root state for a Superglue application. It occupies
2 keys in your app.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

#### Indexable

\[`name`: `string`\]: `unknown`

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue"></a> `superglue` | [`SuperglueState`](#supergluestate) | Contains readonly metadata about the current page | [types/index.ts:367](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L367) |
| <a id="pages"></a> `pages` | [`AllPages`](#allpages)\<`T`\> | Every [PageResponse](#pageresponse) that superglue recieves is stored here. | [types/index.ts:369](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L369) |
| <a id="fragments-3"></a> `fragments` | [`AllFragments`](#allfragments) | - | [types/index.ts:370](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L370) |
| <a id="flash-3"></a> `flash` | [`FlashState`](#flashstate) | - | [types/index.ts:371](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L371) |

***

<a id="result"></a>

### Result

Defined in: [types/index.ts:380](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L380)

The success branch of a `remote` call. Resolved by the `remote` thunk
and [webRemote](#webremote); the `hasError: false` literal acts as the
discriminant for narrowing against [ErrorResult](#errorresult).

#### Extended by

- [`VisitResult`](#visitresult)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="haserror"></a> `hasError` | `false` | - | [types/index.ts:381](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L381) |
| <a id="pagekey-1"></a> `pageKey` | `string` | The URL of the response converted to a pageKey. Superglue uses this to persist the [SaveResponse](#saveresponse) to store, when that happens. | [types/index.ts:386](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L386) |
| <a id="page-1"></a> `page` | [`PageResponse`](#pageresponse) | The [SaveResponse](#saveresponse) of the page | [types/index.ts:388](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L388) |
| <a id="redirected"></a> `redirected` | `boolean` | Indicates if response was redirected | [types/index.ts:390](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L390) |
| <a id="rsp-1"></a> `rsp` | `Response` | The original response object | [types/index.ts:392](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L392) |
| <a id="fetchargs-1"></a> `fetchArgs` | [`FetchArgs`](#fetchargs) | The original args passed to fetch. | [types/index.ts:394](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L394) |
| <a id="componentidentifier-3"></a> `componentIdentifier?` | `string` | The [ComponentIdentifier](#componentidentifier) extracted from the response. | [types/index.ts:396](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L396) |
| <a id="needsrefresh"></a> `needsRefresh` | `boolean` | `true` when assets locally are detected to be out of date | [types/index.ts:398](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L398) |

***

<a id="visitresult"></a>

### VisitResult

Defined in: [types/index.ts:405](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L405)

The success branch of a `visit` call. Extends [Result](#result) with the
computed [NavigationAction](#navigationaction) for browser-history orchestration.

#### Extends

- [`Result`](#result)

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="haserror-1"></a> `hasError` | `false` | - | [`Result`](#result).[`hasError`](#haserror) | [types/index.ts:381](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L381) |
| <a id="pagekey-2"></a> `pageKey` | `string` | The URL of the response converted to a pageKey. Superglue uses this to persist the [SaveResponse](#saveresponse) to store, when that happens. | [`Result`](#result).[`pageKey`](#pagekey-1) | [types/index.ts:386](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L386) |
| <a id="page-2"></a> `page` | [`PageResponse`](#pageresponse) | The [SaveResponse](#saveresponse) of the page | [`Result`](#result).[`page`](#page-1) | [types/index.ts:388](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L388) |
| <a id="redirected-1"></a> `redirected` | `boolean` | Indicates if response was redirected | [`Result`](#result).[`redirected`](#redirected) | [types/index.ts:390](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L390) |
| <a id="rsp-2"></a> `rsp` | `Response` | The original response object | [`Result`](#result).[`rsp`](#rsp-1) | [types/index.ts:392](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L392) |
| <a id="fetchargs-2"></a> `fetchArgs` | [`FetchArgs`](#fetchargs) | The original args passed to fetch. | [`Result`](#result).[`fetchArgs`](#fetchargs-1) | [types/index.ts:394](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L394) |
| <a id="componentidentifier-4"></a> `componentIdentifier?` | `string` | The [ComponentIdentifier](#componentidentifier) extracted from the response. | [`Result`](#result).[`componentIdentifier`](#componentidentifier-3) | [types/index.ts:396](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L396) |
| <a id="needsrefresh-1"></a> `needsRefresh` | `boolean` | `true` when assets locally are detected to be out of date | [`Result`](#result).[`needsRefresh`](#needsrefresh) | [types/index.ts:398](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L398) |
| <a id="navigationaction-1"></a> `navigationAction` | [`NavigationAction`](#navigationaction) | The [NavigationAction](#navigationaction). This can be used for navigation. | - | [types/index.ts:407](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L407) |

***

<a id="errorresult"></a>

### ErrorResult

Defined in: [types/index.ts:415](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L415)

The error branch returned by `visit` and `remote` when the server
responds with a non-2xx status. Non-HTTP failures (network, parse,
abort, programming bugs) propagate as a rejected promise instead.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="haserror-2"></a> `hasError` | `true` | - | [types/index.ts:416](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L416) |
| <a id="response"></a> `response` | `Response` | The failed HTTP response. | [types/index.ts:418](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L418) |

***

<a id="extraargument"></a>

### ExtraArgument

Defined in: [types/index.ts:441](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L441)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="config"></a> `config` | `Config` | [types/index.ts:442](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L442) |
| <a id="lastvisitcontroller"></a> `lastVisitController` | \{ `abort`: (`reason`: `string`) => `void`; \} | [types/index.ts:443](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L443) |
| `lastVisitController.abort` | (`reason`: `string`) => `void` | [types/index.ts:443](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L443) |

***

<a id="handlers"></a>

### Handlers

Defined in: [types/index.ts:466](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L466)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="onclick"></a> `onClick` | (`event`: `MouseEvent`\<`HTMLDivElement`, `MouseEvent`\>) => `void` | [types/index.ts:467](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L467) |
| <a id="onsubmit"></a> `onSubmit` | (`event`: `FormEvent`\<`HTMLDivElement`\>) => `void` | [types/index.ts:468](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L468) |

***

<a id="historystate"></a>

### HistoryState

Defined in: [types/index.ts:488](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L488)

The state that is saved to history.state. Superglue stores
information about the current page so that it can restore
the page state when navigating back

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue-1"></a> `superglue` | `true` | Is always `true` so superglue can differentiate pages that have superglue enabled or not | [types/index.ts:490](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L490) |
| <a id="pagekey-3"></a> `pageKey` | `string` | The page key in [SuperglueState](#supergluestate) to restore from | [types/index.ts:492](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L492) |
| <a id="posx"></a> `posX` | `number` | The scroll position X of the page | [types/index.ts:494](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L494) |
| <a id="posy"></a> `posY` | `number` | The scroll position Y of the page | [types/index.ts:496](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L496) |

***

<a id="basicrequestinit"></a>

### BasicRequestInit

Defined in: [types/index.ts:527](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L527)

A variation of RequestInit except the headers must be a regular object

#### Extends

- `RequestInit`

#### Properties

| Property | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="headers"></a> `headers?` | \{\[`key`: `string`\]: `string`; \} | A Headers object, an object literal, or an array of two-item arrays to set request's headers. | `RequestInit.headers` | [types/index.ts:528](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L528) |

***

<a id="copyto"></a>

### CopyTo()

Defined in: [types/index.ts:577](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L577)

Superglue comes with a Navigation component that provides a context with
access to [Visit](#visit-3), [Remote](#remote-3) and other useful tooling.

You can also use this to build your own `<Link>` component.

> **CopyTo**(`path`: `string`): `void`

Defined in: [types/index.ts:577](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L577)

Superglue comes with a Navigation component that provides a context with
access to [Visit](#visit-3), [Remote](#remote-3) and other useful tooling.

You can also use this to build your own `<Link>` component.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

#### Returns

`void`

***

<a id="navigationproviderprops"></a>

### NavigationProviderProps

Defined in: [types/index.ts:595](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L595)

Props for the Superglue navigation provider. Installs the history listener,
scroll restoration, and provides [NavigationContextProps](#navigationcontextprops) to its
descendants. Wraps `children` so a layout (or any other tree) can sit
between the provider and the rendered page.

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="history"></a> `history` | `History` | [types/index.ts:596](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L596) |
| <a id="visit-1"></a> `visit` | [`ApplicationVisit`](#applicationvisit) | [types/index.ts:597](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L597) |
| <a id="remote-1"></a> `remote` | [`ApplicationRemote`](#applicationremote) | [types/index.ts:598](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L598) |
| <a id="children"></a> `children?` | `ReactNode` | [types/index.ts:599](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L599) |

***

<a id="navigationoutletprops"></a>

### NavigationOutletProps

Defined in: [types/index.ts:607](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L607)

Props for the Superglue navigation outlet. Reads the current page from the
Superglue store and renders the matching component from `mapping`.

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="mapping"></a> `mapping` | `Record`\<[`ComponentIdentifier`](#componentidentifier), `React.ComponentType`\> | [types/index.ts:608](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L608) |

***

<a id="buildstore"></a>

### BuildStore()

Defined in: [types/index.ts:619](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L619)

Provide this callback to ApplicationProps returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

> **BuildStore**(`initialState`: [`RootState`](#rootstate), `reducer`: \{ `superglue`: (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate); `pages`: (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages); `fragments`: (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments); `flash`: (`state`: [`FlashState`](#flashstate), `action`: `Action`) => [`FlashState`](#flashstate); \}): [`SuperglueStore`](#supergluestore)

Defined in: [types/index.ts:620](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L620)

Provide this callback to ApplicationProps returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `initialState` | [`RootState`](#rootstate) | A preconfigured intial state to pass to your store. |
| `reducer` | \{ `superglue`: (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate); `pages`: (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages); `fragments`: (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments); `flash`: (`state`: [`FlashState`](#flashstate), `action`: `Action`) => [`FlashState`](#flashstate); \} | A preconfigured reducer |
| `reducer.superglue` | (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate) | - |
| `reducer.pages` | (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages) | - |
| `reducer.fragments` | (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments) | - |
| `reducer.flash` | (`state`: [`FlashState`](#flashstate), `action`: `Action`) => [`FlashState`](#flashstate) | - |

#### Returns

[`SuperglueStore`](#supergluestore)

***

<a id="buildvisitandremote"></a>

### BuildVisitAndRemote()

Defined in: [types/index.ts:634](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L634)

Provide this callback to [CreateAppArgs](#createappargs). Receives a context object
containing `visit` and `remote` callables.  Customize this function to add
progress bars, error reporting (Sentry), or app-specific error-page
redirects.

Be sure to returns a wrapped `{ visit, remote }` pair that Superglue and UJS
use for navigation.

> **BuildVisitAndRemote**(`context`: [`BuildVisitAndRemoteContext`](#buildvisitandremotecontext)): \{ `visit`: [`ApplicationVisit`](#applicationvisit); `remote`: [`ApplicationRemote`](#applicationremote); \}

Defined in: [types/index.ts:635](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L635)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`BuildVisitAndRemoteContext`](#buildvisitandremotecontext) |

#### Returns

\{ `visit`: [`ApplicationVisit`](#applicationvisit); `remote`: [`ApplicationRemote`](#applicationremote); \}

A wrapped [ApplicationVisit](#applicationvisit) / [ApplicationRemote](#applicationremote) pair.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `visit` | [`ApplicationVisit`](#applicationvisit) | [types/index.ts:636](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L636) |
| `remote` | [`ApplicationRemote`](#applicationremote) | [types/index.ts:637](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L637) |

***

<a id="buildvisitandremotecontext"></a>

### BuildVisitAndRemoteContext

Defined in: [types/index.ts:647](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L647)

The context passed to [BuildVisitAndRemote](#buildvisitandremote)

The visit and remote functions in this context will resolve to a VisitResult
or ErrorResult.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="navigateto-2"></a> `navigateTo` | [`NavigateTo`](#navigateto) | Navigates after a successful visit. Bound to the createApp instance. | [types/index.ts:649](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L649) |
| <a id="visit-2"></a> `visit` | (`path`: `string`, `options?`: [`VisitProps`](#visitprops)) => `Promise`\<[`VisitResult`](#visitresult) \| [`ErrorResult`](#errorresult)\> | Pre-bound visit. Returns a discriminated result. | [types/index.ts:651](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L651) |
| <a id="remote-2"></a> `remote` | (`path`: `string`, `options?`: [`RemoteProps`](#remoteprops)) => `Promise`\<[`Result`](#result) \| [`ErrorResult`](#errorresult)\> | Pre-bound remote. Returns a discriminated result. | [types/index.ts:656](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L656) |

***

<a id="createappargs"></a>

### CreateAppArgs

Defined in: [types/index.ts:664](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L664)

Arguments for [createApp](#createapp). Combines per-request bootstrap state
(`initialPage`, `baseUrl`, `path`) with app-wide config (`mapping`,
`history`, `cable`, `buildVisitAndRemote`).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="initialpage"></a> `initialPage` | [`SaveResponse`](#saveresponse) | The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb template, e.g., application/superglue.html.erb | [types/index.ts:669](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L669) |
| <a id="baseurl"></a> `baseUrl` | `string` | The base url prefixed to all calls made by `visit` and `remote`. | [types/index.ts:673](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L673) |
| <a id="path-3"></a> `path` | `string` | The path of the current page. It should equal to the `location.pathname` + `location.search` + `location.hash` | [types/index.ts:678](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L678) |
| <a id="mapping-1"></a> `mapping` | `Record`\<`string`, `React.ComponentType`\> | A mapping between page identifiers and the React components that render them. The Outlet returned from [createApp](#createapp) reads this mapping when rendering the current page. | [types/index.ts:684](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L684) |
| <a id="buildvisitandremote-2"></a> `buildVisitAndRemote` | [`BuildVisitAndRemote`](#buildvisitandremote) | A factory function that returns a `visit` and `remote` function. All of Superglue and UJS will use these functions. You should customize the function, for example, to add a progress bar. | [types/index.ts:690](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L690) |
| <a id="history-1"></a> `history?` | `History` | An optional history object https://github.com/remix-run/history. If none is provided Superglue will create one for you. | [types/index.ts:695](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L695) |
| <a id="cable"></a> `cable?` | [`Consumer`](#consumer) | An optional ActionCable-compatible Consumer used by `useStreamSource` for real-time streaming. Construct this in your application code with `createConsumer` from `@rails/actioncable` or `createCable` from `@anycable/web` and pass it in. If omitted, `useStreamSource` is a no-op. | [types/index.ts:703](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L703) |
| <a id="devtools"></a> `devTools?` | `boolean` | Enable Redux DevTools integration. Defaults to `false`. | [types/index.ts:707](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L707) |

***

<a id="createappresult"></a>

### CreateAppResult

Defined in: [types/index.ts:723](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L723)

The result of calling [createApp](#createapp): a `Provider` component that owns
the Superglue React tree, an `Outlet` component that renders the current
page from the configured `mapping`, and a `ujs` object containing UJS
click/submit handlers the caller can attach wherever they choose.

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="provider"></a> `Provider` | `ComponentType`\<[`ProviderProps`](#providerprops)\> | [types/index.ts:724](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L724) |
| <a id="outlet"></a> `Outlet` | `ComponentType` | [types/index.ts:725](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L725) |
| <a id="ujs"></a> `ujs` | [`Handlers`](#handlers) | [types/index.ts:726](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L726) |

***

<a id="visit-3"></a>

### Visit()

Defined in: [types/requests.ts:11](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L11)

> **Visit**(`input`: `string`, `options`: [`VisitProps`](#visitprops)): `Promise`\<[`VisitResult`](#visitresult)\>

Defined in: [types/requests.ts:30](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L30)

Use visit to make single page transitions from one page. The function is a
wrapper around fetch and made to mimic a link click or a form submision. When
used, a `json` request will be made for the next page, then Superglue saves
the response, swap the page component, and change the browser history.

!!! note
    There can be only one `visit` at a time. If another `visit` is called from
    elsewhere, the previous visit would be aborted.

You must provide the implentation and pass it back to Superglue in
`application.js`. Superglue will then pass it to your page components and use
it for UJS navigation. This is usually generated for you in
`application_visit.js` where you can customize its behavior globally.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | The first argument to Fetch |
| `options` | [`VisitProps`](#visitprops) |  |

#### Returns

`Promise`\<[`VisitResult`](#visitresult)\>

***

<a id="visitprops"></a>

### VisitProps

Defined in: [types/requests.ts:38](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L38)

Options for Visit

#### Extends

- `Omit`\<`BaseProps`, `"signal"`\>

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="placeholderkey"></a> `placeholderKey?` | `string` | Defaults to the currentPageKey. When present, Superglue will use the page state located at that pageKey and optimistally navigates to it as the next page's state while the requests resolves. | - | [types/requests.ts:44](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L44) |
| <a id="revisit"></a> `revisit?` | `boolean` | When `true` and the request method is a GET, changes the `suggestionAction` of the Result object to `none` so that Superglue does nothing to window.history. When the GET response was redirected, changes `navigationAction` to `replace` | - | [types/requests.ts:51](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L51) |
| <a id="method"></a> `method?` | `string` | The HTTP method | [`RemoteProps`](#remoteprops).[`method`](#method-1) | [types/requests.ts:76](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L76) |
| <a id="body"></a> `body?` | `BodyInit` | The HTTP body | [`RemoteProps`](#remoteprops).[`body`](#body-1) | [types/requests.ts:78](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L78) |
| <a id="headers-1"></a> `headers?` | \{\[`key`: `string`\]: `string`; \} | The HTTP headers | `Omit.headers` | [types/requests.ts:80](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L80) |
| <a id="beforesave"></a> `beforeSave?` | [`BeforeSave`](#beforesave-2)\<[`JSONMappable`](#jsonmappable)\> | - | [`RemoteProps`](#remoteprops).[`beforeSave`](#beforesave-1) | [types/requests.ts:83](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L83) |

***

<a id="remote-3"></a>

### Remote()

Defined in: [types/requests.ts:54](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L54)

> **Remote**(`input`: `string`, `options`: [`RemoteProps`](#remoteprops)): `Promise`\<[`Result`](#result)\>

Defined in: [types/requests.ts:68](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L68)

Remote is a wrapper around fetch. It's used to make a request and mutate the
store. Remote does not navigate, and it does not change the browser history.
There can be multiple Remote requests running concurrently.

This function is to be wrapped by a developer as a [ApplicationRemote](#applicationremote)
and returned to superglue.  This is usually generated as
`application_visit.js` where you can make minimum edits to affect its
global usage.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | The first argument to Fetch |
| `options` | [`RemoteProps`](#remoteprops) | The fetch RequestInit with additional options |

#### Returns

`Promise`\<[`Result`](#result)\>

***

<a id="remoteprops"></a>

### RemoteProps

Defined in: [types/requests.ts:89](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L89)

Options for Visit

#### Extends

- `BaseProps`

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="method-1"></a> `method?` | `string` | The HTTP method | `BaseProps.method` | [types/requests.ts:76](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L76) |
| <a id="body-1"></a> `body?` | `BodyInit` | The HTTP body | `BaseProps.body` | [types/requests.ts:78](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L78) |
| <a id="headers-2"></a> `headers?` | \{\[`key`: `string`\]: `string`; \} | The HTTP headers | `BaseProps.headers` | [types/requests.ts:80](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L80) |
| <a id="beforesave-1"></a> `beforeSave?` | [`BeforeSave`](#beforesave-2)\<[`JSONMappable`](#jsonmappable)\> | - | `BaseProps.beforeSave` | [types/requests.ts:83](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L83) |
| <a id="pagekey-5"></a> `pageKey?` | `string` | Specifies where to store the remote payload, if not provided [Remote](#remote-3) will derive a key from the response's url. | - | [types/requests.ts:94](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L94) |
| <a id="force"></a> `force?` | `boolean` | By default, remote [Remote](#remote-3) disallows grafting a page response using props_at if the target pageKey provided has a different componentIdentifier. Setting `force: true` will ignore this limitation. This can be useful if you are absolutely sure that the page your grafting onto has a compatible shape with the response received with using props_at. A good example of this is a shared global header. | - | [types/requests.ts:104](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L104) |

***

<a id="beforesave-2"></a>

### BeforeSave()\<T\>

Defined in: [types/requests.ts:107](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L107)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

> **BeforeSave**\<`U`\>(`prevPage`: `undefined` \| [`Page`](#page)\<`T`\>, `nextPage`: `U`): `U`

Defined in: [types/requests.ts:132](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L132)

A callback that fires in between recieving a payload and saving a
payload. Use this callback to modify the payload before it gets saved. Its
useful for appending, prepending, shuffeling, etc. recieved data to
existing data.

`prevPage` is `undefined` when there is no existing page in the store
(e.g. on a first visit).

```
const beforeSave = (prevPage, nextPage) => {
  const prevMessages = prevPage?.data?.messages ?? []
  nextPage.data.messages = [
    ...prevMessages,
    ...nextPage.data.messages
  ]

  return nextPage
}

remote("/posts", {beforeSave})
```

#### Type Parameters

| Type Parameter |
| ------ |
| `U` *extends* [`SaveResponse`](#saveresponse)\<`T`\> \| [`GraftResponse`](#graftresponse)\<`T`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `prevPage` | `undefined` \| [`Page`](#page)\<`T`\> |
| `nextPage` | `U` |

#### Returns

`U`

***

<a id="applicationremote"></a>

### ApplicationRemote()

Defined in: [types/requests.ts:138](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L138)

> **ApplicationRemote**(`input`: `string`, `options?`: [`RemoteProps`](#remoteprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \}): `Promise`\<[`Result`](#result)\>

Defined in: [types/requests.ts:154](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L154)

ApplicationRemote is the developer provided wrapper around [Remote](#remote-3).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `remote` call. See [Remote](#remote-3) for more details.

The only difference between the two interfaces is ApplicationRemote will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationRemote and will pass the dataset of the HTML element where UJS is
enabled on.

Returns a `Promise<Result>` — terminal branches (HTTP error redirects,
unexpected exceptions) should return a never-settling promise rather
than `undefined` so the chain reflects "the browser is unloading."

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `options?` | [`RemoteProps`](#remoteprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \} |

#### Returns

`Promise`\<[`Result`](#result)\>

***

<a id="applicationvisit"></a>

### ApplicationVisit()

Defined in: [types/requests.ts:164](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L164)

> **ApplicationVisit**(`input`: `string`, `options?`: [`VisitProps`](#visitprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \}): `Promise`\<[`VisitResult`](#visitresult)\>

Defined in: [types/requests.ts:181](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/requests.ts#L181)

ApplicationVisit is the developer provided wrapper around [Remote](#remote-3).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `visit` call. See [Remote](#remote-3) for more details.

The only difference between the two interfaces is ApplicationVisit will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationVisit and will pass the dataset of the HTML element where UJS is
enabled on.

Returns a `Promise<VisitResult>` — terminal branches (HTTP error
redirects, unexpected exceptions) should return a never-settling
promise rather than `undefined` so the chain reflects "the browser is
unloading."

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `options?` | [`VisitProps`](#visitprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \} |

#### Returns

`Promise`\<[`VisitResult`](#visitresult)\>

## Type Aliases

<a id="fetchargs"></a>

### FetchArgs

> **FetchArgs** = \[`string`, [`BasicRequestInit`](#basicrequestinit)\]

Defined in: [types/actions.ts:7](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/actions.ts#L7)

Tuple of Fetch arguments that Superglue passes to Fetch.

***

<a id="channelnamewithparams"></a>

### ChannelNameWithParams

> **ChannelNameWithParams** = \{\[`key`: `string`\]: `undefined` \| `string` \| `number` \| `boolean`; `channel`: `string`; \}

Defined in: [types/cable.ts:15](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L15)

A channel identifier. Either a bare channel name string or an object
with a `channel` key plus arbitrary identifier params.

#### Indexable

\[`key`: `string`\]: `undefined` \| `string` \| `number` \| `boolean`

#### Properties

<a id="channel"></a>

##### channel

> **channel**: `string`

Defined in: [types/cable.ts:16](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/cable.ts#L16)

***

<a id="receivetype"></a>

### ReceiveType\<T\>

> **ReceiveType**\<`T`\> = `unknown`

Defined in: [types/index.ts:27](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L27)

Type marker for Deepkit runtime validation. This allows Deepkit
to be an optional peer dependency since Deepkit only checks for
the name of the type is ReceiveType.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

<a id="pagekey"></a>

### PageKey

> **PageKey** = `string`

Defined in: [types/index.ts:35](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L35)

A PageKey is a combination of a parsed URL's pathname + query string. No hash.

*

#### Example

```ts
/posts?foobar=123
```

***

<a id="restorestrategy"></a>

### RestoreStrategy

> **RestoreStrategy** = `"fromCacheOnly"` \| `"revisitOnly"` \| `"fromCacheAndRevisitInBackground"`

Defined in: [types/index.ts:51](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L51)

Defines the behavior when navigating to a page that is already stored on the
client. For example, when navigating back.

When the page already exists in the store:
- `fromCacheOnly` - Use the cached page that exists on the store, only.
- `revisitOnly` - Ignore the cache and make a request for the latest page. If
the response was 200, the [NavigationAction](#navigationaction) would be `none` as we don't want
to push into history. If the response was redirected, the [NavigationAction](#navigationaction) would be set to
`replace`.
- `fromCacheAndRevisitInBackground` - Use the cache version of the page so
   superglue can optimistically navigate to it, then make an additional request
   for the latest version.

***

<a id="navigationaction"></a>

### NavigationAction

> **NavigationAction** = `"push"` \| `"replace"` \| `"none"`

Defined in: [types/index.ts:60](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L60)

A NavigationAction is used to tell Superglue to history.push, history.replace
or do nothing.

***

<a id="componentidentifier"></a>

### ComponentIdentifier

> **ComponentIdentifier** = `string`

Defined in: [types/index.ts:66](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L66)

An identifier that Superglue will uses to determine which page component to render
with your page response.

***

<a id="keypath"></a>

### Keypath

> **Keypath** = `string`

Defined in: [types/index.ts:90](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L90)

A keypath is a string representing the location of a piece of data. Superglue uses
the keypath to dig for or update data.

#### Examples

Object access
```
data.header.avatar
```

Array access
```
data.body.posts.0.title
```

Array with lookahead
```
data.body.posts.post_id=foobar.title
```

***

<a id="jsonprimitive"></a>

### JSONPrimitive

> **JSONPrimitive** = `string` \| `number` \| `boolean` \| `null` \| `undefined`

Defined in: [types/index.ts:97](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L97)

A JSON Primitive value

***

<a id="jsonobject"></a>

### JSONObject

> **JSONObject** = \{\[`key`: `string`\]: [`JSONValue`](#jsonvalue); \}

Defined in: [types/index.ts:102](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L102)

A JSON Object

#### Index Signature

\[`key`: `string`\]: [`JSONValue`](#jsonvalue)

***

<a id="jsonmappable"></a>

### JSONMappable

> **JSONMappable** = [`JSONValue`](#jsonvalue)[] \| [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:109](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L109)

A JSON Object or an array of values

***

<a id="jsonkeyable"></a>

### JSONKeyable

> **JSONKeyable** = [`JSONObject`](#jsonobject)[] \| [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:114](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L114)

A array of JSON key value objects or a JSON Object

***

<a id="jsonvalue"></a>

### JSONValue

> **JSONValue** = [`JSONPrimitive`](#jsonprimitive) \| [`JSONMappable`](#jsonmappable)

Defined in: [types/index.ts:119](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L119)

A primitive or a mappable object

***

<a id="flashstate"></a>

### FlashState

> **FlashState** = `Record`\<`string`, [`JSONValue`](#jsonvalue)\>

Defined in: [types/index.ts:121](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L121)

***

<a id="fragment"></a>

### Fragment\<T, Present\>

> **Fragment**\<`T`, `Present`\> = `Present` *extends* `true` ? `T` & \{ `__id`: `string`; \} : `T` & \{ `__id`: `string`; \} \| `undefined`

Defined in: [types/index.ts:179](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L179)

A Fragment is a rendered Rails partial with an identity. The use
of this type is optional, but it makes usage with unproxy and
useUpdateFragment type friendly.

In general, Fragments enable normalized state management where Rails partials
become referenceable entities on the client. The server renders partials as
fragments with unique IDs, then Superglue normalizes them into a separate
fragments store while replacing the original data with fragment references.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | - | The shape of the fragment's data. |
| `Present` | `false` | Indicates whether the fragment is guaranteed to be present. It's possible that a fragment was deleted from the store due to client side mutations. If you are sure that the fragment will ALWAYS be present, set this to `true`, otherwise its `false` by default. |

#### Examples

```json
{
  "data": { "cart": { items: [...], totalCost: 69.97 } },
  "fragments": [{ "type": "userCart", "path": ["cart"] }]
}
```

```js
{
  pages: { "/page": { data: { cart: { __id: "userCart" } } } },
  fragments: { "userCart": { items: [...], totalCost: 69.97 } }
}
```

```tsx
type PageData = {
  cart: Fragment<{ items: Item[]; totalCost: number }, true>;
  user?: Fragment<{ name: string; email: string }>; // Optional fragment
}

const content = useContent<PageData>()
const cart = content.cart // Resolves fragment reference to actual data
```

```tsx
// You can also nest fragments within other fragments
interface Post {
 title: string
 author: Fragment<Author, true>
 comments: Array<Fragment<Comment, true>>
}

const page = useContent<{ post: Fragment<Post, true> }>()
```

***

<a id="unproxy-3"></a>

### Unproxy\<T\>

> **Unproxy**\<`T`\> = `T` *extends* [`Fragment`](#fragment)\<infer U, infer P\> ? `P` *extends* `boolean` ? [`FragmentRef`](#fragmentref)\<`U`, `P`\> : [`FragmentRef`](#fragmentref)\<`U`, `false`\> : `T` *extends* infer U[] ? [`Unproxy`](#unproxy-3)\<`U`\>[] : `T` *extends* `object` ? `{ [K in keyof T]: Unproxy<T[K]> }` : `T`

Defined in: [types/index.ts:187](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L187)

Utility type for unproxy that converts Fragment types to fragment references.
This recursively processes objects and arrays to convert Fragment<T> to { __id: string }.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

<a id="saveresponse"></a>

### SaveResponse\<T\>

> **SaveResponse**\<`T`\> = \{ `data`: `T`; `componentIdentifier`: [`ComponentIdentifier`](#componentidentifier); `assets`: `string`[]; `csrfToken?`: `string`; `fragments`: [`FragmentPath`](#fragmentpath)[]; `defers`: [`Defer`](#defer)[]; `flash`: [`FlashState`](#flashstate); `action`: `"savePage"`; `renderedAt`: `number`; `restoreStrategy`: [`RestoreStrategy`](#restorestrategy); \}

Defined in: [types/index.ts:237](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L237)

The SaveResponse response is responsible for persisting a full page
visit in Superglue.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

#### Properties

<a id="data"></a>

##### data

> **data**: `T`

Defined in: [types/index.ts:238](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L238)

<a id="componentidentifier-1"></a>

##### componentIdentifier

> **componentIdentifier**: [`ComponentIdentifier`](#componentidentifier)

Defined in: [types/index.ts:239](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L239)

<a id="assets"></a>

##### assets

> **assets**: `string`[]

Defined in: [types/index.ts:240](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L240)

<a id="csrftoken"></a>

##### csrfToken?

> `optional` **csrfToken**: `string`

Defined in: [types/index.ts:241](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L241)

<a id="fragments"></a>

##### fragments

> **fragments**: [`FragmentPath`](#fragmentpath)[]

Defined in: [types/index.ts:242](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L242)

<a id="defers"></a>

##### defers

> **defers**: [`Defer`](#defer)[]

Defined in: [types/index.ts:243](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L243)

<a id="flash"></a>

##### flash

> **flash**: [`FlashState`](#flashstate)

Defined in: [types/index.ts:244](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L244)

<a id="action"></a>

##### action

> **action**: `"savePage"`

Defined in: [types/index.ts:245](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L245)

<a id="renderedat"></a>

##### renderedAt

> **renderedAt**: `number`

Defined in: [types/index.ts:247](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L247)

<a id="restorestrategy-1"></a>

##### restoreStrategy

> **restoreStrategy**: [`RestoreStrategy`](#restorestrategy)

Defined in: [types/index.ts:248](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L248)

***

<a id="page"></a>

### Page\<T\>

> **Page**\<`T`\> = [`SaveResponse`](#saveresponse)\<`T`\> & \{ `savedAt`: `number`; \}

Defined in: [types/index.ts:254](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L254)

A Page is a SaveResponse that's been saved to the store

#### Type declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `savedAt` | `number` | [types/index.ts:255](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L255) |

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

***

<a id="streammessage"></a>

### StreamMessage

> **StreamMessage** = \{ `data`: [`JSONMappable`](#jsonmappable); `fragmentIds`: `string`[]; `handler`: `"append"` \| `"prepend"` \| `"update"` \| `"noop"`; `options`: `Record`\<`string`, `string`\>; \}

Defined in: [types/index.ts:281](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L281)

#### Properties

<a id="data-2"></a>

##### data

> **data**: [`JSONMappable`](#jsonmappable)

Defined in: [types/index.ts:282](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L282)

<a id="fragmentids"></a>

##### fragmentIds

> **fragmentIds**: `string`[]

Defined in: [types/index.ts:283](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L283)

<a id="handler"></a>

##### handler

> **handler**: `"append"` \| `"prepend"` \| `"update"` \| `"noop"`

Defined in: [types/index.ts:284](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L284)

<a id="options"></a>

##### options

> **options**: `Record`\<`string`, `string`\>

Defined in: [types/index.ts:285](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L285)

***

<a id="streamresponse"></a>

### StreamResponse

> **StreamResponse** = \{ `data`: [`StreamMessage`](#streammessage)[]; `fragments`: [`FragmentPath`](#fragmentpath)[]; `assets`: `string`[]; `csrfToken?`: `string`; `action`: `"handleStreamResponse"`; `renderedAt`: `number`; `flash`: [`FlashState`](#flashstate); \}

Defined in: [types/index.ts:288](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L288)

#### Properties

<a id="data-3"></a>

##### data

> **data**: [`StreamMessage`](#streammessage)[]

Defined in: [types/index.ts:289](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L289)

<a id="fragments-2"></a>

##### fragments

> **fragments**: [`FragmentPath`](#fragmentpath)[]

Defined in: [types/index.ts:290](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L290)

<a id="assets-2"></a>

##### assets

> **assets**: `string`[]

Defined in: [types/index.ts:291](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L291)

<a id="csrftoken-2"></a>

##### csrfToken?

> `optional` **csrfToken**: `string`

Defined in: [types/index.ts:292](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L292)

<a id="action-2"></a>

##### action

> **action**: `"handleStreamResponse"`

Defined in: [types/index.ts:293](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L293)

<a id="renderedat-2"></a>

##### renderedAt

> **renderedAt**: `number`

Defined in: [types/index.ts:294](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L294)

<a id="flash-2"></a>

##### flash

> **flash**: [`FlashState`](#flashstate)

Defined in: [types/index.ts:295](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L295)

***

<a id="pageresponse"></a>

### PageResponse

> **PageResponse** = [`GraftResponse`](#graftresponse) \| [`SaveResponse`](#saveresponse) \| [`StreamResponse`](#streamresponse)

Defined in: [types/index.ts:303](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L303)

A PageResponse can be either a [GraftResponse](#graftresponse), [SaveResponse](#saveresponse).
or a [StreamResponse](#streamresponse) Its meant to be implemented by the server and if
you are using superglue_rails, the generators will handle all cases.

***

<a id="allpages"></a>

### AllPages\<T\>

> **AllPages**\<`T`\> = `Record`\<[`PageKey`](#pagekey), [`Page`](#page)\<`T`\>\>

Defined in: [types/index.ts:338](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L338)

The store where all page responses are stored indexed by PageKey. You are encouraged
to mutate the Pages in this store.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

***

<a id="allfragments"></a>

### AllFragments

> **AllFragments** = `Record`\<`string`, [`JSONMappable`](#jsonmappable)\>

Defined in: [types/index.ts:344](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L344)

The store where all page responses are stored indexed by PageKey. You are encouraged
to mutate the Pages in this store.

***

<a id="visitcreator"></a>

### VisitCreator()

> **VisitCreator** = (`input`: `string` \| [`PageKey`](#pagekey), `options?`: [`VisitProps`](#visitprops)) => [`VisitMetaThunk`](#visitmetathunk)

Defined in: [types/index.ts:427](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L427)

VisitCreator is a Redux action creator that returns a thunk. Use this to build
the [Visit](#visit-3) function. Typically it's already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](#pagekey) |
| `options?` | [`VisitProps`](#visitprops) |

#### Returns

[`VisitMetaThunk`](#visitmetathunk)

***

<a id="remotecreator"></a>

### RemoteCreator()

> **RemoteCreator** = (`input`: `string` \| [`PageKey`](#pagekey), `options?`: [`RemoteProps`](#remoteprops)) => [`MetaThunk`](#metathunk)

Defined in: [types/index.ts:436](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L436)

RemoteCreator is a Redux action creator that returns a thunk. Use this to build
the [Remote](#remote-3) function. Typically it's already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](#pagekey) |
| `options?` | [`RemoteProps`](#remoteprops) |

#### Returns

[`MetaThunk`](#metathunk)

***

<a id="dispatch"></a>

### Dispatch

> **Dispatch** = `ThunkDispatch`\<[`RootState`](#rootstate), [`ExtraArgument`](#extraargument), `Action`\>

Defined in: [types/index.ts:446](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L446)

***

<a id="supergluestore"></a>

### SuperglueStore

> **SuperglueStore** = `EnhancedStore`\<[`RootState`](#rootstate), `Action`, `Tuple`\<\[`StoreEnhancer`\<\{ `dispatch`: [`Dispatch`](#dispatch); \}\>, `StoreEnhancer`\]\>\>

Defined in: [types/index.ts:453](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L453)

A Store created with Redux Toolkit's `configureStore` setup with reducers
from Superglue. If you are using superglue_rails this would have been
generated for you in `store.js` and setup correctly in application.js

***

<a id="ujshandlers"></a>

### UJSHandlers()

> **UJSHandlers** = (`{
  ujsAttributePrefix,
  visit,
  remote,
  store,
}`: \{ `ujsAttributePrefix`: `string`; `visit`: [`ApplicationVisit`](#applicationvisit); `remote`: [`ApplicationRemote`](#applicationremote); `store`: [`SuperglueStore`](#supergluestore); \}) => [`Handlers`](#handlers)

Defined in: [types/index.ts:471](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L471)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `{ ujsAttributePrefix, visit, remote, store, }` | \{ `ujsAttributePrefix`: `string`; `visit`: [`ApplicationVisit`](#applicationvisit); `remote`: [`ApplicationRemote`](#applicationremote); `store`: [`SuperglueStore`](#supergluestore); \} |
| `{ ujsAttributePrefix, visit, remote, store, }.ujsAttributePrefix` | `string` |
| `{ ujsAttributePrefix, visit, remote, store, }.visit` | [`ApplicationVisit`](#applicationvisit) |
| `{ ujsAttributePrefix, visit, remote, store, }.remote` | [`ApplicationRemote`](#applicationremote) |
| `{ ujsAttributePrefix, visit, remote, store, }.store` | [`SuperglueStore`](#supergluestore) |

#### Returns

[`Handlers`](#handlers)

***

<a id="saveandprocesspagethunk"></a>

### SaveAndProcessPageThunk

> **SaveAndProcessPageThunk** = `ThunkAction`\<`Promise`\<`void`\>, [`RootState`](#rootstate), [`ExtraArgument`](#extraargument), `Action`\>

Defined in: [types/index.ts:499](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L499)

***

<a id="metathunk"></a>

### MetaThunk

> **MetaThunk** = `ThunkAction`\<`Promise`\<[`Result`](#result) \| [`ErrorResult`](#errorresult)\>, [`RootState`](#rootstate), [`ExtraArgument`](#extraargument), `Action`\>

Defined in: [types/index.ts:506](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L506)

***

<a id="visitmetathunk"></a>

### VisitMetaThunk

> **VisitMetaThunk** = `ThunkAction`\<`Promise`\<[`VisitResult`](#visitresult) \| [`ErrorResult`](#errorresult)\>, [`RootState`](#rootstate), [`ExtraArgument`](#extraargument), `Action`\>

Defined in: [types/index.ts:512](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L512)

***

<a id="defermentthunk"></a>

### DefermentThunk

> **DefermentThunk** = `ThunkAction`\<`Promise`\<`void`[]\>, [`RootState`](#rootstate), [`ExtraArgument`](#extraargument), `Action`\>

Defined in: [types/index.ts:519](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L519)

***

<a id="navigateto"></a>

### NavigateTo()

> **NavigateTo** = (`path`: [`Keypath`](#keypath), `options?`: \{ `action?`: [`NavigationAction`](#navigationaction); `updateContent?`: (`draft`: [`JSONMappable`](#jsonmappable)) => `void`; \}) => `boolean`

Defined in: [types/index.ts:557](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L557)

Passed to every page component and also available as part of a NavigationContext:

```js
import { NavigationContext } from '@thoughtbot/superglue';

const { navigateTo } = useContext(NavigationContext)
```

Manually navigate using pages that exists in the store and restores scroll
position. `navigateTo` is what [Visit](#visit-3) in your `application_visit.js`
ultimately calls.

If there is an existing page in your store `navigateTo` will restore the props,
render the correct component, and return `true`. Otherwise, it will return
`false`. This is useful if you want to restore an existing page before making a
call to `visit` or `remote`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | [`Keypath`](#keypath) |  |
| `options?` | \{ `action?`: [`NavigationAction`](#navigationaction); `updateContent?`: (`draft`: [`JSONMappable`](#jsonmappable)) => `void`; \} | - |
| `options.action?` | [`NavigationAction`](#navigationaction) | when `none`, `navigateTo` will immediately return `false` |
| `options.updateContent?` | (`draft`: [`JSONMappable`](#jsonmappable)) => `void` | - |

#### Returns

`boolean`

`true` if the navigation was a success, `false` if the page was not found in the
store.

***

<a id="navigationcontextprops"></a>

### NavigationContextProps

> **NavigationContextProps** = \{ `navigateTo`: [`NavigateTo`](#navigateto); `copyTo`: [`CopyTo`](#copyto); `visit`: [`ApplicationVisit`](#applicationvisit); `remote`: [`ApplicationRemote`](#applicationremote); `pageKey`: [`SuperglueState`](#supergluestate)\[`"currentPageKey"`\]; `search`: [`SuperglueState`](#supergluestate)\[`"search"`\]; \}

Defined in: [types/index.ts:579](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L579)

#### Properties

<a id="navigateto-1"></a>

##### navigateTo

> **navigateTo**: [`NavigateTo`](#navigateto)

Defined in: [types/index.ts:580](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L580)

<a id="copyto-2"></a>

##### copyTo

> **copyTo**: [`CopyTo`](#copyto)

Defined in: [types/index.ts:581](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L581)

<a id="visit"></a>

##### visit

> **visit**: [`ApplicationVisit`](#applicationvisit)

Defined in: [types/index.ts:582](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L582)

<a id="remote"></a>

##### remote

> **remote**: [`ApplicationRemote`](#applicationremote)

Defined in: [types/index.ts:583](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L583)

<a id="pagekey-4"></a>

##### pageKey

> **pageKey**: [`SuperglueState`](#supergluestate)\[`"currentPageKey"`\]

Defined in: [types/index.ts:584](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L584)

<a id="search-1"></a>

##### search

> **search**: [`SuperglueState`](#supergluestate)\[`"search"`\]

Defined in: [types/index.ts:585](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L585)

***

<a id="providerprops"></a>

### ProviderProps

> **ProviderProps** = \{ `children?`: `React.ReactNode`; \}

Defined in: [types/index.ts:713](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L713)

Props for the Provider component returned from [createApp](#createapp).

#### Properties

<a id="children-1"></a>

##### children?

> `optional` **children**: `React.ReactNode`

Defined in: [types/index.ts:714](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/types/index.ts#L714)

## Variables

<a id="navigationcontext"></a>

### NavigationContext

> `const` **NavigationContext**: `Context`\<[`NavigationContextProps`](#navigationcontextprops)\>

Defined in: [components/Navigation.tsx:29](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/components/Navigation.tsx#L29)

***

<a id="navigationprovider"></a>

### NavigationProvider

> `const` **NavigationProvider**: `ForwardRefExoticComponent`\<[`NavigationProviderProps`](#navigationproviderprops) & `RefAttributes`\<\{ `navigateTo`: `null` \| [`NavigateTo`](#navigateto); \}\>\>

Defined in: [components/Navigation.tsx:53](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/components/Navigation.tsx#L53)

## Functions

<a id="webvisit"></a>

### webVisit()

> **webVisit**(`store`: [`SuperglueStore`](#supergluestore), `path`: `string`, `options?`: [`VisitProps`](#visitprops)): `Promise`\<[`VisitResult`](#visitresult) \| [`ErrorResult`](#errorresult)\>

Defined in: [action\_creators/web.ts:18](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/action_creators/web.ts#L18)

Web specific wrapper around the `visit` thunk adding asset-refresh when the
response indicates the client bundle is stale.

Returns a never-settling promise on that branch so the chain terminates with
the browser unload.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `store` | [`SuperglueStore`](#supergluestore) |
| `path` | `string` |
| `options?` | [`VisitProps`](#visitprops) |

#### Returns

`Promise`\<[`VisitResult`](#visitresult) \| [`ErrorResult`](#errorresult)\>

***

<a id="webremote"></a>

### webRemote()

> **webRemote**(`store`: [`SuperglueStore`](#supergluestore), `path`: `string`, `options?`: [`RemoteProps`](#remoteprops)): `Promise`\<[`Result`](#result) \| [`ErrorResult`](#errorresult)\>

Defined in: [action\_creators/web.ts:39](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/action_creators/web.ts#L39)

Web specific wrapper around the `remote` thunk. Just a passthrough.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `store` | [`SuperglueStore`](#supergluestore) |
| `path` | `string` |
| `options?` | [`RemoteProps`](#remoteprops) |

#### Returns

`Promise`\<[`Result`](#result) \| [`ErrorResult`](#errorresult)\>

***

<a id="navigationoutlet"></a>

### NavigationOutlet()

> **NavigationOutlet**(`__namedParameters`: [`NavigationOutletProps`](#navigationoutletprops)): `Element`

Defined in: [components/Navigation.tsx:263](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/components/Navigation.tsx#L263)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`NavigationOutletProps`](#navigationoutletprops) |

#### Returns

`Element`

***

<a id="usesuperglue"></a>

### useSuperglue()

> **useSuperglue**(): [`SuperglueState`](#supergluestate)

Defined in: [hooks/index.ts:12](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/index.ts#L12)

A lightweight hook that grabs the superglue state from the store.

#### Returns

[`SuperglueState`](#supergluestate)

***

<a id="useflash"></a>

### useFlash()

> **useFlash**\<`T`\>(): `T`

Defined in: [hooks/index.ts:26](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/index.ts#L26)

A hook that returns the current flash state from the store.
Flash is cleared automatically on every visit.

Pass a type parameter to narrow the flash shape:

```ts
const flash = useFlash<{ notice?: string; alert?: string }>()
```

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`FlashState`](#flashstate) |

#### Returns

`T`

***

<a id="usecontent"></a>

### useContent()

#### Call Signature

> **useContent**\<`T`\>(): `T`

Defined in: [hooks/useContent.tsx:54](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useContent.tsx#L54)

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

The proxy will lazily and automatically resolve any [FragmentRef](#fragmentref)s making it
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
| `T` | [`JSONMappable`](#jsonmappable) | The data type being accessed (defaults to JSONMappable) |

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

Defined in: [hooks/useContent.tsx:55](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useContent.tsx#L55)

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

The proxy will lazily and automatically resolve any [FragmentRef](#fragmentref)s making it
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
| `T` | [`JSONMappable`](#jsonmappable) | The data type being accessed (defaults to JSONMappable) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pageKey?` | `string` | Optional page key to access a specific page's data. When omitted, returns data for the current page. |

##### Returns

`undefined` \| `T`

Reactive proxy to page data

##### Example

```tsx
// Access current page data
const page = useContent()

// Access a specific page's data by key
const posts = useContent('/posts')
```

***

<a id="unproxy"></a>

### unproxy()

> **unproxy**\<`T`\>(`proxy`: `T`): [`Unproxy`](#unproxy-3)\<`T`\>

Defined in: [hooks/useContent.tsx:146](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useContent.tsx#L146)

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

[`Unproxy`](#unproxy-3)\<`T`\>

***

<a id="tofragmentref"></a>

### toFragmentRef()

> **toFragmentRef**\<`T`, `P`\>(`id`: `string`): [`FragmentRef`](#fragmentref)\<`T`, `P`\>

Defined in: [hooks/useFragment.tsx:14](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useFragment.tsx#L14)

Converts a string ID to a typed FragmentRef.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | - |
| `P` *extends* `boolean` | `false` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

[`FragmentRef`](#fragmentref)\<`T`, `P`\>

#### Example

```tsx
const author = useFragment(toFragmentRef<Author>("author_123"))
```

***

<a id="usefragment"></a>

### useFragment()

> **useFragment**\<`T`, `P`\>(`fragmentRef`: [`FragmentRef`](#fragmentref)\<`T`, `P`\>, `__type?`: `unknown`): `P` *extends* `true` ? `T` : `undefined` \| `T`

Defined in: [hooks/useFragment.tsx:62](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useFragment.tsx#L62)

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

| Type Parameter | Description |
| ------ | ------ |
| `T` | The data type being accessed |
| `P` *extends* `boolean` | Whether the fragment is guaranteed to be present |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fragmentRef` | [`FragmentRef`](#fragmentref)\<`T`, `P`\> | A typed fragment reference |
| `__type?` | `unknown` | - |

#### Returns

`P` *extends* `true` ? `T` : `undefined` \| `T`

Reactive proxy to fragment data. Returns `T` if present, `T | undefined` otherwise.

#### Example

```tsx
// Access fragment via unproxied ref
const rawContent = unproxy(content)
const user = useFragment(rawContent.user)

// Access fragment via string ID
const cart = useFragment(toFragmentRef<Cart>("cart_123"))
```

***

<a id="usestreamsource"></a>

### useStreamSource()

> **useStreamSource**(`channel`: `StreamSourceProps`): \{ `connected`: `boolean`; `subscription`: `null` \| [`Subscription`](#subscription); \}

Defined in: [hooks/useStreamSource.tsx:138](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useStreamSource.tsx#L138)

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
| `connected` | `boolean` | Whether the ActionCable subscription is currently connected | [hooks/useStreamSource.tsx:140](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useStreamSource.tsx#L140) |
| `subscription` | `null` \| [`Subscription`](#subscription) | The active ActionCable subscription instance, null if not connected | [hooks/useStreamSource.tsx:142](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useStreamSource.tsx#L142) |

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

<a id="useupdatecontent"></a>

### useUpdateContent()

> **useUpdateContent**(): \<`T`\>(`pageKey`: `string`, `updater`: (`draft`: `T`) => `void`) => `void`

Defined in: [hooks/useUpdateContent.tsx:9](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useUpdateContent.tsx#L9)

#### Returns

> \<`T`\>(`pageKey`: `string`, `updater`: (`draft`: `T`) => `void`): `void`

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `pageKey` | `string` |
| `updater` | (`draft`: `T`) => `void` |

##### Returns

`void`

***

<a id="useupdatefragment"></a>

### useUpdateFragment()

> **useUpdateFragment**(): \{\<`T`\>(`fragment`: `T`, `updater`: (`draft`: [`Unproxy`](#unproxy-3)\<`Unpack`\<`T`\>\>) => `void`): `void`; \<`T`, `P`\>(`fragmentRef`: [`FragmentRef`](#fragmentref)\<`T`, `P`\>, `updater`: (`draft`: [`Unproxy`](#unproxy-3)\<`T`\>) => `void`): `void`; \}

Defined in: [hooks/useUpdateFragment.tsx:36](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/hooks/useUpdateFragment.tsx#L36)

Hook for mutating fragments using Immer drafts.

#### Returns

> \<`T`\>(`fragment`: `T`, `updater`: (`draft`: [`Unproxy`](#unproxy-3)\<`Unpack`\<`T`\>\>) => `void`): `void`

Updates a fragment using a [Fragment](#fragment) object.

##### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* \{ `__id`: `string`; \} |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fragment` | `T` | Fragment object from proxied content |
| `updater` | (`draft`: [`Unproxy`](#unproxy-3)\<`Unpack`\<`T`\>\>) => `void` | Immer draft function for mutating fragment data |

##### Returns

`void`

> \<`T`, `P`\>(`fragmentRef`: [`FragmentRef`](#fragmentref)\<`T`, `P`\>, `updater`: (`draft`: [`Unproxy`](#unproxy-3)\<`T`\>) => `void`): `void`

Updates a fragment using a [FragmentRef](#fragmentref) object.

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `P` *extends* `boolean` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fragmentRef` | [`FragmentRef`](#fragmentref)\<`T`, `P`\> | Fragment reference from unproxied content |
| `updater` | (`draft`: [`Unproxy`](#unproxy-3)\<`T`\>) => `void` | Immer draft function for mutating fragment data |

##### Returns

`void`

#### Example

```tsx
const update = useUpdateFragment()

// Update via fragment reference
update(userRef, draft => {
  draft.name = "Updated Name"
  draft.email = "new@email.com"
})

// Update via fragment ID directly
update('user_123', draft => {
  draft.profile.bio = "Updated bio"
})
```

***

<a id="createapp"></a>

### createApp()

> **createApp**(`__namedParameters`: [`CreateAppArgs`](#createappargs) & \{ `_storeResult?`: `StoreResult`; \}): [`CreateAppResult`](#createappresult)

Defined in: [index.tsx:80](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/index.tsx#L80)

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

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`CreateAppArgs`](#createappargs) & \{ `_storeResult?`: `StoreResult`; \} |

#### Returns

[`CreateAppResult`](#createappresult)

***

<a id="getin"></a>

### getIn()

> **getIn**(`node`: [`JSONMappable`](#jsonmappable), `path`: `string`): [`JSONValue`](#jsonvalue)

Defined in: [utils/immutability.ts:22](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/utils/immutability.ts#L22)

Retrieves data from a JSON object using a [Keypath](#keypath)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node` | [`JSONMappable`](#jsonmappable) |  |
| `path` | `string` |  |

#### Returns

[`JSONValue`](#jsonvalue)

***

<a id="urltopagekey"></a>

### urlToPageKey()

> **urlToPageKey**(`url`: `string`): `string`

Defined in: [utils/url.ts:49](https://github.com/thoughtbot/superglue/blob/c0a0df513d6c3f9593a1f6457fe4dc5e4c801b04/superglue/lib/utils/url.ts#L49)

Converts a url to a PageKey.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` |  |

#### Returns

`string`
