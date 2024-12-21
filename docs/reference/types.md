## References

<a id="fetchargs" name="fetchargs"></a>

### FetchArgs

Re-exports [FetchArgs](types.actions.md#fetchargs)

<a id="graftingsuccessaction" name="graftingsuccessaction"></a>

### GraftingSuccessAction

Re-exports [GraftingSuccessAction](types.actions.md#graftingsuccessaction)

<a id="graftingerroraction" name="graftingerroraction"></a>

### GraftingErrorAction

Re-exports [GraftingErrorAction](types.actions.md#graftingerroraction)

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

<a id="applicationremote" name="applicationremote"></a>

### ApplicationRemote

Re-exports [ApplicationRemote](types.requests.md#applicationremote)

<a id="applicationvisit" name="applicationvisit"></a>

### ApplicationVisit

Re-exports [ApplicationVisit](types.requests.md#applicationvisit)

## Interfaces

<a id="parsedresponse" name="parsedresponse"></a>

### ParsedResponse

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="rsp" name="rsp"></a> `rsp` | `Response` | [lib/types/index.ts:111](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L111) |
| <a id="json" name="json"></a> `json` | [`PageResponse`](types.md#pageresponse) | [lib/types/index.ts:112](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L112) |

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
| <a id="url" name="url"></a> `url` | `string` | A url with props_at keypath in the query parameter to indicate how to dig for the data, and where to place the data. | [lib/types/index.ts:137](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L137) |
| <a id="type" name="type"></a> `type` | `"auto"` \| `"manual"` | When set to `auto` Superglue will automatically make the request using the `url`. When set to `manual`, Superglue does nothing, and you would need to manually use `remote` with the `url` to fetch the missing data. | [lib/types/index.ts:138](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L138) |
| <a id="path" name="path"></a> `path` | `string` | A keypath indicates how to dig for the data and where to place the data. | [lib/types/index.ts:139](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L139) |
| <a id="successaction" name="successaction"></a> `successAction` | `string` | a user defined action for Superglue to dispatch when auto deferement is successful | [lib/types/index.ts:140](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L140) |
| <a id="failaction" name="failaction"></a> `failAction` | `string` | a user defined action for Superglue to dispatch when auto deferement failed | [lib/types/index.ts:141](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L141) |

***

<a id="graftresponset" name="graftresponset"></a>

### GraftResponse\<T\>

The GraftResponse is a protocol, a shape that is responsible for partial
updates using props_template's digging functionality in Superglue. Its meant
to be implemented by the server and if you are using superglue_rails, the
generators would have generated a props_template layout and view that would
shape the graft responses for you.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) |

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data" name="data"></a> `data` | `T` | - | [lib/types/index.ts:151](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L151) |
| <a id="componentidentifier" name="componentidentifier"></a> `componentIdentifier` | `string` | - | [lib/types/index.ts:152](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L152) |
| <a id="assets" name="assets"></a> `assets` | `string`[] | - | [lib/types/index.ts:153](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L153) |
| <a id="csrftoken" name="csrftoken"></a> `csrfToken?` | `string` | - | [lib/types/index.ts:154](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L154) |
| <a id="fragments" name="fragments"></a> `fragments` | [`Fragment`](types.md#fragment)[] | - | [lib/types/index.ts:155](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L155) |
| <a id="defers" name="defers"></a> `defers` | [`Defer`](types.md#defer)[] | - | [lib/types/index.ts:156](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L156) |
| <a id="slices" name="slices"></a> `slices` | [`JSONObject`](types.md#jsonobject) | - | [lib/types/index.ts:157](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L157) |
| <a id="renderedat" name="renderedat"></a> `renderedAt` | `number` | - | [lib/types/index.ts:159](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L159) |
| <a id="restorestrategy" name="restorestrategy"></a> `restoreStrategy` | [`RestoreStrategy`](types.md#restorestrategy-1) | - | [lib/types/index.ts:160](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L160) |
| <a id="action" name="action"></a> `action` | `"graft"` | - | [lib/types/index.ts:183](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L183) |
| <a id="path-1" name="path-1"></a> `path` | `string` | Used by superglue to replace the data at that location. | [lib/types/index.ts:184](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L184) |

***

<a id="fragment" name="fragment"></a>

### Fragment

A Fragment identifies a cross cutting concern, like a shared header or footer.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-1" name="type-1"></a> `type` | `string` | A user supplied string identifying a fragment. This is usually created using [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments) | [lib/types/index.ts:202](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L202) |
| <a id="path-2" name="path-2"></a> `path` | `string` | A Keypath specifying the location of the fragment | [lib/types/index.ts:203](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L203) |

***

<a id="supergluestate" name="supergluestate"></a>

### SuperglueState

A read only state that contains meta information about
the current page.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="currentpagekey" name="currentpagekey"></a> `currentPageKey` | `string` | The [PageKey](types.md#pagekey-4) of the current page. This can be pass to [Remote](types.requests.md#remote). | [lib/types/index.ts:218](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L218) |
| <a id="pathname" name="pathname"></a> `pathname` | `string` | The pathname of the current url. | [lib/types/index.ts:220](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L220) |
| <a id="search" name="search"></a> `search` | `string` | The query string of the current url. | [lib/types/index.ts:222](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L222) |
| <a id="hash" name="hash"></a> `hash` | `string` | The hash of the current url. | [lib/types/index.ts:224](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L224) |
| <a id="csrftoken-1" name="csrftoken-1"></a> `csrfToken?` | `string` | The Rails csrfToken that you can use for forms. | [lib/types/index.ts:226](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L226) |
| <a id="assets-1" name="assets-1"></a> `assets` | `string`[] | The tracked asset digests. | [lib/types/index.ts:228](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L228) |

***

<a id="rootstatet" name="rootstatet"></a>

### RootState\<T\>

The root state for a Superglue application. It occupies
2 keys in your app.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) |

#### Indexable

 \[`name`: `string`\]: `unknown`

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue" name="superglue"></a> `superglue` | [`SuperglueState`](types.md#supergluestate) | Contains readonly metadata about the current page | [lib/types/index.ts:237](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L237) |
| <a id="pages" name="pages"></a> `pages` | [`AllPages`](types.md#allpagest)\<`T`\> | Every [PageResponse](types.md#pageresponse) that superglue recieves is stored here. | [lib/types/index.ts:239](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L239) |

***

<a id="meta" name="meta"></a>

### Meta

Meta is passed to the Promise when visit or remote
resolves and contains additional information for
navigation.

#### Extended by

- [`VisitMeta`](types.md#visitmeta)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="pagekey" name="pagekey"></a> `pageKey` | `string` | The URL of the response converted to a pageKey. Superglue uses this to persist the [VisitResponse](types.md#visitresponset) to store, when that happens. | [lib/types/index.ts:253](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L253) |
| <a id="page" name="page"></a> `page` | [`VisitResponse`](types.md#visitresponset)\<[`JSONMappable`](types.md#jsonmappable)\> | The [VisitResponse](types.md#visitresponset) of the page | [lib/types/index.ts:255](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L255) |
| <a id="redirected" name="redirected"></a> `redirected` | `boolean` | Indicates if response was redirected | [lib/types/index.ts:257](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L257) |
| <a id="rsp-1" name="rsp-1"></a> `rsp` | `Response` | The original response object | [lib/types/index.ts:259](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L259) |
| <a id="fetchargs-1" name="fetchargs-1"></a> `fetchArgs` | [`FetchArgs`](types.actions.md#fetchargs) | The original args passed to fetch. | [lib/types/index.ts:261](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L261) |
| <a id="componentidentifier-1" name="componentidentifier-1"></a> `componentIdentifier` | `string` | The [ComponentIdentifier](types.md#componentidentifier-3) extracted from the response. | [lib/types/index.ts:263](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L263) |
| <a id="needsrefresh" name="needsrefresh"></a> `needsRefresh` | `boolean` | `true` when assets locally are detected to be out of date | [lib/types/index.ts:265](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L265) |

***

<a id="visitmeta" name="visitmeta"></a>

### VisitMeta

Meta is passed to the Promise when visit or remote
resolves and contains additional information for
navigation.

#### Extends

- [`Meta`](types.md#meta)

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="pagekey-1" name="pagekey-1"></a> `pageKey` | `string` | The URL of the response converted to a pageKey. Superglue uses this to persist the [VisitResponse](types.md#visitresponset) to store, when that happens. | [`Meta`](types.md#meta).[`pageKey`](types.md#pagekey) | [lib/types/index.ts:253](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L253) |
| <a id="page-1" name="page-1"></a> `page` | [`VisitResponse`](types.md#visitresponset)\<[`JSONMappable`](types.md#jsonmappable)\> | The [VisitResponse](types.md#visitresponset) of the page | [`Meta`](types.md#meta).[`page`](types.md#page) | [lib/types/index.ts:255](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L255) |
| <a id="redirected-1" name="redirected-1"></a> `redirected` | `boolean` | Indicates if response was redirected | [`Meta`](types.md#meta).[`redirected`](types.md#redirected) | [lib/types/index.ts:257](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L257) |
| <a id="rsp-2" name="rsp-2"></a> `rsp` | `Response` | The original response object | [`Meta`](types.md#meta).[`rsp`](types.md#rsp-1) | [lib/types/index.ts:259](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L259) |
| <a id="fetchargs-2" name="fetchargs-2"></a> `fetchArgs` | [`FetchArgs`](types.actions.md#fetchargs) | The original args passed to fetch. | [`Meta`](types.md#meta).[`fetchArgs`](types.md#fetchargs-1) | [lib/types/index.ts:261](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L261) |
| <a id="componentidentifier-2" name="componentidentifier-2"></a> `componentIdentifier` | `string` | The [ComponentIdentifier](types.md#componentidentifier-3) extracted from the response. | [`Meta`](types.md#meta).[`componentIdentifier`](types.md#componentidentifier-1) | [lib/types/index.ts:263](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L263) |
| <a id="needsrefresh-1" name="needsrefresh-1"></a> `needsRefresh` | `boolean` | `true` when assets locally are detected to be out of date | [`Meta`](types.md#meta).[`needsRefresh`](types.md#needsrefresh) | [lib/types/index.ts:265](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L265) |
| <a id="navigationaction" name="navigationaction"></a> `navigationAction` | [`NavigationAction`](types.md#navigationaction-1) | The [NavigationAction](types.md#navigationaction-1). This can be used for navigation. | - | [lib/types/index.ts:270](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L270) |

***

<a id="handlers" name="handlers"></a>

### Handlers

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="onclick" name="onclick"></a> `onClick` | (`event`: `MouseEvent`\<`HTMLDivElement`, `MouseEvent`\>) => `void` | [lib/types/index.ts:314](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L314) |
| <a id="onsubmit" name="onsubmit"></a> `onSubmit` | (`event`: `FormEvent`\<`HTMLDivElement`\>) => `void` | [lib/types/index.ts:315](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L315) |

***

<a id="historystate" name="historystate"></a>

### HistoryState

The state that is saved to history.state. Superglue stores
information about the current page so that it can restore
the page state when navigating back

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue-1" name="superglue-1"></a> `superglue` | `true` | Is always `true` so superglue can differentiate pages that have superglue enabled or not | [lib/types/index.ts:337](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L337) |
| <a id="pagekey-2" name="pagekey-2"></a> `pageKey` | `string` | The page key in [SuperglueState](types.md#supergluestate) to restore from | [lib/types/index.ts:339](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L339) |
| <a id="posx" name="posx"></a> `posX` | `number` | The scroll position X of the page | [lib/types/index.ts:341](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L341) |
| <a id="posy" name="posy"></a> `posY` | `number` | The scroll position Y of the page | [lib/types/index.ts:343](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L343) |

***

<a id="basicrequestinit" name="basicrequestinit"></a>

### BasicRequestInit

A variation of RequestInit except the headers must be a regular object

#### Extends

- `RequestInit`

#### Properties

| Property | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="headers" name="headers"></a> `headers?` | \{\} | A Headers object, an object literal, or an array of two-item arrays to set request's headers. | `RequestInit.headers` | [lib/types/index.ts:370](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L370) |

***

<a id="navigationcontextprops" name="navigationcontextprops"></a>

### NavigationContextProps

Superglue comes with a Navigation component that provides a context with
access to [Visit](types.requests.md#visit), [Remote](types.requests.md#remote) and other useful tooling.

You can also use this to build your own `<Link>` component.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="navigateto" name="navigateto"></a> `navigateTo` | [`NavigateTo`](types.md#navigateto-1) | - | [lib/types/index.ts:420](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L420) |
| <a id="visit-1" name="visit-1"></a> `visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) | - | [lib/types/index.ts:421](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L421) |
| <a id="remote-1" name="remote-1"></a> `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | - | [lib/types/index.ts:422](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L422) |
| <a id="pagekey-3" name="pagekey-3"></a> `pageKey` | `string` | The pagekey that's being used to render the current page component. Useful when used in combination with [Remote](types.requests.md#remote) to create requests that target the current page. | [lib/types/index.ts:423](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L423) |
| <a id="ownprops" name="ownprops"></a> `ownProps` | `Record`\<`string`, `unknown`\> | - | [lib/types/index.ts:424](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L424) |

***

<a id="navigationproviderprops" name="navigationproviderprops"></a>

### NavigationProviderProps

This is the navigation component that gets used by [ApplicationProps](types.md#applicationprops). The component
takes a mapping of page components and swaps them when navigating and passes
[NavigateTo](types.md#navigateto-1) to all page components.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="history" name="history"></a> `history` | `History` | - | [lib/types/index.ts:437](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L437) |
| <a id="visit-2" name="visit-2"></a> `visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) | - | [lib/types/index.ts:438](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L438) |
| <a id="remote-2" name="remote-2"></a> `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | - | [lib/types/index.ts:439](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L439) |
| <a id="mapping" name="mapping"></a> `mapping` | `Record`\<`string`, `ComponentType`\<\{\}\>\> | - | [lib/types/index.ts:440](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L440) |
| <a id="initialpagekey" name="initialpagekey"></a> `initialPageKey` | `string` | The [PageKey](types.md#pagekey-4) that's to be used when first rendering. Used to determine the initial page component to show. | [lib/types/index.ts:441](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L441) |

***

<a id="buildstore" name="buildstore"></a>

### BuildStore()

Provide this callback to [ApplicationProps](types.md#applicationprops) returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

> **BuildStore**(`initialState`: [`RootState`](types.md#rootstatet)\<[`JSONMappable`](types.md#jsonmappable)\>, `reducer`: \{`superglue`: `superglueReducer`;`pages`: `pageReducer`; \}): [`SuperglueStore`](types.md#supergluestore)

Provide this callback to [ApplicationProps](types.md#applicationprops) returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `initialState` | [`RootState`](types.md#rootstatet)\<[`JSONMappable`](types.md#jsonmappable)\> | A preconfigured intial state to pass to your store. |
| `reducer` | `object` | A preconfigured reducer |
| `reducer.superglue` | (`state`: [`SuperglueState`](types.md#supergluestate), `action`: `Action`) => [`SuperglueState`](types.md#supergluestate) | - |
| `reducer.pages` | (`state`: [`AllPages`](types.md#allpagest), `action`: `Action`) => [`AllPages`](types.md#allpagest) | - |

#### Returns

[`SuperglueStore`](types.md#supergluestore)

#### Defined in

[lib/types/index.ts:453](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L453)

***

<a id="buildvisitandremote" name="buildvisitandremote"></a>

### BuildVisitAndRemote()

Provide this callback to [ApplicationProps](types.md#applicationprops) returning a visit and remote
function. These functions will be used by Superglue to power its UJS
attributes and passed to your page components and [NavigationContextProps](types.md#navigationcontextprops).
You may customize this functionality to your liking, e.g, adding a progress
bar.

> **BuildVisitAndRemote**(`navigatorRef`: `RefObject`\<\{`navigateTo`: [`NavigateTo`](types.md#navigateto-1); \}\>, `store`: [`SuperglueStore`](types.md#supergluestore)): \{`visit`: [`ApplicationVisit`](types.requests.md#applicationvisit);`remote`: [`ApplicationRemote`](types.requests.md#applicationremote); \}

Provide this callback to [ApplicationProps](types.md#applicationprops) returning a visit and remote
function. These functions will be used by Superglue to power its UJS
attributes and passed to your page components and [NavigationContextProps](types.md#navigationcontextprops).
You may customize this functionality to your liking, e.g, adding a progress
bar.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `navigatorRef` | `RefObject`\<\{`navigateTo`: [`NavigateTo`](types.md#navigateto-1); \}\> |  |
| `store` | [`SuperglueStore`](types.md#supergluestore) |  |

#### Returns

\{`visit`: [`ApplicationVisit`](types.requests.md#applicationvisit);`remote`: [`ApplicationRemote`](types.requests.md#applicationremote); \}

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) | [lib/types/index.ts:473](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L473) |
| `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | [lib/types/index.ts:474](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L474) |

#### Defined in

[lib/types/index.ts:469](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L469)

***

<a id="applicationprops" name="applicationprops"></a>

### ApplicationProps

Props for the `Application` component

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="initialpage" name="initialpage"></a> `initialPage` | [`VisitResponse`](types.md#visitresponset)\<[`JSONMappable`](types.md#jsonmappable)\> | The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb template, e.g., index.html.erb | [lib/types/index.ts:486](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L486) |
| <a id="baseurl" name="baseurl"></a> `baseUrl` | `string` | The base url prefixed to all calls made by `visit` and `remote`. | [lib/types/index.ts:491](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L491) |
| <a id="path-3" name="path-3"></a> `path` | `string` | The path of the current page. It should equal to the `location.pathname` + `location.search` + `location.hash` | [lib/types/index.ts:496](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L496) |
| <a id="buildvisitandremote-1" name="buildvisitandremote-1"></a> `buildVisitAndRemote` | [`BuildVisitAndRemote`](types.md#buildvisitandremote) | - | [lib/types/index.ts:497](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L497) |
| <a id="mapping-1" name="mapping-1"></a> `mapping` | `Record`\<`string`, `ComponentType`\<\{\}\>\> | - | [lib/types/index.ts:498](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L498) |
| <a id="history-1" name="history-1"></a> `history?` | `History` | - | [lib/types/index.ts:499](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L499) |
| <a id="store" name="store"></a> `store` | [`SuperglueStore`](types.md#supergluestore) | - | [lib/types/index.ts:500](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L500) |

## Type Aliases

<a id="pagekey-4" name="pagekey-4"></a>

### PageKey

> **PageKey**: `string`

A PageKey is a combination of a parsed URL's pathname + query string. No hash.

*

#### Example

```ts
/posts?foobar=123
```

#### Defined in

[lib/types/index.ts:22](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L22)

***

<a id="restorestrategy-1" name="restorestrategy-1"></a>

### RestoreStrategy

> **RestoreStrategy**: `"fromCacheOnly"` \| `"revisitOnly"` \| `"fromCacheAndRevisitInBackground"`

Defines the behavior when navigating to a page that is already stored on the
client. For example, when navigating back.

When the page already exists in the store:
- `fromCacheOnly` - Use the cached page that exists on the store, only.
- `revisitOnly` - Ignore the cache and make a request for the latest page. If
the response was 200, the [NavigationAction](types.md#navigationaction-1) would be `none` as we don't want
to push into history. If the response was redirected, the [NavigationAction](types.md#navigationaction-1) would be set to
`replace`.
- `fromCacheAndRevisitInBackground` - Use the cache version of the page so
   superglue can optimistically navigate to it, then make an additional request
   for the latest version.

#### Defined in

[lib/types/index.ts:38](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L38)

***

<a id="navigationaction-1" name="navigationaction-1"></a>

### NavigationAction

> **NavigationAction**: `"push"` \| `"replace"` \| `"none"`

A NavigationAction is used to tell Superglue to history.push, history.replace
or do nothing.

#### Defined in

[lib/types/index.ts:47](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L47)

***

<a id="componentidentifier-3" name="componentidentifier-3"></a>

### ComponentIdentifier

> **ComponentIdentifier**: `string`

An identifier that Superglue will uses to determine which page component to render
with your page response.

#### Defined in

[lib/types/index.ts:53](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L53)

***

<a id="keypath" name="keypath"></a>

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

[lib/types/index.ts:77](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L77)

***

<a id="jsonprimitive" name="jsonprimitive"></a>

### JSONPrimitive

> **JSONPrimitive**: `string` \| `number` \| `boolean` \| `null` \| `undefined`

A JSON Primitive value

#### Defined in

[lib/types/index.ts:84](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L84)

***

<a id="jsonobject" name="jsonobject"></a>

### JSONObject

> **JSONObject**: \{\}

A JSON Object

#### Index Signature

 \[`key`: `string`\]: [`JSONValue`](types.md#jsonvalue)

#### Defined in

[lib/types/index.ts:89](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L89)

***

<a id="jsonmappable" name="jsonmappable"></a>

### JSONMappable

> **JSONMappable**: [`JSONValue`](types.md#jsonvalue)[] \| [`JSONObject`](types.md#jsonobject)

A JSON Object or an array of values

#### Defined in

[lib/types/index.ts:96](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L96)

***

<a id="jsonkeyable" name="jsonkeyable"></a>

### JSONKeyable

> **JSONKeyable**: [`JSONObject`](types.md#jsonobject)[] \| [`JSONObject`](types.md#jsonobject)

A array of JSON key value objects or a JSON Object

#### Defined in

[lib/types/index.ts:101](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L101)

***

<a id="jsonvalue" name="jsonvalue"></a>

### JSONValue

> **JSONValue**: [`JSONPrimitive`](types.md#jsonprimitive) \| [`JSONMappable`](types.md#jsonmappable)

A primitive or a mappable object

#### Defined in

[lib/types/index.ts:106](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L106)

***

<a id="visitresponset" name="visitresponset"></a>

### VisitResponse\<T\>

> **VisitResponse**\<`T`\>: \{`data`: `T`;`componentIdentifier`: [`ComponentIdentifier`](types.md#componentidentifier-3);`assets`: `string`[];`csrfToken`: `string`;`fragments`: [`Fragment`](types.md#fragment)[];`defers`: [`Defer`](types.md#defer)[];`slices`: [`JSONObject`](types.md#jsonobject);`renderedAt`: `number`;`restoreStrategy`: [`RestoreStrategy`](types.md#restorestrategy-1); \}

The VisitResponse is a protocol, a shape that is responsible for full page
visits in Superglue. Its meant to be implemented by the server and if you are
using superglue_rails, the generators would have generated a props_template
layout and view that would shape the visit responses for you.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) |

#### Type declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `data` | `T` | [lib/types/index.ts:151](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L151) |
| `componentIdentifier` | [`ComponentIdentifier`](types.md#componentidentifier-3) | [lib/types/index.ts:152](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L152) |
| `assets` | `string`[] | [lib/types/index.ts:153](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L153) |
| `csrfToken`? | `string` | [lib/types/index.ts:154](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L154) |
| `fragments` | [`Fragment`](types.md#fragment)[] | [lib/types/index.ts:155](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L155) |
| `defers` | [`Defer`](types.md#defer)[] | [lib/types/index.ts:156](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L156) |
| `slices` | [`JSONObject`](types.md#jsonobject) | [lib/types/index.ts:157](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L157) |
| `renderedAt` | `number` | [lib/types/index.ts:159](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L159) |
| `restoreStrategy` | [`RestoreStrategy`](types.md#restorestrategy-1) | [lib/types/index.ts:160](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L160) |

#### Defined in

[lib/types/index.ts:150](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L150)

***

<a id="paget" name="paget"></a>

### Page\<T\>

> **Page**\<`T`\>: [`VisitResponse`](types.md#visitresponset)\<`T`\> & \{`savedAt`: `number`; \}

A Page is a VisitResponse that's been saved to the store

#### Type declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `savedAt` | `number` | [lib/types/index.ts:167](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L167) |

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) |

#### Defined in

[lib/types/index.ts:166](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L166)

***

<a id="pageresponse" name="pageresponse"></a>

### PageResponse

> **PageResponse**: [`GraftResponse`](types.md#graftresponset) \| [`VisitResponse`](types.md#visitresponset)

A PageResponse can be either a [GraftResponse](types.md#graftresponset) or a [VisitResponse](types.md#visitresponset).
Its meant to be implemented by the server and if you are using
superglue_rails, the generators will handle both cases.

#### Defined in

[lib/types/index.ts:192](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L192)

***

<a id="allpagest" name="allpagest"></a>

### AllPages\<T\>

> **AllPages**\<`T`\>: `Record`\<[`PageKey`](types.md#pagekey-4), [`Page`](types.md#paget)\<`T`\>\>

The store where all page responses are stored indexed by PageKey. You are encouraged
to mutate the Pages in this store.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) |

#### Defined in

[lib/types/index.ts:210](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L210)

***

<a id="visitcreator" name="visitcreator"></a>

### VisitCreator()

> **VisitCreator**: (`input`: `string` \| [`PageKey`](types.md#pagekey-4), `options`: [`VisitProps`](types.requests.md#visitprops)) => [`VisitMetaThunk`](types.md#visitmetathunk)

VisitCreator is a Redux action creator that returns a thunk. Use this to build
the [Visit](types.requests.md#visit) function. Typically its already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](types.md#pagekey-4) |
| `options` | [`VisitProps`](types.requests.md#visitprops) |

#### Returns

[`VisitMetaThunk`](types.md#visitmetathunk)

#### Defined in

[lib/types/index.ts:279](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L279)

***

<a id="remotecreator" name="remotecreator"></a>

### RemoteCreator()

> **RemoteCreator**: (`input`: `string` \| [`PageKey`](types.md#pagekey-4), `options`: [`RemoteProps`](types.requests.md#remoteprops)) => [`MetaThunk`](types.md#metathunk)

RemoteCreator is a Redux action creator that returns a thunk. Use this to build
the [Remote](types.requests.md#remote) function. Typically its already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](types.md#pagekey-4) |
| `options` | [`RemoteProps`](types.requests.md#remoteprops) |

#### Returns

[`MetaThunk`](types.md#metathunk)

#### Defined in

[lib/types/index.ts:288](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L288)

***

<a id="dispatch" name="dispatch"></a>

### Dispatch

> **Dispatch**: `ThunkDispatch`\<[`RootState`](types.md#rootstatet), `undefined`, `Action`\>

#### Defined in

[lib/types/index.ts:293](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L293)

***

<a id="supergluestore" name="supergluestore"></a>

### SuperglueStore

> **SuperglueStore**: `EnhancedStore`\<[`RootState`](types.md#rootstatet), `Action`, `Tuple`\<[`StoreEnhancer`\<\{`dispatch`: [`Dispatch`](types.md#dispatch); \}\>, `StoreEnhancer`]\>\>

A Store created with Redux Toolkit's `configureStore` setup with reducers
from Superglue. If you are using superglue_rails this would have been
generated for you in `store.js` and setup correctly in application.js

#### Defined in

[lib/types/index.ts:300](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L300)

***

<a id="ujshandlers" name="ujshandlers"></a>

### UJSHandlers()

> **UJSHandlers**: (`{
  ujsAttributePrefix,
  visit,
  remote,
  store,
}`: \{`ujsAttributePrefix`: `string`;`visit`: [`ApplicationVisit`](types.requests.md#applicationvisit);`remote`: [`ApplicationRemote`](types.requests.md#applicationremote);`store`: [`SuperglueStore`](types.md#supergluestore); \}) => [`Handlers`](types.md#handlers)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `{ ujsAttributePrefix, visit, remote, store, }` | `object` |
| `{ ujsAttributePrefix, visit, remote, store, }.ujsAttributePrefix` | `string` |
| `{ ujsAttributePrefix, visit, remote, store, }.visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) |
| `{ ujsAttributePrefix, visit, remote, store, }.remote` | [`ApplicationRemote`](types.requests.md#applicationremote) |
| `{ ujsAttributePrefix, visit, remote, store, }.store` | [`SuperglueStore`](types.md#supergluestore) |

#### Returns

[`Handlers`](types.md#handlers)

#### Defined in

[lib/types/index.ts:318](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L318)

***

<a id="saveandprocesspagethunk" name="saveandprocesspagethunk"></a>

### SaveAndProcessPageThunk

> **SaveAndProcessPageThunk**: `ThunkAction`\<`Promise`\<`void`\>, [`RootState`](types.md#rootstatet), `undefined`, `Action`\>

#### Defined in

[lib/types/index.ts:346](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L346)

***

<a id="metathunk" name="metathunk"></a>

### MetaThunk

> **MetaThunk**: `ThunkAction`\<`Promise`\<[`Meta`](types.md#meta)\>, [`RootState`](types.md#rootstatet), `undefined`, `Action`\>

#### Defined in

[lib/types/index.ts:353](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L353)

***

<a id="visitmetathunk" name="visitmetathunk"></a>

### VisitMetaThunk

> **VisitMetaThunk**: `ThunkAction`\<`Promise`\<[`VisitMeta`](types.md#visitmeta)\>, [`RootState`](types.md#rootstatet), `undefined`, `Action`\>

#### Defined in

[lib/types/index.ts:354](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L354)

***

<a id="defermentthunk" name="defermentthunk"></a>

### DefermentThunk

> **DefermentThunk**: `ThunkAction`\<`Promise`\<`void`[]\>, [`RootState`](types.md#rootstatet), `undefined`, `Action`\>

#### Defined in

[lib/types/index.ts:361](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L361)

***

<a id="navigateto-1" name="navigateto-1"></a>

### NavigateTo()

> **NavigateTo**: (`path`: [`Keypath`](types.md#keypath), `options`: \{`action`: [`NavigationAction`](types.md#navigationaction-1);`ownProps`: `Record`\<`string`, `unknown`\>; \}) => `boolean`

Passed to every page component and also available as part of a NavigationContext:

```js
import { NavigationContext } from '@thoughtbot/superglue';

const { navigateTo } = useContext(NavigationContext)
```

Manually navigate using pages that exists in the store and restores scroll
position. `navigateTo` is what [Visit](types.requests.md#visit) in your `application_visit.js`
ultimately calls.

If there is an existing page in your store `navigateTo` will restore the props,
render the correct component, and return `true`. Otherwise, it will return
`false`. This is useful if you want to restore an existing page before making a
call to `visit` or `remote`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | [`Keypath`](types.md#keypath) |  |
| `options` | `object` | - |
| `options.action` | [`NavigationAction`](types.md#navigationaction-1) | when `none`, `navigateTo` will immediately return `false` |
| `options.ownProps` | `Record`\<`string`, `unknown`\> | additional props that will be passed to the page component |

#### Returns

`boolean`

`true` if the navigation was a success, `false` if the page was not found in the
store.

#### Defined in

[lib/types/index.ts:400](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/index.ts#L400)
