## Interfaces

<a id="parsedresponse"></a>

### ParsedResponse

Defined in: [types/index.ts:168](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L168)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="rsp"></a> `rsp` | `Response` | [types/index.ts:169](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L169) |
| <a id="json"></a> `json` | [`PageResponse`](#pageresponse) | [types/index.ts:170](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L170) |

***

<a id="defer"></a>

### Defer

Defined in: [types/index.ts:194](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L194)

Defer is a node in the page response thats been intentionally filled
with empty or placeholder data for the purposes of fetching it later.

You would typically use it with props_template for parts of a page that you
know would be slower to load.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="url"></a> `url` | `string` | A url with props_at keypath in the query parameter to indicate how to dig for the data, and where to place the data. | [types/index.ts:195](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L195) |
| <a id="type"></a> `type` | `"auto"` \| `"manual"` | When set to `auto` Superglue will automatically make the request using the `url`. When set to `manual`, Superglue does nothing, and you would need to manually use `remote` with the `url` to fetch the missing data. | [types/index.ts:196](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L196) |
| <a id="path"></a> `path` | `string` | A keypath indicates how to dig for the data and where to place the data. | [types/index.ts:197](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L197) |
| <a id="successaction"></a> `successAction` | `string` | a user defined action for Superglue to dispatch when auto deferement is successful | [types/index.ts:198](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L198) |
| <a id="failaction"></a> `failAction` | `string` | a user defined action for Superglue to dispatch when auto deferement failed | [types/index.ts:199](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L199) |

***

<a id="graftresponse"></a>

### GraftResponse\<T\>

Defined in: [types/index.ts:235](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L235)

The GraftResponse is responsible for partial updates using props_template's
digging functionality in Superglue.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data-1"></a> `data` | `T` | - | [types/index.ts:236](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L236) |
| <a id="componentidentifier-2"></a> `componentIdentifier` | `string` | - | [types/index.ts:237](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L237) |
| <a id="assets-1"></a> `assets` | `string`[] | - | [types/index.ts:238](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L238) |
| <a id="csrftoken-1"></a> `csrfToken?` | `string` | - | [types/index.ts:239](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L239) |
| <a id="fragments-1"></a> `fragments` | [`FragmentPath`](#fragmentpath)[] | - | [types/index.ts:240](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L240) |
| <a id="defers-1"></a> `defers` | [`Defer`](#defer)[] | - | [types/index.ts:241](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L241) |
| <a id="slices-1"></a> `slices` | [`JSONObject`](#jsonobject) | - | [types/index.ts:242](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L242) |
| <a id="action-1"></a> `action` | `"graft"` | - | [types/index.ts:243](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L243) |
| <a id="renderedat-1"></a> `renderedAt` | `number` | - | [types/index.ts:244](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L244) |
| <a id="path-1"></a> `path` | `string` | Used by superglue to replace the data at that location. | [types/index.ts:246](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L246) |
| <a id="fragmentcontext"></a> `fragmentContext?` | `string` | - | [types/index.ts:247](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L247) |

***

<a id="fragmentpath"></a>

### FragmentPath

Defined in: [types/index.ts:284](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L284)

A FragmentPath identifies a fragment inside of a PageResponse. Its used internally by Superglue to
denormalize a page response into fragments, if any.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="id"></a> `id` | `string` | - | [types/index.ts:285](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L285) |
| <a id="path-2"></a> `path` | `string` | A Keypath specifying the location of the fragment | [types/index.ts:286](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L286) |

***

<a id="fragmentref"></a>

### FragmentRef

Defined in: [types/index.ts:297](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L297)

A FragmentRef is a reference to a Fragment.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="__id-1"></a> `__id` | `string` | A user supplied string identifying the fragment. This is usually created using [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments) | [types/index.ts:298](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L298) |

***

<a id="supergluestate"></a>

### SuperglueState

Defined in: [types/index.ts:317](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L317)

A read only state that contains meta information about
the current page.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="currentpagekey"></a> `currentPageKey` | `string` | The [PageKey](#pagekey) (url pathname + search) of the current page. This can be pass to [Remote](types.requests.md#remote). | [types/index.ts:319](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L319) |
| <a id="search"></a> `search` | `Record`\<`string`, `string` \| `undefined`\> | The query string object of the current url. | [types/index.ts:321](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L321) |
| <a id="csrftoken-3"></a> `csrfToken?` | `string` | The Rails csrfToken that you can use for forms. | [types/index.ts:323](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L323) |
| <a id="assets-3"></a> `assets` | `string`[] | The tracked asset digests. | [types/index.ts:325](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L325) |

***

<a id="rootstate"></a>

### RootState\<T\>

Defined in: [types/index.ts:332](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L332)

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
| <a id="superglue"></a> `superglue` | [`SuperglueState`](#supergluestate) | Contains readonly metadata about the current page | [types/index.ts:334](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L334) |
| <a id="pages"></a> `pages` | [`AllPages`](#allpages)\<`T`\> | Every [PageResponse](#pageresponse) that superglue recieves is stored here. | [types/index.ts:336](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L336) |
| <a id="fragments-3"></a> `fragments` | [`AllFragments`](#allfragments) | - | [types/index.ts:337](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L337) |

***

<a id="meta"></a>

### Meta

Defined in: [types/index.ts:346](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L346)

Meta is passed to the Promise when visit or remote
resolves and contains additional information for
navigation.

#### Extended by

- [`VisitMeta`](#visitmeta)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="pagekey-1"></a> `pageKey` | `string` | The URL of the response converted to a pageKey. Superglue uses this to persist the [SaveResponse](#saveresponse) to store, when that happens. | [types/index.ts:351](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L351) |
| <a id="page-1"></a> `page` | [`PageResponse`](#pageresponse) | The [SaveResponse](#saveresponse) of the page | [types/index.ts:353](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L353) |
| <a id="redirected"></a> `redirected` | `boolean` | Indicates if response was redirected | [types/index.ts:355](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L355) |
| <a id="rsp-1"></a> `rsp` | `Response` | The original response object | [types/index.ts:357](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L357) |
| <a id="fetchargs-1"></a> `fetchArgs` | [`FetchArgs`](types.actions.md#fetchargs) | The original args passed to fetch. | [types/index.ts:359](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L359) |
| <a id="componentidentifier-3"></a> `componentIdentifier?` | `string` | The [ComponentIdentifier](#componentidentifier) extracted from the response. | [types/index.ts:361](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L361) |
| <a id="needsrefresh"></a> `needsRefresh` | `boolean` | `true` when assets locally are detected to be out of date | [types/index.ts:363](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L363) |

***

<a id="visitmeta"></a>

### VisitMeta

Defined in: [types/index.ts:366](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L366)

Meta is passed to the Promise when visit or remote
resolves and contains additional information for
navigation.

#### Extends

- [`Meta`](#meta)

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="pagekey-2"></a> `pageKey` | `string` | The URL of the response converted to a pageKey. Superglue uses this to persist the [SaveResponse](#saveresponse) to store, when that happens. | [`Meta`](#meta).[`pageKey`](#pagekey-1) | [types/index.ts:351](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L351) |
| <a id="page-2"></a> `page` | [`PageResponse`](#pageresponse) | The [SaveResponse](#saveresponse) of the page | [`Meta`](#meta).[`page`](#page-1) | [types/index.ts:353](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L353) |
| <a id="redirected-1"></a> `redirected` | `boolean` | Indicates if response was redirected | [`Meta`](#meta).[`redirected`](#redirected) | [types/index.ts:355](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L355) |
| <a id="rsp-2"></a> `rsp` | `Response` | The original response object | [`Meta`](#meta).[`rsp`](#rsp-1) | [types/index.ts:357](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L357) |
| <a id="fetchargs-2"></a> `fetchArgs` | [`FetchArgs`](types.actions.md#fetchargs) | The original args passed to fetch. | [`Meta`](#meta).[`fetchArgs`](#fetchargs-1) | [types/index.ts:359](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L359) |
| <a id="componentidentifier-4"></a> `componentIdentifier?` | `string` | The [ComponentIdentifier](#componentidentifier) extracted from the response. | [`Meta`](#meta).[`componentIdentifier`](#componentidentifier-3) | [types/index.ts:361](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L361) |
| <a id="needsrefresh-1"></a> `needsRefresh` | `boolean` | `true` when assets locally are detected to be out of date | [`Meta`](#meta).[`needsRefresh`](#needsrefresh) | [types/index.ts:363](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L363) |
| <a id="navigationaction-1"></a> `navigationAction` | [`NavigationAction`](#navigationaction) | The [NavigationAction](#navigationaction). This can be used for navigation. | - | [types/index.ts:368](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L368) |

***

<a id="handlers"></a>

### Handlers

Defined in: [types/index.ts:411](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L411)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="onclick"></a> `onClick` | (`event`: `MouseEvent`\<`HTMLDivElement`, `MouseEvent`\>) => `void` | [types/index.ts:412](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L412) |
| <a id="onsubmit"></a> `onSubmit` | (`event`: `FormEvent`\<`HTMLDivElement`\>) => `void` | [types/index.ts:413](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L413) |

***

<a id="historystate"></a>

### HistoryState

Defined in: [types/index.ts:433](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L433)

The state that is saved to history.state. Superglue stores
information about the current page so that it can restore
the page state when navigating back

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="superglue-1"></a> `superglue` | `true` | Is always `true` so superglue can differentiate pages that have superglue enabled or not | [types/index.ts:435](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L435) |
| <a id="pagekey-3"></a> `pageKey` | `string` | The page key in [SuperglueState](#supergluestate) to restore from | [types/index.ts:437](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L437) |
| <a id="posx"></a> `posX` | `number` | The scroll position X of the page | [types/index.ts:439](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L439) |
| <a id="posy"></a> `posY` | `number` | The scroll position Y of the page | [types/index.ts:441](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L441) |

***

<a id="basicrequestinit"></a>

### BasicRequestInit

Defined in: [types/index.ts:467](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L467)

A variation of RequestInit except the headers must be a regular object

#### Extends

- `RequestInit`

#### Properties

| Property | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="headers"></a> `headers?` | \{\[`key`: `string`\]: `string`; \} | A Headers object, an object literal, or an array of two-item arrays to set request's headers. | `RequestInit.headers` | [types/index.ts:468](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L468) |

***

<a id="navigationcontextprops"></a>

### NavigationContextProps

Defined in: [types/index.ts:516](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L516)

Superglue comes with a Navigation component that provides a context with
access to [Visit](types.requests.md#visit), [Remote](types.requests.md#remote) and other useful tooling.

You can also use this to build your own `<Link>` component.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="navigateto-1"></a> `navigateTo` | [`NavigateTo`](#navigateto) | - | [types/index.ts:517](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L517) |
| <a id="visit"></a> `visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) | - | [types/index.ts:518](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L518) |
| <a id="remote"></a> `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | - | [types/index.ts:519](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L519) |
| <a id="pagekey-4"></a> `pageKey` | `string` | The pagekey that's being used to render the current page component. Useful when used in combination with [Remote](types.requests.md#remote) to create requests that target the current page. | [types/index.ts:520](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L520) |
| <a id="search-1"></a> `search` | `Record`\<`string`, `undefined` \| `string`\> | The current pageKey (current url) query params as an object. | [types/index.ts:521](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L521) |

***

<a id="navigationproviderprops"></a>

### NavigationProviderProps

Defined in: [types/index.ts:533](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L533)

This is the navigation component that gets used by [ApplicationProps](#applicationprops). The component
takes a mapping of page components and swaps them when navigating and passes
[NavigateTo](#navigateto) to all page components.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="history"></a> `history` | `History` | - | [types/index.ts:534](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L534) |
| <a id="visit-1"></a> `visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) | - | [types/index.ts:535](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L535) |
| <a id="remote-1"></a> `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | - | [types/index.ts:536](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L536) |
| <a id="mapping"></a> `mapping` | `Record`\<[`ComponentIdentifier`](#componentidentifier), `React.ComponentType`\> | - | [types/index.ts:537](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L537) |
| <a id="initialpagekey"></a> `initialPageKey` | `string` | The [PageKey](#pagekey) that's to be used when first rendering. Used to determine the initial page component to show. | [types/index.ts:538](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L538) |

***

<a id="buildstore"></a>

### BuildStore()

Defined in: [types/index.ts:549](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L549)

Provide this callback to [ApplicationProps](#applicationprops) returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

> **BuildStore**(`initialState`: [`RootState`](#rootstate), `reducer`: \{ `superglue`: (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate); `pages`: (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages); `fragments`: (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments); \}): [`SuperglueStore`](#supergluestore)

Defined in: [types/index.ts:550](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L550)

Provide this callback to [ApplicationProps](#applicationprops) returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `initialState` | [`RootState`](#rootstate) | A preconfigured intial state to pass to your store. |
| `reducer` | \{ `superglue`: (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate); `pages`: (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages); `fragments`: (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments); \} | A preconfigured reducer |
| `reducer.superglue` | (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate) | - |
| `reducer.pages` | (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages) | - |
| `reducer.fragments` | (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments) | - |

#### Returns

[`SuperglueStore`](#supergluestore)

***

<a id="buildvisitandremote"></a>

### BuildVisitAndRemote()

Defined in: [types/index.ts:565](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L565)

Provide this callback to [ApplicationProps](#applicationprops) returning a visit and remote
function. These functions will be used by Superglue to power its UJS
attributes and passed to your page components and [NavigationContextProps](#navigationcontextprops).
You may customize this functionality to your liking, e.g, adding a progress
bar.

> **BuildVisitAndRemote**(`navigatorRef`: `RefObject`\<`null` \| \{ `navigateTo`: [`NavigateTo`](#navigateto); \}\>, `store`: [`SuperglueStore`](#supergluestore)): \{ `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); \}

Defined in: [types/index.ts:566](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L566)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `navigatorRef` | `RefObject`\<`null` \| \{ `navigateTo`: [`NavigateTo`](#navigateto); \}\> |  |
| `store` | [`SuperglueStore`](#supergluestore) |  |

#### Returns

\{ `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); \}

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) | [types/index.ts:570](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L570) |
| `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | [types/index.ts:571](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L571) |

***

<a id="setupprops"></a>

### SetupProps

Defined in: [types/index.ts:575](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L575)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="initialpage"></a> `initialPage` | [`SaveResponse`](#saveresponse) | The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb template, e.g., application/superglue.html.erb | [types/index.ts:580](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L580) |
| <a id="baseurl"></a> `baseUrl` | `string` | The base url prefixed to all calls made by `visit` and `remote`. | [types/index.ts:585](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L585) |
| <a id="path-3"></a> `path` | `string` | The path of the current page. It should equal to the `location.pathname` + `location.search` + `location.hash` | [types/index.ts:590](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L590) |
| <a id="store"></a> `store` | [`SuperglueStore`](#supergluestore) | The exported store from store.js. If you used the generators it would contain slices for superglue, pages, and the flash. | [types/index.ts:595](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L595) |
| <a id="buildvisitandremote-2"></a> `buildVisitAndRemote` | [`BuildVisitAndRemote`](#buildvisitandremote) | A factory function that will return a `visit` and `remote` function. All of Superglue and UJS will use these functions. You should customize the function, for example, to add a progress bar. | [types/index.ts:602](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L602) |
| <a id="history-1"></a> `history?` | `History` | An optional history object https://github.com/remix-run/history. If none is provided Superglue will create one for you. | [types/index.ts:607](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L607) |
| <a id="navigatorref"></a> `navigatorRef` | `RefObject`\<`null` \| \{ `navigateTo`: [`NavigateTo`](#navigateto); \}\> | A ref object created from the Application component that will be passed to buildVisitAndRemote | [types/index.ts:611](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L611) |

***

<a id="applicationprops"></a>

### ApplicationProps

Defined in: [types/index.ts:619](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L619)

Props for the `Application` component

#### Extends

- `ComponentPropsWithoutRef`\<`"div"`\>

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="initialpage-1"></a> `initialPage` | [`SaveResponse`](#saveresponse) | The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb template, e.g., application/superglue.html.erb | [types/index.ts:625](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L625) |
| <a id="baseurl-1"></a> `baseUrl` | `string` | The base url prefixed to all calls made by `visit` and `remote`. | [types/index.ts:630](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L630) |
| <a id="path-4"></a> `path` | `string` | The path of the current page. It should equal to the `location.pathname` + `location.search` + `location.hash` | [types/index.ts:635](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L635) |
| <a id="buildvisitandremote-3"></a> `buildVisitAndRemote` | [`BuildVisitAndRemote`](#buildvisitandremote) | A factory function that will return a `visit` and `remote` function. All of Superglue and UJS will use these functions. You should customize the function, for example, to add a progress bar. | [types/index.ts:642](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L642) |
| <a id="mapping-1"></a> `mapping` | `Record`\<`string`, `React.ComponentType`\> | A mapping between your page props and page component. This is setup for you in page_to_page_mapping. | [types/index.ts:647](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L647) |
| <a id="history-2"></a> `history?` | `History` | An optional history object https://github.com/remix-run/history. If none is provided Superglue will create one for you. | [types/index.ts:652](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L652) |
| <a id="store-1"></a> `store` | [`SuperglueStore`](#supergluestore) | The exported store from store.js. If you used the generators it would contain slices for superglue, pages, and the flash. | [types/index.ts:657](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L657) |

## Type Aliases

<a id="pagekey"></a>

### PageKey

> **PageKey** = `string`

Defined in: [types/index.ts:22](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L22)

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

Defined in: [types/index.ts:38](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L38)

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

Defined in: [types/index.ts:47](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L47)

A NavigationAction is used to tell Superglue to history.push, history.replace
or do nothing.

***

<a id="componentidentifier"></a>

### ComponentIdentifier

> **ComponentIdentifier** = `string`

Defined in: [types/index.ts:53](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L53)

An identifier that Superglue will uses to determine which page component to render
with your page response.

***

<a id="keypath"></a>

### Keypath

> **Keypath** = `string`

Defined in: [types/index.ts:77](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L77)

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

Defined in: [types/index.ts:84](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L84)

A JSON Primitive value

***

<a id="jsonobject"></a>

### JSONObject

> **JSONObject** = \{\[`key`: `string`\]: [`JSONValue`](#jsonvalue); \}

Defined in: [types/index.ts:89](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L89)

A JSON Object

#### Index Signature

\[`key`: `string`\]: [`JSONValue`](#jsonvalue)

***

<a id="jsonmappable"></a>

### JSONMappable

> **JSONMappable** = [`JSONValue`](#jsonvalue)[] \| [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:96](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L96)

A JSON Object or an array of values

***

<a id="jsonkeyable"></a>

### JSONKeyable

> **JSONKeyable** = [`JSONObject`](#jsonobject)[] \| [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:101](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L101)

A array of JSON key value objects or a JSON Object

***

<a id="jsonvalue"></a>

### JSONValue

> **JSONValue** = [`JSONPrimitive`](#jsonprimitive) \| [`JSONMappable`](#jsonmappable)

Defined in: [types/index.ts:106](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L106)

A primitive or a mappable object

***

<a id="fragment"></a>

### Fragment\<T, Present\>

> **Fragment**\<`T`, `Present`\> = \{ `__id`: `string`; `__fragmentType?`: `T`; `__required?`: `Present` *extends* `boolean` ? `Present` : `false`; \}

Defined in: [types/index.ts:145](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L145)

A Fragment is a rendered Rails partial with an identity. The use
of this type is optional, but it makes usage with unproxy and
useSetFragment type friendly.

In general, Fragments enable normalized state management where Rails partials become
referenceable entities on the client. The server renders partials as
fragments with unique IDs, then Superglue normalizes them into a separate
fragments store while replacing the original data with fragment references.

#### Examples

```json
{
  "data": { "cart": { "__id": "userCart" } },
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

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | - |
| `Present` | `false` |

#### Properties

<a id="__id"></a>

##### \_\_id

> **\_\_id**: `string`

Defined in: [types/index.ts:147](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L147)

The fragment ID *

<a id="__fragmenttype"></a>

##### \_\_fragmentType?

> `optional` **\_\_fragmentType**: `T`

Defined in: [types/index.ts:149](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L149)

Phantom type, please ignore *

<a id="__required"></a>

##### \_\_required?

> `optional` **\_\_required**: `Present` *extends* `boolean` ? `Present` : `false`

Defined in: [types/index.ts:151](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L151)

Phantom type, please ignore *

***

<a id="unproxy"></a>

### Unproxy\<T\>

> **Unproxy**\<`T`\> = `T` *extends* [`Fragment`](#fragment)\<`unknown`\> ? [`FragmentRef`](#fragmentref) : `T` *extends* infer U[] ? [`Unproxy`](#unproxy)\<`U`\>[] : `T` *extends* `object` ? `{ [K in keyof T]: Unproxy<T[K]> }` : `T`

Defined in: [types/index.ts:158](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L158)

Utility type for unproxy that converts Fragment types to fragment references.
This recursively processes objects and arrays to convert Fragment<T> to { __id: string }.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

<a id="saveresponse"></a>

### SaveResponse\<T\>

> **SaveResponse**\<`T`\> = \{ `data`: `T`; `componentIdentifier`: [`ComponentIdentifier`](#componentidentifier); `assets`: `string`[]; `csrfToken?`: `string`; `fragments`: [`FragmentPath`](#fragmentpath)[]; `defers`: [`Defer`](#defer)[]; `slices`: [`JSONObject`](#jsonobject); `action`: `"savePage"`; `renderedAt`: `number`; `restoreStrategy`: [`RestoreStrategy`](#restorestrategy); \}

Defined in: [types/index.ts:206](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L206)

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

Defined in: [types/index.ts:207](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L207)

<a id="componentidentifier-1"></a>

##### componentIdentifier

> **componentIdentifier**: [`ComponentIdentifier`](#componentidentifier)

Defined in: [types/index.ts:208](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L208)

<a id="assets"></a>

##### assets

> **assets**: `string`[]

Defined in: [types/index.ts:209](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L209)

<a id="csrftoken"></a>

##### csrfToken?

> `optional` **csrfToken**: `string`

Defined in: [types/index.ts:210](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L210)

<a id="fragments"></a>

##### fragments

> **fragments**: [`FragmentPath`](#fragmentpath)[]

Defined in: [types/index.ts:211](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L211)

<a id="defers"></a>

##### defers

> **defers**: [`Defer`](#defer)[]

Defined in: [types/index.ts:212](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L212)

<a id="slices"></a>

##### slices

> **slices**: [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:213](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L213)

<a id="action"></a>

##### action

> **action**: `"savePage"`

Defined in: [types/index.ts:214](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L214)

<a id="renderedat"></a>

##### renderedAt

> **renderedAt**: `number`

Defined in: [types/index.ts:216](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L216)

<a id="restorestrategy-1"></a>

##### restoreStrategy

> **restoreStrategy**: [`RestoreStrategy`](#restorestrategy)

Defined in: [types/index.ts:217](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L217)

***

<a id="page"></a>

### Page\<T\>

> **Page**\<`T`\> = [`SaveResponse`](#saveresponse)\<`T`\> & \{ `savedAt`: `number`; \}

Defined in: [types/index.ts:223](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L223)

A Page is a SaveResponse that's been saved to the store

#### Type declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `savedAt` | `number` | [types/index.ts:224](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L224) |

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](#jsonmappable) |

***

<a id="streammessage"></a>

### StreamMessage

> **StreamMessage** = \{ `data`: [`JSONMappable`](#jsonmappable); `fragmentIds`: `string`[]; `handler`: `"append"` \| `"prepend"` \| `"save"`; `options`: `Record`\<`string`, `string`\>; \}

Defined in: [types/index.ts:250](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L250)

#### Properties

<a id="data-2"></a>

##### data

> **data**: [`JSONMappable`](#jsonmappable)

Defined in: [types/index.ts:251](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L251)

<a id="fragmentids"></a>

##### fragmentIds

> **fragmentIds**: `string`[]

Defined in: [types/index.ts:252](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L252)

<a id="handler"></a>

##### handler

> **handler**: `"append"` \| `"prepend"` \| `"save"`

Defined in: [types/index.ts:253](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L253)

<a id="options"></a>

##### options

> **options**: `Record`\<`string`, `string`\>

Defined in: [types/index.ts:254](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L254)

***

<a id="streamresponse"></a>

### StreamResponse

> **StreamResponse** = \{ `data`: [`StreamMessage`](#streammessage)[]; `fragments`: [`FragmentPath`](#fragmentpath)[]; `assets`: `string`[]; `csrfToken?`: `string`; `action`: `"handleStreamResponse"`; `renderedAt`: `number`; `slices`: [`JSONObject`](#jsonobject); \}

Defined in: [types/index.ts:257](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L257)

#### Properties

<a id="data-3"></a>

##### data

> **data**: [`StreamMessage`](#streammessage)[]

Defined in: [types/index.ts:258](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L258)

<a id="fragments-2"></a>

##### fragments

> **fragments**: [`FragmentPath`](#fragmentpath)[]

Defined in: [types/index.ts:259](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L259)

<a id="assets-2"></a>

##### assets

> **assets**: `string`[]

Defined in: [types/index.ts:260](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L260)

<a id="csrftoken-2"></a>

##### csrfToken?

> `optional` **csrfToken**: `string`

Defined in: [types/index.ts:261](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L261)

<a id="action-2"></a>

##### action

> **action**: `"handleStreamResponse"`

Defined in: [types/index.ts:262](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L262)

<a id="renderedat-2"></a>

##### renderedAt

> **renderedAt**: `number`

Defined in: [types/index.ts:263](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L263)

<a id="slices-2"></a>

##### slices

> **slices**: [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:264](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L264)

***

<a id="pageresponse"></a>

### PageResponse

> **PageResponse** = [`GraftResponse`](#graftresponse) \| [`SaveResponse`](#saveresponse) \| [`StreamResponse`](#streamresponse)

Defined in: [types/index.ts:272](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L272)

A PageResponse can be either a [GraftResponse](#graftresponse), [SaveResponse](#saveresponse).
or a [StreamResponse](#streamresponse) Its meant to be implemented by the server and if
you are using superglue_rails, the generators will handle all cases.

***

<a id="allpages"></a>

### AllPages\<T\>

> **AllPages**\<`T`\> = `Record`\<[`PageKey`](#pagekey), [`Page`](#page)\<`T`\>\>

Defined in: [types/index.ts:305](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L305)

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

Defined in: [types/index.ts:311](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L311)

The store where all page responses are stored indexed by PageKey. You are encouraged
to mutate the Pages in this store.

***

<a id="visitcreator"></a>

### VisitCreator()

> **VisitCreator** = (`input`: `string` \| [`PageKey`](#pagekey), `options`: [`VisitProps`](types.requests.md#visitprops)) => [`VisitMetaThunk`](#visitmetathunk)

Defined in: [types/index.ts:377](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L377)

VisitCreator is a Redux action creator that returns a thunk. Use this to build
the [Visit](types.requests.md#visit) function. Typically it's already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](#pagekey) |
| `options` | [`VisitProps`](types.requests.md#visitprops) |

#### Returns

[`VisitMetaThunk`](#visitmetathunk)

***

<a id="remotecreator"></a>

### RemoteCreator()

> **RemoteCreator** = (`input`: `string` \| [`PageKey`](#pagekey), `options`: [`RemoteProps`](types.requests.md#remoteprops)) => [`MetaThunk`](#metathunk)

Defined in: [types/index.ts:386](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L386)

RemoteCreator is a Redux action creator that returns a thunk. Use this to build
the [Remote](types.requests.md#remote) function. Typically it's already generated in `application_visit.js`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| [`PageKey`](#pagekey) |
| `options` | [`RemoteProps`](types.requests.md#remoteprops) |

#### Returns

[`MetaThunk`](#metathunk)

***

<a id="dispatch"></a>

### Dispatch

> **Dispatch** = `ThunkDispatch`\<[`RootState`](#rootstate), `undefined`, `Action`\>

Defined in: [types/index.ts:391](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L391)

***

<a id="supergluestore"></a>

### SuperglueStore

> **SuperglueStore** = `EnhancedStore`\<[`RootState`](#rootstate), `Action`, `Tuple`\<\[`StoreEnhancer`\<\{ `dispatch`: [`Dispatch`](#dispatch); \}\>, `StoreEnhancer`\]\>\>

Defined in: [types/index.ts:398](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L398)

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
}`: \{ `ujsAttributePrefix`: `string`; `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); `store`: [`SuperglueStore`](#supergluestore); \}) => [`Handlers`](#handlers)

Defined in: [types/index.ts:416](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L416)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `{ ujsAttributePrefix, visit, remote, store, }` | \{ `ujsAttributePrefix`: `string`; `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); `store`: [`SuperglueStore`](#supergluestore); \} |
| `{ ujsAttributePrefix, visit, remote, store, }.ujsAttributePrefix` | `string` |
| `{ ujsAttributePrefix, visit, remote, store, }.visit` | [`ApplicationVisit`](types.requests.md#applicationvisit) |
| `{ ujsAttributePrefix, visit, remote, store, }.remote` | [`ApplicationRemote`](types.requests.md#applicationremote) |
| `{ ujsAttributePrefix, visit, remote, store, }.store` | [`SuperglueStore`](#supergluestore) |

#### Returns

[`Handlers`](#handlers)

***

<a id="saveandprocesspagethunk"></a>

### SaveAndProcessPageThunk

> **SaveAndProcessPageThunk** = `ThunkAction`\<`Promise`\<`void`\>, [`RootState`](#rootstate), `undefined`, `Action`\>

Defined in: [types/index.ts:444](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L444)

***

<a id="metathunk"></a>

### MetaThunk

> **MetaThunk** = `ThunkAction`\<`Promise`\<[`Meta`](#meta)\>, [`RootState`](#rootstate), `undefined`, `Action`\>

Defined in: [types/index.ts:451](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L451)

***

<a id="visitmetathunk"></a>

### VisitMetaThunk

> **VisitMetaThunk** = `ThunkAction`\<`Promise`\<[`VisitMeta`](#visitmeta)\>, [`RootState`](#rootstate), `undefined`, `Action`\>

Defined in: [types/index.ts:452](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L452)

***

<a id="defermentthunk"></a>

### DefermentThunk

> **DefermentThunk** = `ThunkAction`\<`Promise`\<`void`[]\>, [`RootState`](#rootstate), `undefined`, `Action`\>

Defined in: [types/index.ts:459](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L459)

***

<a id="navigateto"></a>

### NavigateTo()

> **NavigateTo** = (`path`: [`Keypath`](#keypath), `options`: \{ `action`: [`NavigationAction`](#navigationaction); \}) => `boolean`

Defined in: [types/index.ts:497](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/index.ts#L497)

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
| `path` | [`Keypath`](#keypath) |  |
| `options` | \{ `action`: [`NavigationAction`](#navigationaction); \} | - |
| `options.action` | [`NavigationAction`](#navigationaction) | when `none`, `navigateTo` will immediately return `false` |

#### Returns

`boolean`

`true` if the navigation was a success, `false` if the page was not found in the
store.

## References

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

<a id="visit-2"></a>

### Visit

Re-exports [Visit](types.requests.md#visit)

***

<a id="visitprops"></a>

### VisitProps

Re-exports [VisitProps](types.requests.md#visitprops)

***

<a id="remote-2"></a>

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
