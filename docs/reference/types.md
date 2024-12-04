## References

<a id="visit" name="visit"></a>

### Visit

Re-exports [Visit](types.requests.md#visit)

<a id="visitprops" name="visitprops"></a>

### VisitProps

Re-exports [VisitProps](types.requests.md#visitprops)

<a id="remote" name="remote"></a>

### Remote

Re-exports [Remote](types.requests.md#remote)

<a id="remoteprops" name="remoteprops"></a>

### RemoteProps

Re-exports [RemoteProps](types.requests.md#remoteprops)

<a id="beforesave" name="beforesave"></a>

### BeforeSave

Re-exports [BeforeSave](types.requests.md#beforesave-2)

## Interfaces

<a id="saveresponseaction" name="saveresponseaction"></a>

### SaveResponseAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type" name="type"></a> `type` | `"@@superglue/SAVE_RESPONSE"` | `Action.type` | [lib/types/actions.ts:6](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L6) |
| <a id="payload" name="payload"></a> `payload` | \{`pageKey`: `string`;`page`: [`VisitResponse`](types.md#visitresponse); \} | - | [lib/types/actions.ts:7](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L7) |
| <a id="pagekey" name="pagekey"></a> `payload.pageKey` | `string` | - | [lib/types/actions.ts:8](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L8) |
| <a id="page" name="page"></a> `payload.page` | [`VisitResponse`](types.md#visitresponse) | - | [lib/types/actions.ts:9](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L9) |

***

<a id="handlegraftaction" name="handlegraftaction"></a>

### HandleGraftAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-1" name="type-1"></a> `type` | `"@@superglue/HANDLE_GRAFT"` | `Action.type` | [lib/types/actions.ts:14](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L14) |
| <a id="payload-1" name="payload-1"></a> `payload` | \{`pageKey`: `string`;`page`: [`GraftResponse`](types.md#graftresponse); \} | - | [lib/types/actions.ts:15](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L15) |
| <a id="pagekey-1" name="pagekey-1"></a> `payload.pageKey` | `string` | - | [lib/types/actions.ts:16](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L16) |
| <a id="page-1" name="page-1"></a> `payload.page` | [`GraftResponse`](types.md#graftresponse) | - | [lib/types/actions.ts:17](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L17) |

***

<a id="copyaction" name="copyaction"></a>

### CopyAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-2" name="type-2"></a> `type` | `"@@superglue/COPY_PAGE"` | `Action.type` | [lib/types/actions.ts:22](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L22) |
| <a id="payload-2" name="payload-2"></a> `payload` | \{`from`: `string`;`to`: `string`; \} | - | [lib/types/actions.ts:23](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L23) |
| <a id="from" name="from"></a> `payload.from` | `string` | - | [lib/types/actions.ts:24](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L24) |
| <a id="to" name="to"></a> `payload.to` | `string` | - | [lib/types/actions.ts:25](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L25) |

***

<a id="removepageaction" name="removepageaction"></a>

### RemovePageAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-3" name="type-3"></a> `type` | `"@@superglue/REMOVE_PAGE"` | `Action.type` | [lib/types/actions.ts:30](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L30) |
| <a id="payload-3" name="payload-3"></a> `payload` | \{`pageKey`: `string`; \} | - | [lib/types/actions.ts:31](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L31) |
| <a id="pagekey-2" name="pagekey-2"></a> `payload.pageKey` | `string` | - | [lib/types/actions.ts:32](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L32) |

***

<a id="updatefragmentsaction" name="updatefragmentsaction"></a>

### UpdateFragmentsAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-4" name="type-4"></a> `type` | `"@@superglue/UPDATE_FRAGMENTS"` | `Action.type` | [lib/types/actions.ts:37](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L37) |
| <a id="payload-4" name="payload-4"></a> `payload` | \{`changedFragments`: `Record`\<`string`, `unknown`\>; \} | - | [lib/types/actions.ts:38](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L38) |
| <a id="changedfragments" name="changedfragments"></a> `payload.changedFragments` | `Record`\<`string`, `unknown`\> | - | [lib/types/actions.ts:39](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L39) |

***

<a id="setcsrftoken" name="setcsrftoken"></a>

### SetCSRFToken

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-5" name="type-5"></a> `type` | `"@@superglue/SET_CSRF_TOKEN"` | `Action.type` | [lib/types/actions.ts:44](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L44) |
| <a id="payload-5" name="payload-5"></a> `payload` | \{`csrfToken`: `string`; \} | - | [lib/types/actions.ts:45](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L45) |
| <a id="csrftoken" name="csrftoken"></a> `payload.csrfToken` | `string` | - | [lib/types/actions.ts:46](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L46) |

***

<a id="historychange" name="historychange"></a>

### HistoryChange

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-6" name="type-6"></a> `type` | `"@@superglue/HISTORY_CHANGE"` | `Action.type` | [lib/types/actions.ts:51](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L51) |
| <a id="payload-6" name="payload-6"></a> `payload` | \{`pathname`: `string`;`search`: `string`;`hash`: `string`; \} | - | [lib/types/actions.ts:52](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L52) |
| <a id="pathname" name="pathname"></a> `payload.pathname` | `string` | - | [lib/types/actions.ts:53](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L53) |
| <a id="search" name="search"></a> `payload.search` | `string` | - | [lib/types/actions.ts:54](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L54) |
| <a id="hash" name="hash"></a> `payload.hash` | `string` | - | [lib/types/actions.ts:55](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L55) |

***

<a id="beforevisit" name="beforevisit"></a>

### BeforeVisit

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-7" name="type-7"></a> `type` | `"@@superglue/BEFORE_VISIT"` | `Action.type` | [lib/types/actions.ts:65](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L65) |
| <a id="payload-7" name="payload-7"></a> `payload` | \{`fetchArgs`: [`string`, [`BasicRequestInit`](types.md#basicrequestinit)];`currentPageKey`: `string`; \} | - | [lib/types/actions.ts:66](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L66) |
| <a id="fetchargs" name="fetchargs"></a> `payload.fetchArgs` | [`string`, [`BasicRequestInit`](types.md#basicrequestinit)] | - | [lib/types/actions.ts:67](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L67) |
| <a id="currentpagekey" name="currentpagekey"></a> `payload.currentPageKey` | `string` | - | [lib/types/actions.ts:68](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L68) |

***

<a id="beforeremote" name="beforeremote"></a>

### BeforeRemote

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-8" name="type-8"></a> `type` | `"@@superglue/BEFORE_REMOTE"` | `Action.type` | [lib/types/actions.ts:73](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L73) |
| <a id="payload-8" name="payload-8"></a> `payload` | \{`fetchArgs`: [`string`, [`BasicRequestInit`](types.md#basicrequestinit)];`currentPageKey`: `string`; \} | - | [lib/types/actions.ts:74](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L74) |
| <a id="fetchargs-1" name="fetchargs-1"></a> `payload.fetchArgs` | [`string`, [`BasicRequestInit`](types.md#basicrequestinit)] | - | [lib/types/actions.ts:75](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L75) |
| <a id="currentpagekey-1" name="currentpagekey-1"></a> `payload.currentPageKey` | `string` | - | [lib/types/actions.ts:76](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L76) |

***

<a id="beforefetch" name="beforefetch"></a>

### BeforeFetch

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-9" name="type-9"></a> `type` | `"@@superglue/BEFORE_FETCH"` | `Action.type` | [lib/types/actions.ts:81](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L81) |
| <a id="payload-9" name="payload-9"></a> `payload` | \{`fetchArgs`: [`string`, [`BasicRequestInit`](types.md#basicrequestinit)]; \} | - | [lib/types/actions.ts:82](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L82) |
| <a id="fetchargs-2" name="fetchargs-2"></a> `payload.fetchArgs` | [`string`, [`BasicRequestInit`](types.md#basicrequestinit)] | - | [lib/types/actions.ts:83](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L83) |

***

<a id="handleerror" name="handleerror"></a>

### HandleError

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-10" name="type-10"></a> `type` | `"@@superglue/ERROR"` | `Action.type` | [lib/types/actions.ts:88](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L88) |
| <a id="payload-10" name="payload-10"></a> `payload` | \{`message`: `string`; \} | - | [lib/types/actions.ts:89](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L89) |
| <a id="message" name="message"></a> `payload.message` | `string` | - | [lib/types/actions.ts:90](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L90) |

***

<a id="graftingsuccessaction" name="graftingsuccessaction"></a>

### GraftingSuccessAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-11" name="type-11"></a> `type` | `string` | `Action.type` | [lib/types/actions.ts:97](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L97) |
| <a id="payload-11" name="payload-11"></a> `payload` | \{`pageKey`: `string`;`keyPath`: `string`; \} | - | [lib/types/actions.ts:98](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L98) |
| <a id="pagekey-3" name="pagekey-3"></a> `payload.pageKey` | `string` | - | [lib/types/actions.ts:99](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L99) |
| <a id="keypath" name="keypath"></a> `payload.keyPath` | `string` | - | [lib/types/actions.ts:100](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L100) |

***

<a id="graftingerroraction" name="graftingerroraction"></a>

### GraftingErrorAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-12" name="type-12"></a> `type` | `string` | `Action.type` | [lib/types/actions.ts:105](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L105) |
| <a id="payload-12" name="payload-12"></a> `payload` | \{`pageKey`: `string`;`url`: `string`;`err`: `unknown`;`keyPath`: `string`; \} | - | [lib/types/actions.ts:106](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L106) |
| <a id="pagekey-4" name="pagekey-4"></a> `payload.pageKey` | `string` | - | [lib/types/actions.ts:107](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L107) |
| <a id="url" name="url"></a> `payload.url` | `string` | - | [lib/types/actions.ts:108](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L108) |
| <a id="err" name="err"></a> `payload.err` | `unknown` | - | [lib/types/actions.ts:109](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L109) |
| <a id="keypath-1" name="keypath-1"></a> `payload.keyPath` | `string` | - | [lib/types/actions.ts:110](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L110) |

***

<a id="parsedresponse" name="parsedresponse"></a>

### ParsedResponse

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="rsp" name="rsp"></a> `rsp` | `Response` | [lib/types/index.ts:106](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L106) |
| <a id="json" name="json"></a> `json` | [`PageResponse`](types.md#pageresponse) | [lib/types/index.ts:107](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L107) |

***

<a id="defer" name="defer"></a>

### Defer

Defer is a node in the page response thats been intentionally filled
with empty or placeholder data for the purposes of fetching it later.

You would typically use it with props_template for parts of a page that you
know would be slower to load.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="url-1" name="url-1"></a> `url` | `string` | A url with props_at keypath in the query parameter to indicate how to dig for the data, and where to place the data. | [lib/types/index.ts:132](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L132) |
| <a id="type-13" name="type-13"></a> `type` | `"auto"` \| `"manual"` | When set to `auto` Superglue will automatically make the request using the `url`. When set to `manual`, Superglue does nothing, and you would need to manually use `remote` with the `url` to fetch the missing data. | [lib/types/index.ts:133](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L133) |
| <a id="path" name="path"></a> `path` | `string` | A keypath indicates how to dig for the data and where to place the data. | [lib/types/index.ts:134](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L134) |
| <a id="successaction" name="successaction"></a> `successAction` | `string` | a user defined action for Superglue to dispatch when auto deferement is successful | [lib/types/index.ts:135](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L135) |
| <a id="failaction" name="failaction"></a> `failAction` | `string` | a user defined action for Superglue to dispatch when auto deferement failed | [lib/types/index.ts:136](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L136) |

***

<a id="graftresponse" name="graftresponse"></a>

### GraftResponse

The GraftResponse is a protocol, a shape that is responsible for partial
updates using props_template's digging functionality in Superglue. Its meant
to be implemented by the server and if you are using superglue_rails, the
generators would have generated a props_template layout and view that would
shape the graft responses for you.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data" name="data"></a> `data` | [`JSONMappable`](types.md#jsonmappable) | - | [lib/types/index.ts:146](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L146) |
| <a id="componentidentifier" name="componentidentifier"></a> `componentIdentifier` | `string` | - | [lib/types/index.ts:147](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L147) |
| <a id="assets" name="assets"></a> `assets` | `string`[] | - | [lib/types/index.ts:148](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L148) |
| <a id="csrftoken-1" name="csrftoken-1"></a> `csrfToken?` | `string` | - | [lib/types/index.ts:149](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L149) |
| <a id="fragments" name="fragments"></a> `fragments` | [`Fragment`](types.md#fragment)[] | - | [lib/types/index.ts:150](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L150) |
| <a id="defers" name="defers"></a> `defers` | [`Defer`](types.md#defer)[] | - | [lib/types/index.ts:151](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L151) |
| <a id="slices" name="slices"></a> `slices` | [`JSONObject`](types.md#jsonobject) | - | [lib/types/index.ts:152](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L152) |
| <a id="renderedat" name="renderedat"></a> `renderedAt` | `number` | - | [lib/types/index.ts:154](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L154) |
| <a id="restorestrategy" name="restorestrategy"></a> `restoreStrategy` | [`RestoreStrategy`](types.md#restorestrategy-1) | - | [lib/types/index.ts:155](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L155) |
| <a id="action" name="action"></a> `action` | `"graft"` | - | [lib/types/index.ts:178](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L178) |
| <a id="path-1" name="path-1"></a> `path` | `string` | Used by superglue to replace the data at that location. | [lib/types/index.ts:179](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L179) |

***

<a id="fragment" name="fragment"></a>

### Fragment

A Fragment identifies a cross cutting concern, like a shared header or footer.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-14" name="type-14"></a> `type` | `string` | A user supplied string identifying a fragment. This is usually created using [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments) | [lib/types/index.ts:197](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L197) |
| <a id="path-2" name="path-2"></a> `path` | `string` | A Keypath specifying the location of the fragment | [lib/types/index.ts:198](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L198) |

***

<a id="supergluestate" name="supergluestate"></a>

### SuperglueState

A read only state that contains meta information about
the current page.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="currentpagekey-2" name="currentpagekey-2"></a> `currentPageKey` | `string` | The [PageKey](types.md#pagekey-8) of the current page. This can be pass to [Remote](types.requests.md#remote). | [lib/types/index.ts:213](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L213) |
| <a id="pathname-1" name="pathname-1"></a> `pathname` | `string` | The pathname of the current url. | [lib/types/index.ts:215](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L215) |
| <a id="search-1" name="search-1"></a> `search` | `string` | The query string of the current url. | [lib/types/index.ts:217](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L217) |
| <a id="hash-1" name="hash-1"></a> `hash` | `string` | The hash of the current url. | [lib/types/index.ts:219](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L219) |
| <a id="csrftoken-2" name="csrftoken-2"></a> `csrfToken` | `string` | The Rails csrfToken that you can use for forms. | [lib/types/index.ts:221](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L221) |
| <a id="assets-1" name="assets-1"></a> `assets` | `string`[] | The tracked asset digests. | [lib/types/index.ts:223](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L223) |

***

<a id="rootstate" name="rootstate"></a>

### RootState

The root state for a Superglue application. It occupies
2 keys in your app.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue" name="superglue"></a> `superglue` | [`SuperglueState`](types.md#supergluestate) | Caontain readonly metadata about the current page | [lib/types/index.ts:232](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L232) |
| <a id="pages" name="pages"></a> `pages` | [`AllPages`](types.md#allpages) | Every [PageResponse](types.md#pageresponse) that superglue recieves is stored here. | [lib/types/index.ts:234](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L234) |

***

<a id="pageownprops" name="pageownprops"></a>

### PageOwnProps

Helpful props passed to the page component.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="pagekey-5" name="pagekey-5"></a> `pageKey` | `string` | the pagekey of the current page | [lib/types/index.ts:242](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L242) |
| <a id="navigateto" name="navigateto"></a> `navigateTo` | (`path`: `string`, `options`: \{`action`: [`NavigationAction`](types.md#navigationaction-1);`ownProps`: `Record`\<`string`, `unknown`\>; \}) => `boolean` | - | [lib/types/index.ts:243](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L243) |
| <a id="visit-1" name="visit-1"></a> `visit` | [`Visit`](types.requests.md#visit) | - | [lib/types/index.ts:244](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L244) |
| <a id="remote-1" name="remote-1"></a> `remote` | [`Remote`](types.requests.md#remote) | - | [lib/types/index.ts:245](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L245) |

***

<a id="meta" name="meta"></a>

### Meta

Meta is passed to the Promise when visit or remote
resolves and contains additional information for
navigation.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="pagekey-6" name="pagekey-6"></a> `pageKey` | `string` | The URL of the response converted to a pageKey. Superglue uses this to persist the [VisitResponse](types.md#visitresponse) to store, when that happens. | [lib/types/index.ts:269](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L269) |
| <a id="page-2" name="page-2"></a> `page` | [`VisitResponse`](types.md#visitresponse) | The [VisitResponse](types.md#visitresponse) of the page | [lib/types/index.ts:271](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L271) |
| <a id="redirected" name="redirected"></a> `redirected` | `boolean` | Indicates if response was redirected | [lib/types/index.ts:273](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L273) |
| <a id="rsp-1" name="rsp-1"></a> `rsp` | `Response` | The original response object | [lib/types/index.ts:275](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L275) |
| <a id="fetchargs-3" name="fetchargs-3"></a> `fetchArgs` | [`FetchArgs`](types.md#fetchargs-4) | The original args passed to fetch. | [lib/types/index.ts:277](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L277) |
| <a id="componentidentifier-1" name="componentidentifier-1"></a> `componentIdentifier` | `string` | The [ComponentIdentifier](types.md#componentidentifier-2) extracted from the response. | [lib/types/index.ts:279](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L279) |
| <a id="needsrefresh" name="needsrefresh"></a> `needsRefresh` | `boolean` | `true` when assets locally are detected to be out of date | [lib/types/index.ts:281](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L281) |
| <a id="navigationaction" name="navigationaction"></a> `navigationAction?` | [`NavigationAction`](types.md#navigationaction-1) | The [NavigationAction](types.md#navigationaction-1). This can be used for navigation. | [lib/types/index.ts:283](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L283) |

***

<a id="handlers" name="handlers"></a>

### Handlers

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="onclick" name="onclick"></a> `onClick` | (`event`: `MouseEvent`) => `void` | [lib/types/index.ts:327](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L327) |
| <a id="onsubmit" name="onsubmit"></a> `onSubmit` | (`event`: `Event`) => `void` | [lib/types/index.ts:328](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L328) |

***

<a id="historystate" name="historystate"></a>

### HistoryState

The state that is saved to history.state. Superglue stores
information about the current page so that it can restore
the page state when navigating back

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue-1" name="superglue-1"></a> `superglue` | `true` | Is always `true` so superglue can differentiate pages that have superglue enabled or not | [lib/types/index.ts:348](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L348) |
| <a id="pagekey-7" name="pagekey-7"></a> `pageKey` | `string` | The page key in [SuperglueState](types.md#supergluestate) to restore from | [lib/types/index.ts:350](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L350) |
| <a id="posx" name="posx"></a> `posX` | `number` | The scroll position X of the page | [lib/types/index.ts:352](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L352) |
| <a id="posy" name="posy"></a> `posY` | `number` | The scroll position Y of the page | [lib/types/index.ts:354](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L354) |

***

<a id="basicrequestinit" name="basicrequestinit"></a>

### BasicRequestInit

A variation of RequestInit except the headers must be a regular object

#### Extends

- `RequestInit`

#### Properties

| Property | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="headers" name="headers"></a> `headers?` | \{\} | A Headers object, an object literal, or an array of two-item arrays to set request's headers. | `RequestInit.headers` | [lib/types/index.ts:380](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L380) |

## Type Aliases

<a id="fetchargs-4" name="fetchargs-4"></a>

### FetchArgs

> **FetchArgs**: [`string`, [`BasicRequestInit`](types.md#basicrequestinit)]

Tuple of Fetch arguments that Superglue passes to Fetch.

#### Defined in

[lib/types/actions.ts:62](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L62)

***

<a id="lifecycleaction" name="lifecycleaction"></a>

### LifecycleAction

> **LifecycleAction**: [`BeforeFetch`](types.md#beforefetch) \| [`HandleError`](types.md#handleerror) \| [`BeforeVisit`](types.md#beforevisit) \| [`BeforeRemote`](types.md#beforeremote)

#### Defined in

[lib/types/actions.ts:114](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L114)

***

<a id="pagereduceraction" name="pagereduceraction"></a>

### PageReducerAction

> **PageReducerAction**: [`SaveResponseAction`](types.md#saveresponseaction) \| [`HandleGraftAction`](types.md#handlegraftaction) \| [`GraftingSuccessAction`](types.md#graftingsuccessaction) \| [`GraftingErrorAction`](types.md#graftingerroraction) \| [`CopyAction`](types.md#copyaction) \| [`RemovePageAction`](types.md#removepageaction) \| [`UpdateFragmentsAction`](types.md#updatefragmentsaction)

#### Defined in

[lib/types/actions.ts:120](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L120)

***

<a id="supergluereduceraction" name="supergluereduceraction"></a>

### SuperglueReducerAction

> **SuperglueReducerAction**: [`SaveResponseAction`](types.md#saveresponseaction) \| [`SetCSRFToken`](types.md#setcsrftoken) \| [`HistoryChange`](types.md#historychange)

#### Defined in

[lib/types/actions.ts:129](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L129)

***

<a id="allaction" name="allaction"></a>

### AllAction

> **AllAction**: [`PageReducerAction`](types.md#pagereduceraction) \| [`GraftingSuccessAction`](types.md#graftingsuccessaction) \| [`GraftingErrorAction`](types.md#graftingerroraction) \| [`SuperglueReducerAction`](types.md#supergluereduceraction) \| [`LifecycleAction`](types.md#lifecycleaction)

#### Defined in

[lib/types/actions.ts:134](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/actions.ts#L134)

***

<a id="pagekey-8" name="pagekey-8"></a>

### PageKey

> **PageKey**: `string`

A PageKey is a combination of a parsed URL's pathname + query string. No hash.

*

#### Example

```ts
/posts?foobar=123
```

#### Defined in

[lib/types/index.ts:19](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L19)

***

<a id="restorestrategy-1" name="restorestrategy-1"></a>

### RestoreStrategy

> **RestoreStrategy**: `"fromCacheOnly"` \| `"revisitOnly"` \| `"fromCacheAndRevisitInBackground"`

Defines the behavior when navigating to a page that is already stored on the
client. For example, when navigating back.

When the page already exists in the store:
- `fromCacheOnly` - Use the cached page that exists on the store, only.
- `revisitOnly` - Ignore the cache and make a request for the latest page.
- `fromCacheAndRevisitInBackground` - Use the cache version of the page so
   superglue can optimistically navigate to it, then make an additional request
   for the latest version.

#### Defined in

[lib/types/index.ts:32](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L32)

***

<a id="navigationaction-1" name="navigationaction-1"></a>

### NavigationAction

> **NavigationAction**: `"push"` \| `"replace"` \| `"none"`

A NavigationAction is used to tell Superglue to history.push, history.replace
or do nothing.

#### Defined in

[lib/types/index.ts:41](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L41)

***

<a id="navigationaction" name="navigationaction"></a>

### NavigationAction

> **NavigationAction**: [`NavigationAction`](types.md#navigationaction-1)

#### Defined in

[lib/types/index.ts:42](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L42)

***

<a id="componentidentifier-2" name="componentidentifier-2"></a>

### ComponentIdentifier

> **ComponentIdentifier**: `string`

An identifier that Superglue will uses to determine which page component to render
with your page response.

#### Defined in

[lib/types/index.ts:48](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L48)

***

<a id="keypath-2" name="keypath-2"></a>

### Keypath

> **Keypath**: `string`

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

#### Defined in

[lib/types/index.ts:72](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L72)

***

<a id="jsonprimitive" name="jsonprimitive"></a>

### JSONPrimitive

> **JSONPrimitive**: `string` \| `number` \| `boolean` \| `null` \| `undefined`

A JSON Primitive value

#### Defined in

[lib/types/index.ts:79](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L79)

***

<a id="jsonobject" name="jsonobject"></a>

### JSONObject

> **JSONObject**: \{\}

A JSON Object

#### Index Signature

 \[`key`: `string`\]: [`JSONValue`](types.md#jsonvalue)

#### Defined in

[lib/types/index.ts:84](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L84)

***

<a id="jsonmappable" name="jsonmappable"></a>

### JSONMappable

> **JSONMappable**: [`JSONValue`](types.md#jsonvalue)[] \| [`JSONObject`](types.md#jsonobject)

A JSON Object or an array of values

#### Defined in

[lib/types/index.ts:91](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L91)

***

<a id="jsonkeyable" name="jsonkeyable"></a>

### JSONKeyable

> **JSONKeyable**: [`JSONObject`](types.md#jsonobject)[] \| [`JSONObject`](types.md#jsonobject)

A array of JSON key value objects or a JSON Object

#### Defined in

[lib/types/index.ts:96](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L96)

***

<a id="jsonvalue" name="jsonvalue"></a>

### JSONValue

> **JSONValue**: [`JSONPrimitive`](types.md#jsonprimitive) \| [`JSONMappable`](types.md#jsonmappable)

A primitive or a mappable object

#### Defined in

[lib/types/index.ts:101](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L101)

***

<a id="visitresponse" name="visitresponse"></a>

### VisitResponse

> **VisitResponse**: \{`data`: [`JSONMappable`](types.md#jsonmappable);`componentIdentifier`: [`ComponentIdentifier`](types.md#componentidentifier-2);`assets`: `string`[];`csrfToken`: `string`;`fragments`: [`Fragment`](types.md#fragment)[];`defers`: [`Defer`](types.md#defer)[];`slices`: [`JSONObject`](types.md#jsonobject);`renderedAt`: `number`;`restoreStrategy`: [`RestoreStrategy`](types.md#restorestrategy-1); \}

The VisitResponse is a protocol, a shape that is responsible for full page
visits in Superglue. Its meant to be implemented by the server and if you are
using superglue_rails, the generators would have generated a props_template
layout and view that would shape the visit responses for you.

#### Type declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `data` | [`JSONMappable`](types.md#jsonmappable) | [lib/types/index.ts:146](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L146) |
| `componentIdentifier` | [`ComponentIdentifier`](types.md#componentidentifier-2) | [lib/types/index.ts:147](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L147) |
| `assets` | `string`[] | [lib/types/index.ts:148](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L148) |
| `csrfToken`? | `string` | [lib/types/index.ts:149](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L149) |
| `fragments` | [`Fragment`](types.md#fragment)[] | [lib/types/index.ts:150](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L150) |
| `defers` | [`Defer`](types.md#defer)[] | [lib/types/index.ts:151](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L151) |
| `slices` | [`JSONObject`](types.md#jsonobject) | [lib/types/index.ts:152](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L152) |
| `renderedAt` | `number` | [lib/types/index.ts:154](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L154) |
| `restoreStrategy` | [`RestoreStrategy`](types.md#restorestrategy-1) | [lib/types/index.ts:155](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L155) |

#### Defined in

[lib/types/index.ts:145](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L145)

***

<a id="page-3" name="page-3"></a>

### Page

> **Page**: [`VisitResponse`](types.md#visitresponse) & \{`savedAt`: `number`;`pageKey`: [`PageKey`](types.md#pagekey-8); \}

A Page is a VisitResponse that's been saved to the store

#### Type declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `savedAt` | `number` | [lib/types/index.ts:162](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L162) |
| `pageKey` | [`PageKey`](types.md#pagekey-8) | [lib/types/index.ts:163](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L163) |

#### Defined in

[lib/types/index.ts:161](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L161)

***

<a id="pageresponse" name="pageresponse"></a>

### PageResponse

> **PageResponse**: [`GraftResponse`](types.md#graftresponse) \| [`VisitResponse`](types.md#visitresponse)

A PageResponse can be either a [GraftResponse](types.md#graftresponse) or a [VisitResponse](types.md#visitresponse).
Its meant to be implemented by the server and if you are using
superglue_rails, the generators will handle both cases.

#### Defined in

[lib/types/index.ts:187](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L187)

***

<a id="allpages" name="allpages"></a>

### AllPages

> **AllPages**: `Record`\<[`PageKey`](types.md#pagekey-8), [`Page`](types.md#page-3)\>

The store where all page responses are stored indexed by PageKey. You are encouraged
to mutate the Pages in this store.

#### Defined in

[lib/types/index.ts:205](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L205)

***

<a id="content" name="content"></a>

### Content

> **Content**: [`PageOwnProps`](types.md#pageownprops) & \{`[key: string]`: `unknown`; `pageKey`: [`PageKey`](types.md#pagekey-8);`fragments`: [`Fragment`](types.md#fragment)[];`csrfToken`: `string`; \}

Your Page's content in the data node in [VisitResponse](types.md#visitresponse) merged with additional
helpers

#### Type declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `pageKey` | [`PageKey`](types.md#pagekey-8) | [lib/types/index.ts:253](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L253) |
| `fragments` | [`Fragment`](types.md#fragment)[] | [lib/types/index.ts:254](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L254) |
| `csrfToken`? | `string` | [lib/types/index.ts:255](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L255) |

#### Defined in

[lib/types/index.ts:252](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L252)

***

<a id="visitcreator" name="visitcreator"></a>

### VisitCreator()

> **VisitCreator**: (`input`: `string` \| [`PageKey`](types.md#pagekey-8), `options`: [`VisitProps`](types.requests.md#visitprops)) => [`MetaThunk`](types.md#metathunk)

VisitCreator is a Redux action creator that returns a thunk. Use this to build
the [Visit](types.requests.md#visit) function. Typically its already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](types.md#pagekey-8) |
| `options` | [`VisitProps`](types.requests.md#visitprops) |

#### Returns

[`MetaThunk`](types.md#metathunk)

#### Defined in

[lib/types/index.ts:292](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L292)

***

<a id="remotecreator" name="remotecreator"></a>

### RemoteCreator()

> **RemoteCreator**: (`input`: `string` \| [`PageKey`](types.md#pagekey-8), `options`: [`RemoteProps`](types.requests.md#remoteprops)) => [`MetaThunk`](types.md#metathunk)

RemoteCreator is a Redux action creator that returns a thunk. Use this to build
the [Remote](types.requests.md#remote) function. Typically its already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](types.md#pagekey-8) |
| `options` | [`RemoteProps`](types.requests.md#remoteprops) |

#### Returns

[`MetaThunk`](types.md#metathunk)

#### Defined in

[lib/types/index.ts:301](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L301)

***

<a id="dispatch" name="dispatch"></a>

### Dispatch

> **Dispatch**: `ThunkDispatch`\<[`RootState`](types.md#rootstate), `undefined`, [`AllAction`](types.md#allaction)\>

#### Defined in

[lib/types/index.ts:306](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L306)

***

<a id="supergluestore" name="supergluestore"></a>

### SuperglueStore

> **SuperglueStore**: `EnhancedStore`\<[`RootState`](types.md#rootstate), [`AllAction`](types.md#allaction) \| `UnknownAction`, `Tuple`\<[`StoreEnhancer`\<\{`dispatch`: [`Dispatch`](types.md#dispatch); \}\>, `StoreEnhancer`]\>\>

A Store created with Redux Toolkit's `configureStore` setup with reducers
from Superglue. If you are using superglue_rails this would have been
generated for you in `store.js` and setup correctly in application.js

#### Defined in

[lib/types/index.ts:313](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L313)

***

<a id="ujshandlers" name="ujshandlers"></a>

### UJSHandlers()

> **UJSHandlers**: (`{
  ujsAttributePrefix,
  visit,
  remote,
}`: \{`ujsAttributePrefix`: `string`;`visit`: [`Visit`](types.requests.md#visit);`remote`: [`Remote`](types.requests.md#remote); \}) => [`Handlers`](types.md#handlers)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `{ ujsAttributePrefix, visit, remote, }` | `object` |
| `{ ujsAttributePrefix, visit, remote, }.ujsAttributePrefix` | `string` |
| `{ ujsAttributePrefix, visit, remote, }.visit` | [`Visit`](types.requests.md#visit) |
| `{ ujsAttributePrefix, visit, remote, }.remote` | [`Remote`](types.requests.md#remote) |

#### Returns

[`Handlers`](types.md#handlers)

#### Defined in

[lib/types/index.ts:331](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L331)

***

<a id="saveandprocesspagethunk" name="saveandprocesspagethunk"></a>

### SaveAndProcessPageThunk

> **SaveAndProcessPageThunk**: `ThunkAction`\<`Promise`\<`void`\>, [`RootState`](types.md#rootstate), `undefined`, [`AllAction`](types.md#allaction)\>

#### Defined in

[lib/types/index.ts:357](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L357)

***

<a id="metathunk" name="metathunk"></a>

### MetaThunk

> **MetaThunk**: `ThunkAction`\<`Promise`\<[`Meta`](types.md#meta)\>, [`RootState`](types.md#rootstate), `undefined`, [`AllAction`](types.md#allaction)\>

#### Defined in

[lib/types/index.ts:364](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L364)

***

<a id="defermentthunk" name="defermentthunk"></a>

### DefermentThunk

> **DefermentThunk**: `ThunkAction`\<`Promise`\<`void`[]\>, [`RootState`](types.md#rootstate), `undefined`, [`AllAction`](types.md#allaction)\>

#### Defined in

[lib/types/index.ts:371](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/index.ts#L371)
