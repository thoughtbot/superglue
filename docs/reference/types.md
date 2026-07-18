## Interfaces

<a id="parsedresponse"></a>

### ParsedResponse

Defined in: [types/index.ts:202](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L202)

#### Properties

| Property                 | Type                            | Defined in                                                                                                                                    |
| ------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="rsp"></a> `rsp`   | `Response`                      | [types/index.ts:203](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L203) |
| <a id="json"></a> `json` | [`PageResponse`](#pageresponse) | [types/index.ts:204](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L204) |

---

<a id="defer"></a>

### Defer

Defined in: [types/index.ts:228](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L228)

Defer is a node in the page response thats been intentionally filled
with empty or placeholder data for the purposes of fetching it later.

You would typically use it with props_template for parts of a page that you
know would be slower to load.

#### Properties

| Property                                   | Type                   | Description                                                                                                                                                                                                           | Defined in                                                                                                                                    |
| ------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="url"></a> `url`                     | `string`               | A url with props_at keypath in the query parameter to indicate how to dig for the data, and where to place the data.                                                                                                  | [types/index.ts:229](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L229) |
| <a id="type"></a> `type`                   | `"auto"` \| `"manual"` | When set to `auto` Superglue will automatically make the request using the `url`. When set to `manual`, Superglue does nothing, and you would need to manually use `remote` with the `url` to fetch the missing data. | [types/index.ts:230](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L230) |
| <a id="path"></a> `path`                   | `string`               | A keypath indicates how to dig for the data and where to place the data.                                                                                                                                              | [types/index.ts:231](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L231) |
| <a id="successaction"></a> `successAction` | `string`               | a user defined action for Superglue to dispatch when auto deferement is successful                                                                                                                                    | [types/index.ts:232](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L232) |
| <a id="failaction"></a> `failAction`       | `string`               | a user defined action for Superglue to dispatch when auto deferement failed                                                                                                                                           | [types/index.ts:233](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L233) |

---

<a id="graftresponse"></a>

### GraftResponse\<T\>

Defined in: [types/index.ts:269](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L269)

The GraftResponse is responsible for partial updates using props_template's
digging functionality in Superglue.

#### Type Parameters

| Type Parameter | Default type                    |
| -------------- | ------------------------------- |
| `T`            | [`JSONMappable`](#jsonmappable) |

#### Properties

| Property                                                 | Type                              | Description                                             | Defined in                                                                                                                                    |
| -------------------------------------------------------- | --------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="data-1"></a> `data`                               | `T`                               | -                                                       | [types/index.ts:270](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L270) |
| <a id="componentidentifier-2"></a> `componentIdentifier` | `string`                          | -                                                       | [types/index.ts:271](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L271) |
| <a id="assets-1"></a> `assets`                           | `string`[]                        | -                                                       | [types/index.ts:272](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L272) |
| <a id="csrftoken-1"></a> `csrfToken?`                    | `string`                          | -                                                       | [types/index.ts:273](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L273) |
| <a id="fragments-1"></a> `fragments`                     | [`FragmentPath`](#fragmentpath)[] | -                                                       | [types/index.ts:274](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L274) |
| <a id="defers-1"></a> `defers`                           | [`Defer`](#defer)[]               | -                                                       | [types/index.ts:275](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L275) |
| <a id="flash-1"></a> `flash`                             | [`FlashState`](#flashstate)       | -                                                       | [types/index.ts:276](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L276) |
| <a id="action-1"></a> `action`                           | `"graft"`                         | -                                                       | [types/index.ts:277](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L277) |
| <a id="renderedat-1"></a> `renderedAt`                   | `number`                          | -                                                       | [types/index.ts:278](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L278) |
| <a id="path-1"></a> `path`                               | `string`                          | Used by superglue to replace the data at that location. | [types/index.ts:280](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L280) |
| <a id="fragmentcontext"></a> `fragmentContext?`          | `string`                          | -                                                       | [types/index.ts:281](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L281) |

---

<a id="fragmentpath"></a>

### FragmentPath

Defined in: [types/index.ts:318](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L318)

A FragmentPath identifies a fragment inside of a PageResponse. Its used internally by Superglue to
denormalize a page response into fragments, if any.

#### Properties

| Property                   | Type     | Description                                       | Defined in                                                                                                                                    |
| -------------------------- | -------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="id"></a> `id`       | `string` | -                                                 | [types/index.ts:319](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L319) |
| <a id="path-2"></a> `path` | `string` | A Keypath specifying the location of the fragment | [types/index.ts:320](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L320) |

---

<a id="fragmentref"></a>

### FragmentRef\<T, Present\>

Defined in: [types/index.ts:331](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L331)

A FragmentRef is a reference to a Fragment.

#### Type Parameters

| Type Parameter                | Default type |
| ----------------------------- | ------------ |
| `T`                           | `unknown`    |
| `Present` _extends_ `boolean` | `false`      |

#### Properties

| Property                            | Type      | Description                                                                                                                                                                    | Defined in                                                                                                                                    |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="__ref"></a> `__ref`          | `true`    | -                                                                                                                                                                              | [types/index.ts:332](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L332) |
| <a id="__id"></a> `__id`            | `string`  | A user supplied string identifying the fragment. This is usually created using [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments) | [types/index.ts:333](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L333) |
| <a id="__type"></a> `__type?`       | `T`       | -                                                                                                                                                                              | [types/index.ts:334](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L334) |
| <a id="__present"></a> `__present?` | `Present` | -                                                                                                                                                                              | [types/index.ts:335](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L335) |

---

<a id="supergluestate"></a>

### SuperglueState

Defined in: [types/index.ts:354](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L354)

A read only state that contains meta information about
the current page.

#### Properties

| Property                                     | Type                                          | Description                                                                                                                  | Defined in                                                                                                                                    |
| -------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="currentpagekey"></a> `currentPageKey` | `string`                                      | The [PageKey](#pagekey) (url pathname + search) of the current page. This can be pass to [Remote](types.requests.md#remote). | [types/index.ts:356](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L356) |
| <a id="search"></a> `search`                 | `Record`\<`string`, `string` \| `undefined`\> | The query string object of the current url.                                                                                  | [types/index.ts:358](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L358) |
| <a id="csrftoken-3"></a> `csrfToken?`        | `string`                                      | The Rails csrfToken that you can use for forms.                                                                              | [types/index.ts:360](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L360) |
| <a id="assets-3"></a> `assets`               | `string`[]                                    | The tracked asset digests.                                                                                                   | [types/index.ts:362](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L362) |
| <a id="isvisiting"></a> `isVisiting`         | `boolean`                                     | Flag indicating if a visit is currently in flight.                                                                           | [types/index.ts:364](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L364) |

---

<a id="rootstate"></a>

### RootState\<T\>

Defined in: [types/index.ts:369](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L369)

The root state for a Superglue application. It occupies
2 keys in your app.

#### Type Parameters

| Type Parameter | Default type                    |
| -------------- | ------------------------------- |
| `T`            | [`JSONMappable`](#jsonmappable) |

#### Indexable

\[`name`: `string`\]: `unknown`

#### Properties

| Property                             | Type                                | Description                                                                 | Defined in                                                                                                                                    |
| ------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="superglue"></a> `superglue`   | [`SuperglueState`](#supergluestate) | Contains readonly metadata about the current page                           | [types/index.ts:371](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L371) |
| <a id="pages"></a> `pages`           | [`AllPages`](#allpages)\<`T`\>      | Every [PageResponse](#pageresponse) that superglue recieves is stored here. | [types/index.ts:373](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L373) |
| <a id="fragments-3"></a> `fragments` | [`AllFragments`](#allfragments)     | -                                                                           | [types/index.ts:374](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L374) |
| <a id="flash-3"></a> `flash`         | [`FlashState`](#flashstate)         | -                                                                           | [types/index.ts:375](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L375) |

---

<a id="result"></a>

### Result

Defined in: [types/index.ts:384](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L384)

The success branch of a `remote` call. Resolved by the `remote` thunk
and `webRemote`; the `hasError: false` literal acts as the
discriminant for narrowing against [ErrorResult](#errorresult).

#### Extended by

- [`VisitResult`](#visitresult)

#### Properties

| Property                                                  | Type                                      | Description                                                                                                                                   | Defined in                                                                                                                                    |
| --------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="haserror"></a> `hasError`                          | `false`                                   | -                                                                                                                                             | [types/index.ts:385](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L385) |
| <a id="pagekey-1"></a> `pageKey`                          | `string`                                  | The URL of the response converted to a pageKey. Superglue uses this to persist the [SaveResponse](#saveresponse) to store, when that happens. | [types/index.ts:390](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L390) |
| <a id="page-1"></a> `page`                                | [`PageResponse`](#pageresponse)           | The [SaveResponse](#saveresponse) of the page                                                                                                 | [types/index.ts:392](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L392) |
| <a id="redirected"></a> `redirected`                      | `boolean`                                 | Indicates if response was redirected                                                                                                          | [types/index.ts:394](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L394) |
| <a id="rsp-1"></a> `rsp`                                  | `Response`                                | The original response object                                                                                                                  | [types/index.ts:396](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L396) |
| <a id="fetchargs-1"></a> `fetchArgs`                      | [`FetchArgs`](types.actions.md#fetchargs) | The original args passed to fetch.                                                                                                            | [types/index.ts:398](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L398) |
| <a id="componentidentifier-3"></a> `componentIdentifier?` | `string`                                  | The [ComponentIdentifier](#componentidentifier) extracted from the response.                                                                  | [types/index.ts:400](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L400) |
| <a id="needsrefresh"></a> `needsRefresh`                  | `boolean`                                 | `true` when assets locally are detected to be out of date                                                                                     | [types/index.ts:402](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L402) |

---

<a id="visitresult"></a>

### VisitResult

Defined in: [types/index.ts:409](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L409)

The success branch of a `visit` call. Extends [Result](#result) with the
computed [NavigationAction](#navigationaction) for browser-history orchestration.

#### Extends

- [`Result`](#result)

#### Properties

| Property                                                  | Type                                      | Description                                                                                                                                   | Inherited from                                                      | Defined in                                                                                                                                    |
| --------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="haserror-1"></a> `hasError`                        | `false`                                   | -                                                                                                                                             | [`Result`](#result).[`hasError`](#haserror)                         | [types/index.ts:385](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L385) |
| <a id="pagekey-2"></a> `pageKey`                          | `string`                                  | The URL of the response converted to a pageKey. Superglue uses this to persist the [SaveResponse](#saveresponse) to store, when that happens. | [`Result`](#result).[`pageKey`](#pagekey-1)                         | [types/index.ts:390](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L390) |
| <a id="page-2"></a> `page`                                | [`PageResponse`](#pageresponse)           | The [SaveResponse](#saveresponse) of the page                                                                                                 | [`Result`](#result).[`page`](#page-1)                               | [types/index.ts:392](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L392) |
| <a id="redirected-1"></a> `redirected`                    | `boolean`                                 | Indicates if response was redirected                                                                                                          | [`Result`](#result).[`redirected`](#redirected)                     | [types/index.ts:394](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L394) |
| <a id="rsp-2"></a> `rsp`                                  | `Response`                                | The original response object                                                                                                                  | [`Result`](#result).[`rsp`](#rsp-1)                                 | [types/index.ts:396](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L396) |
| <a id="fetchargs-2"></a> `fetchArgs`                      | [`FetchArgs`](types.actions.md#fetchargs) | The original args passed to fetch.                                                                                                            | [`Result`](#result).[`fetchArgs`](#fetchargs-1)                     | [types/index.ts:398](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L398) |
| <a id="componentidentifier-4"></a> `componentIdentifier?` | `string`                                  | The [ComponentIdentifier](#componentidentifier) extracted from the response.                                                                  | [`Result`](#result).[`componentIdentifier`](#componentidentifier-3) | [types/index.ts:400](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L400) |
| <a id="needsrefresh-1"></a> `needsRefresh`                | `boolean`                                 | `true` when assets locally are detected to be out of date                                                                                     | [`Result`](#result).[`needsRefresh`](#needsrefresh)                 | [types/index.ts:402](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L402) |
| <a id="navigationaction-1"></a> `navigationAction`        | [`NavigationAction`](#navigationaction)   | The [NavigationAction](#navigationaction). This can be used for navigation.                                                                   | -                                                                   | [types/index.ts:411](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L411) |

---

<a id="errorresult"></a>

### ErrorResult

Defined in: [types/index.ts:419](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L419)

The error branch returned by `visit` and `remote` when the server
responds with a non-2xx status. Non-HTTP failures (network, parse,
abort, programming bugs) propagate as a rejected promise instead.

#### Properties

| Property                           | Type       | Description               | Defined in                                                                                                                                    |
| ---------------------------------- | ---------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="haserror-2"></a> `hasError` | `true`     | -                         | [types/index.ts:420](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L420) |
| <a id="response"></a> `response`   | `Response` | The failed HTTP response. | [types/index.ts:422](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L422) |

---

<a id="handlers"></a>

### Handlers

Defined in: [types/index.ts:471](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L471)

#### Properties

| Property                         | Type                                                                | Defined in                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="onclick"></a> `onClick`   | (`event`: `MouseEvent`\<`HTMLDivElement`, `MouseEvent`\>) => `void` | [types/index.ts:472](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L472) |
| <a id="onsubmit"></a> `onSubmit` | (`event`: `FormEvent`\<`HTMLDivElement`\>) => `void`                | [types/index.ts:473](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L473) |

---

<a id="historystate"></a>

### HistoryState

Defined in: [types/index.ts:493](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L493)

The state that is saved to history.state. Superglue stores
information about the current page so that it can restore
the page state when navigating back

#### Properties

| Property                             | Type     | Description                                                                              | Defined in                                                                                                                                    |
| ------------------------------------ | -------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="superglue-1"></a> `superglue` | `true`   | Is always `true` so superglue can differentiate pages that have superglue enabled or not | [types/index.ts:495](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L495) |
| <a id="pagekey-3"></a> `pageKey`     | `string` | The page key in [SuperglueState](#supergluestate) to restore from                        | [types/index.ts:497](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L497) |
| <a id="posx"></a> `posX`             | `number` | The scroll position X of the page                                                        | [types/index.ts:499](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L499) |
| <a id="posy"></a> `posY`             | `number` | The scroll position Y of the page                                                        | [types/index.ts:501](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L501) |

---

<a id="basicrequestinit"></a>

### BasicRequestInit

Defined in: [types/index.ts:532](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L532)

A variation of RequestInit except the headers must be a regular object

#### Extends

- `RequestInit`

#### Properties

| Property                        | Type                                | Description                                                                                   | Overrides             | Defined in                                                                                                                                    |
| ------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="headers"></a> `headers?` | \{\[`key`: `string`\]: `string`; \} | A Headers object, an object literal, or an array of two-item arrays to set request's headers. | `RequestInit.headers` | [types/index.ts:533](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L533) |

---

<a id="copyto"></a>

### CopyTo()

Defined in: [types/index.ts:582](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L582)

Superglue comes with a Navigation component that provides a context with
access to [Visit](types.requests.md#visit), [Remote](types.requests.md#remote) and other useful tooling.

You can also use this to build your own `<Link>` component.

> **CopyTo**(`path`: `string`): `void`

Defined in: [types/index.ts:582](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L582)

Superglue comes with a Navigation component that provides a context with
access to [Visit](types.requests.md#visit), [Remote](types.requests.md#remote) and other useful tooling.

You can also use this to build your own `<Link>` component.

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `path`    | `string` |

#### Returns

`void`

---

<a id="navigationproviderprops"></a>

### NavigationProviderProps

Defined in: [types/index.ts:600](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L600)

Props for the Superglue navigation provider. Installs the history listener,
scroll restoration, and provides [NavigationContextProps](#navigationcontextprops) to its
descendants. Wraps `children` so a layout (or any other tree) can sit
between the provider and the rendered page.

#### Properties

| Property                          | Type                                                       | Defined in                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="history"></a> `history`    | `History`                                                  | [types/index.ts:601](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L601) |
| <a id="visit-1"></a> `visit`      | [`ApplicationVisit`](types.requests.md#applicationvisit)   | [types/index.ts:602](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L602) |
| <a id="remote-1"></a> `remote`    | [`ApplicationRemote`](types.requests.md#applicationremote) | [types/index.ts:603](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L603) |
| <a id="children"></a> `children?` | `ReactNode`                                                | [types/index.ts:604](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L604) |

---

<a id="navigationoutletprops"></a>

### NavigationOutletProps

Defined in: [types/index.ts:612](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L612)

Props for the Superglue navigation outlet. Reads the current page from the
Superglue store and renders the matching component from `mapping`.

#### Properties

| Property                       | Type                                                                             | Defined in                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="mapping"></a> `mapping` | `Record`\<[`ComponentIdentifier`](#componentidentifier), `React.ComponentType`\> | [types/index.ts:613](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L613) |

---

<a id="buildstore"></a>

### BuildStore()

Defined in: [types/index.ts:624](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L624)

Provide this callback to [CreateAppArgs](#createappargs) returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

> **BuildStore**(`initialState`: [`RootState`](#rootstate), `reducer`: \{ `superglue`: (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate); `pages`: (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages); `fragments`: (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments); `flash`: (`state`: [`FlashState`](#flashstate), `action`: `Action`) => [`FlashState`](#flashstate); \}): [`SuperglueStore`](#supergluestore)

Defined in: [types/index.ts:625](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L625)

Provide this callback to [CreateAppArgs](#createappargs) returning a Redux store for
Superglue to use. This would be setup and generated for you in `store.js`. We
recommend using using Redux toolkit's `configureStore` to build the store.

#### Parameters

| Parameter           | Type                                                                                                                                                                                                                                                                                                                                                                                                                                          | Description                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `initialState`      | [`RootState`](#rootstate)                                                                                                                                                                                                                                                                                                                                                                                                                     | A preconfigured intial state to pass to your store. |
| `reducer`           | \{ `superglue`: (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate); `pages`: (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages); `fragments`: (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments); `flash`: (`state`: [`FlashState`](#flashstate), `action`: `Action`) => [`FlashState`](#flashstate); \} | A preconfigured reducer                             |
| `reducer.superglue` | (`state`: [`SuperglueState`](#supergluestate), `action`: `Action`) => [`SuperglueState`](#supergluestate)                                                                                                                                                                                                                                                                                                                                     | -                                                   |
| `reducer.pages`     | (`state`: [`AllPages`](#allpages), `action`: `Action`) => [`AllPages`](#allpages)                                                                                                                                                                                                                                                                                                                                                             | -                                                   |
| `reducer.fragments` | (`state`: [`AllFragments`](#allfragments), `action`: `Action`) => [`AllFragments`](#allfragments)                                                                                                                                                                                                                                                                                                                                             | -                                                   |
| `reducer.flash`     | (`state`: [`FlashState`](#flashstate), `action`: `Action`) => [`FlashState`](#flashstate)                                                                                                                                                                                                                                                                                                                                                     | -                                                   |

#### Returns

[`SuperglueStore`](#supergluestore)

---

<a id="buildvisitandremote"></a>

### BuildVisitAndRemote()

Defined in: [types/index.ts:639](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L639)

Provide this callback to [CreateAppArgs](#createappargs). Receives a context object
containing `visit` and `remote` callables. Customize this function to add
progress bars, error reporting (Sentry), or app-specific error-page
redirects.

Be sure to returns a wrapped `{ visit, remote }` pair that Superglue and UJS
use for navigation.

> **BuildVisitAndRemote**(`context`: [`BuildVisitAndRemoteContext`](#buildvisitandremotecontext)): \{ `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); \}

Defined in: [types/index.ts:640](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L640)

#### Parameters

| Parameter | Type                                                        |
| --------- | ----------------------------------------------------------- |
| `context` | [`BuildVisitAndRemoteContext`](#buildvisitandremotecontext) |

#### Returns

\{ `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); \}

A wrapped [ApplicationVisit](types.requests.md#applicationvisit) / [ApplicationRemote](types.requests.md#applicationremote) pair.

| Name     | Type                                                       | Defined in                                                                                                                                    |
| -------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `visit`  | [`ApplicationVisit`](types.requests.md#applicationvisit)   | [types/index.ts:641](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L641) |
| `remote` | [`ApplicationRemote`](types.requests.md#applicationremote) | [types/index.ts:642](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L642) |

---

<a id="buildvisitandremotecontext"></a>

### BuildVisitAndRemoteContext

Defined in: [types/index.ts:652](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L652)

The context passed to [BuildVisitAndRemote](#buildvisitandremote)

The visit and remote functions in this context will resolve to a VisitResult
or ErrorResult.

#### Properties

| Property                               | Type                                                                                                                                                        | Description                                                          | Defined in                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="navigateto-2"></a> `navigateTo` | [`NavigateTo`](#navigateto)                                                                                                                                 | Navigates after a successful visit. Bound to the createApp instance. | [types/index.ts:654](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L654) |
| <a id="visit-2"></a> `visit`           | (`path`: `string`, `options?`: [`VisitProps`](types.requests.md#visitprops)) => `Promise`\<[`VisitResult`](#visitresult) \| [`ErrorResult`](#errorresult)\> | Pre-bound visit. Returns a discriminated result.                     | [types/index.ts:656](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L656) |
| <a id="remote-2"></a> `remote`         | (`path`: `string`, `options?`: [`RemoteProps`](types.requests.md#remoteprops)) => `Promise`\<[`Result`](#result) \| [`ErrorResult`](#errorresult)\>         | Pre-bound remote. Returns a discriminated result.                    | [types/index.ts:661](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L661) |

---

<a id="createappargs"></a>

### CreateAppArgs

Defined in: [types/index.ts:669](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L669)

Arguments for `createApp`. Combines per-request bootstrap state
(`initialPage`, `baseUrl`, `path`) with app-wide config (`mapping`,
`history`, `cable`, `buildVisitAndRemote`).

#### Properties

| Property                                                 | Type                                          | Description                                                                                                                                                                                                                                                                            | Defined in                                                                                                                                    |
| -------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="initialpage"></a> `initialPage`                   | [`SaveResponse`](#saveresponse)               | The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb template, e.g., application/superglue.html.erb                                                                                                                                                                          | [types/index.ts:674](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L674) |
| <a id="baseurl"></a> `baseUrl`                           | `string`                                      | The base url prefixed to all calls made by `visit` and `remote`.                                                                                                                                                                                                                       | [types/index.ts:678](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L678) |
| <a id="path-3"></a> `path`                               | `string`                                      | The path of the current page. It should equal to the `location.pathname` + `location.search` + `location.hash`                                                                                                                                                                         | [types/index.ts:683](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L683) |
| <a id="mapping-1"></a> `mapping`                         | `Record`\<`string`, `React.ComponentType`\>   | A mapping between page identifiers and the React components that render them. The `Outlet` returned from `createApp` reads this mapping when rendering the current page.                                                                                                               | [types/index.ts:689](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L689) |
| <a id="buildvisitandremote-2"></a> `buildVisitAndRemote` | [`BuildVisitAndRemote`](#buildvisitandremote) | A factory function that returns a `visit` and `remote` function. All of Superglue and UJS will use these functions. You should customize the function, for example, to add a progress bar.                                                                                             | [types/index.ts:695](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L695) |
| <a id="history-1"></a> `history?`                        | `History`                                     | An optional history object https://github.com/remix-run/history. If none is provided Superglue will create one for you.                                                                                                                                                                | [types/index.ts:700](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L700) |
| <a id="cable"></a> `cable?`                              | [`Consumer`](index.md#consumer)               | An optional ActionCable-compatible Consumer used by `useStreamSource` for real-time streaming. Construct this in your application code with `createConsumer` from `@rails/actioncable` or `createCable` from `@anycable/web` and pass it in. If omitted, `useStreamSource` is a no-op. | [types/index.ts:708](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L708) |
| <a id="devtools"></a> `devTools?`                        | `boolean`                                     | Enable Redux DevTools integration. Defaults to `false`.                                                                                                                                                                                                                                | [types/index.ts:712](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L712) |

---

<a id="createappresult"></a>

### CreateAppResult

Defined in: [types/index.ts:728](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L728)

The result of calling `createApp`: a `Provider` component that owns
the Superglue React tree, an `Outlet` component that renders the current
page from the configured `mapping`, and a `ujs` object containing UJS
click/submit handlers the caller can attach wherever they choose.

#### Properties

| Property                         | Type                                                 | Defined in                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="provider"></a> `Provider` | `ComponentType`\<[`ProviderProps`](#providerprops)\> | [types/index.ts:729](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L729) |
| <a id="outlet"></a> `Outlet`     | `ComponentType`                                      | [types/index.ts:730](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L730) |
| <a id="ujs"></a> `ujs`           | [`Handlers`](#handlers)                              | [types/index.ts:731](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L731) |

## Type Aliases

<a id="validateoption"></a>

### ValidateOption

> **ValidateOption** = \{ `validate?`: (`data`: `unknown`) => `void`; \}

Defined in: [types/index.ts:28](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L28)

Options for runtime type validation in `useContent` and `useFragment`.
The `validate` callback is typically injected at build time by a
Superglue unplugin, but can also be passed manually with any
validation library. The callback should report errors via
`console.error` or by throwing.

#### Properties

<a id="validate"></a>

##### validate()?

> `optional` **validate**: (`data`: `unknown`) => `void`

Defined in: [types/index.ts:29](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L29)

###### Parameters

| Parameter | Type      |
| --------- | --------- |
| `data`    | `unknown` |

###### Returns

`void`

---

<a id="pagekey"></a>

### PageKey

> **PageKey** = `string`

Defined in: [types/index.ts:38](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L38)

A PageKey is a combination of a parsed URL's pathname + query string. No hash.

-

#### Example

```ts
/posts?foobar=123
```

---

<a id="restorestrategy"></a>

### RestoreStrategy

> **RestoreStrategy** = `"fromCacheOnly"` \| `"revisitOnly"` \| `"fromCacheAndRevisitInBackground"`

Defined in: [types/index.ts:54](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L54)

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

---

<a id="navigationaction"></a>

### NavigationAction

> **NavigationAction** = `"push"` \| `"replace"` \| `"none"`

Defined in: [types/index.ts:63](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L63)

A NavigationAction is used to tell Superglue to history.push, history.replace
or do nothing.

---

<a id="componentidentifier"></a>

### ComponentIdentifier

> **ComponentIdentifier** = `string`

Defined in: [types/index.ts:69](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L69)

An identifier that Superglue will uses to determine which page component to render
with your page response.

---

<a id="keypath"></a>

### Keypath

> **Keypath** = `string`

Defined in: [types/index.ts:93](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L93)

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

---

<a id="jsonprimitive"></a>

### JSONPrimitive

> **JSONPrimitive** = `string` \| `number` \| `boolean` \| `null` \| `undefined`

Defined in: [types/index.ts:100](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L100)

A JSON Primitive value

---

<a id="jsonobject"></a>

### JSONObject

> **JSONObject** = \{\[`key`: `string`\]: [`JSONValue`](#jsonvalue); \}

Defined in: [types/index.ts:105](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L105)

A JSON Object

#### Index Signature

\[`key`: `string`\]: [`JSONValue`](#jsonvalue)

---

<a id="jsonmappable"></a>

### JSONMappable

> **JSONMappable** = [`JSONValue`](#jsonvalue)[] \| [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:112](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L112)

A JSON Object or an array of values

---

<a id="jsonkeyable"></a>

### JSONKeyable

> **JSONKeyable** = [`JSONObject`](#jsonobject)[] \| [`JSONObject`](#jsonobject)

Defined in: [types/index.ts:117](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L117)

A array of JSON key value objects or a JSON Object

---

<a id="jsonvalue"></a>

### JSONValue

> **JSONValue** = [`JSONPrimitive`](#jsonprimitive) \| [`JSONMappable`](#jsonmappable)

Defined in: [types/index.ts:122](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L122)

A primitive or a mappable object

---

<a id="flashstate"></a>

### FlashState

> **FlashState** = `Record`\<`string`, [`JSONValue`](#jsonvalue)\>

Defined in: [types/index.ts:124](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L124)

---

<a id="fragment"></a>

### Fragment\<T, Present\>

> **Fragment**\<`T`, `Present`\> = `Present` _extends_ `true` ? `T` & \{ `__id`: `string`; \} : `T` & \{ `__id`: `string`; \} \| `undefined`

Defined in: [types/index.ts:182](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L182)

A Fragment is a rendered Rails partial with an identity. The use
of this type is optional, but it makes usage with unproxy and
useUpdateFragment type friendly.

In general, Fragments enable normalized state management where Rails partials
become referenceable entities on the client. The server renders partials as
fragments with unique IDs, then Superglue normalizes them into a separate
fragments store while replacing the original data with fragment references.

#### Type Parameters

| Type Parameter | Default type | Description                                                                                                                                                                                                                                                        |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `T`            | -            | The shape of the fragment's data.                                                                                                                                                                                                                                  |
| `Present`      | `false`      | Indicates whether the fragment is guaranteed to be present. It's possible that a fragment was deleted from the store due to client side mutations. If you are sure that the fragment will ALWAYS be present, set this to `true`, otherwise its `false` by default. |

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
  cart: Fragment<{ items: Item[]; totalCost: number }, true>
  user?: Fragment<{ name: string; email: string }> // Optional fragment
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

---

<a id="unproxy"></a>

### Unproxy\<T\>

> **Unproxy**\<`T`\> = `T` _extends_ [`Fragment`](#fragment)\<infer U, infer P\> ? `P` _extends_ `boolean` ? [`FragmentRef`](#fragmentref)\<`U`, `P`\> : [`FragmentRef`](#fragmentref)\<`U`, `false`\> : `T` _extends_ infer U[] ? [`Unproxy`](#unproxy)\<`U`\>[] : `T` _extends_ `object` ? `{ [K in keyof T]: Unproxy<T[K]> }` : `T`

Defined in: [types/index.ts:190](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L190)

Utility type for unproxy that converts Fragment types to fragment references.
This recursively processes objects and arrays to convert Fragment<T> to { \_\_id: string }.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

---

<a id="saveresponse"></a>

### SaveResponse\<T\>

> **SaveResponse**\<`T`\> = \{ `data`: `T`; `componentIdentifier`: [`ComponentIdentifier`](#componentidentifier); `assets`: `string`[]; `csrfToken?`: `string`; `fragments`: [`FragmentPath`](#fragmentpath)[]; `defers`: [`Defer`](#defer)[]; `flash`: [`FlashState`](#flashstate); `action`: `"savePage"`; `renderedAt`: `number`; `restoreStrategy`: [`RestoreStrategy`](#restorestrategy); \}

Defined in: [types/index.ts:240](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L240)

The SaveResponse response is responsible for persisting a full page
visit in Superglue.

#### Type Parameters

| Type Parameter | Default type                    |
| -------------- | ------------------------------- |
| `T`            | [`JSONMappable`](#jsonmappable) |

#### Properties

<a id="data"></a>

##### data

> **data**: `T`

Defined in: [types/index.ts:241](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L241)

<a id="componentidentifier-1"></a>

##### componentIdentifier

> **componentIdentifier**: [`ComponentIdentifier`](#componentidentifier)

Defined in: [types/index.ts:242](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L242)

<a id="assets"></a>

##### assets

> **assets**: `string`[]

Defined in: [types/index.ts:243](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L243)

<a id="csrftoken"></a>

##### csrfToken?

> `optional` **csrfToken**: `string`

Defined in: [types/index.ts:244](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L244)

<a id="fragments"></a>

##### fragments

> **fragments**: [`FragmentPath`](#fragmentpath)[]

Defined in: [types/index.ts:245](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L245)

<a id="defers"></a>

##### defers

> **defers**: [`Defer`](#defer)[]

Defined in: [types/index.ts:246](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L246)

<a id="flash"></a>

##### flash

> **flash**: [`FlashState`](#flashstate)

Defined in: [types/index.ts:247](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L247)

<a id="action"></a>

##### action

> **action**: `"savePage"`

Defined in: [types/index.ts:248](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L248)

<a id="renderedat"></a>

##### renderedAt

> **renderedAt**: `number`

Defined in: [types/index.ts:250](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L250)

<a id="restorestrategy-1"></a>

##### restoreStrategy

> **restoreStrategy**: [`RestoreStrategy`](#restorestrategy)

Defined in: [types/index.ts:251](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L251)

---

<a id="page"></a>

### Page\<T\>

> **Page**\<`T`\> = [`SaveResponse`](#saveresponse)\<`T`\> & \{ `savedAt`: `number`; \}

Defined in: [types/index.ts:257](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L257)

A Page is a SaveResponse that's been saved to the store

#### Type declaration

| Name      | Type     | Defined in                                                                                                                                    |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `savedAt` | `number` | [types/index.ts:258](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L258) |

#### Type Parameters

| Type Parameter | Default type                    |
| -------------- | ------------------------------- |
| `T`            | [`JSONMappable`](#jsonmappable) |

---

<a id="streammessage"></a>

### StreamMessage

> **StreamMessage** = \{ `data`: [`JSONMappable`](#jsonmappable); `fragmentIds`: `string`[]; `handler`: `"append"` \| `"prepend"` \| `"update"`; `options`: `Record`\<`string`, `string`\>; \}

Defined in: [types/index.ts:284](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L284)

#### Properties

<a id="data-2"></a>

##### data

> **data**: [`JSONMappable`](#jsonmappable)

Defined in: [types/index.ts:285](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L285)

<a id="fragmentids"></a>

##### fragmentIds

> **fragmentIds**: `string`[]

Defined in: [types/index.ts:286](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L286)

<a id="handler"></a>

##### handler

> **handler**: `"append"` \| `"prepend"` \| `"update"`

Defined in: [types/index.ts:287](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L287)

<a id="options"></a>

##### options

> **options**: `Record`\<`string`, `string`\>

Defined in: [types/index.ts:288](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L288)

---

<a id="streamresponse"></a>

### StreamResponse

> **StreamResponse** = \{ `data`: [`StreamMessage`](#streammessage)[]; `fragments`: [`FragmentPath`](#fragmentpath)[]; `assets`: `string`[]; `csrfToken?`: `string`; `action`: `"handleStreamResponse"`; `renderedAt`: `number`; `flash`: [`FlashState`](#flashstate); \}

Defined in: [types/index.ts:291](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L291)

#### Properties

<a id="data-3"></a>

##### data

> **data**: [`StreamMessage`](#streammessage)[]

Defined in: [types/index.ts:292](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L292)

<a id="fragments-2"></a>

##### fragments

> **fragments**: [`FragmentPath`](#fragmentpath)[]

Defined in: [types/index.ts:293](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L293)

<a id="assets-2"></a>

##### assets

> **assets**: `string`[]

Defined in: [types/index.ts:294](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L294)

<a id="csrftoken-2"></a>

##### csrfToken?

> `optional` **csrfToken**: `string`

Defined in: [types/index.ts:295](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L295)

<a id="action-2"></a>

##### action

> **action**: `"handleStreamResponse"`

Defined in: [types/index.ts:296](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L296)

<a id="renderedat-2"></a>

##### renderedAt

> **renderedAt**: `number`

Defined in: [types/index.ts:297](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L297)

<a id="flash-2"></a>

##### flash

> **flash**: [`FlashState`](#flashstate)

Defined in: [types/index.ts:298](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L298)

---

<a id="pageresponse"></a>

### PageResponse

> **PageResponse** = [`GraftResponse`](#graftresponse) \| [`SaveResponse`](#saveresponse) \| [`StreamResponse`](#streamresponse)

Defined in: [types/index.ts:306](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L306)

A PageResponse can be either a [GraftResponse](#graftresponse), [SaveResponse](#saveresponse).
or a [StreamResponse](#streamresponse) Its meant to be implemented by the server and if
you are using superglue_rails, the generators will handle all cases.

---

<a id="allpages"></a>

### AllPages\<T\>

> **AllPages**\<`T`\> = `Record`\<[`PageKey`](#pagekey), [`Page`](#page)\<`T`\>\>

Defined in: [types/index.ts:342](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L342)

The store where all page responses are stored indexed by PageKey. You are encouraged
to mutate the Pages in this store.

#### Type Parameters

| Type Parameter | Default type                    |
| -------------- | ------------------------------- |
| `T`            | [`JSONMappable`](#jsonmappable) |

---

<a id="allfragments"></a>

### AllFragments

> **AllFragments** = `Record`\<`string`, [`JSONMappable`](#jsonmappable)\>

Defined in: [types/index.ts:348](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L348)

The store where all page responses are stored indexed by PageKey. You are encouraged
to mutate the Pages in this store.

---

<a id="visitcreator"></a>

### VisitCreator()

> **VisitCreator** = (`input`: `string` \| [`PageKey`](#pagekey), `options?`: [`VisitProps`](types.requests.md#visitprops)) => [`VisitMetaThunk`](#visitmetathunk)

Defined in: [types/index.ts:431](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L431)

VisitCreator is a Redux action creator that returns a thunk. Use this to build
the [Visit](types.requests.md#visit) function. Typically it's already generated in `application_visit.js`

#### Parameters

| Parameter  | Type                                         |
| ---------- | -------------------------------------------- |
| `input`    | `string` \| [`PageKey`](#pagekey)            |
| `options?` | [`VisitProps`](types.requests.md#visitprops) |

#### Returns

[`VisitMetaThunk`](#visitmetathunk)

---

<a id="remotecreator"></a>

### RemoteCreator()

> **RemoteCreator** = (`input`: `string` \| [`PageKey`](#pagekey), `options?`: [`RemoteProps`](types.requests.md#remoteprops)) => [`MetaThunk`](#metathunk)

Defined in: [types/index.ts:440](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L440)

RemoteCreator is a Redux action creator that returns a thunk. Use this to build
the [Remote](types.requests.md#remote) function. Typically it's already generated in `application_visit.js`

#### Parameters

| Parameter  | Type                                           |
| ---------- | ---------------------------------------------- |
| `input`    | `string` \| [`PageKey`](#pagekey)              |
| `options?` | [`RemoteProps`](types.requests.md#remoteprops) |

#### Returns

[`MetaThunk`](#metathunk)

---

<a id="dispatch"></a>

### Dispatch

> **Dispatch** = `ThunkDispatch`\<[`RootState`](#rootstate), `ExtraArgument`, `Action`\>

Defined in: [types/index.ts:451](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L451)

---

<a id="supergluestore"></a>

### SuperglueStore

> **SuperglueStore** = `EnhancedStore`\<[`RootState`](#rootstate), `Action`, `Tuple`\<\[`StoreEnhancer`\<\{ `dispatch`: [`Dispatch`](#dispatch); \}\>, `StoreEnhancer`\]\>\>

Defined in: [types/index.ts:458](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L458)

A Store created with Redux Toolkit's `configureStore` setup with reducers
from Superglue. If you are using superglue_rails this would have been
generated for you in `store.js` and setup correctly in application.js

---

<a id="ujshandlers"></a>

### UJSHandlers()

> **UJSHandlers** = (`{
  ujsAttributePrefix,
  visit,
  remote,
  store,
}`: \{ `ujsAttributePrefix`: `string`; `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); `store`: [`SuperglueStore`](#supergluestore); \}) => [`Handlers`](#handlers)

Defined in: [types/index.ts:476](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L476)

#### Parameters

| Parameter                                                          | Type                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ ujsAttributePrefix, visit, remote, store, }`                    | \{ `ujsAttributePrefix`: `string`; `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); `store`: [`SuperglueStore`](#supergluestore); \} |
| `{ ujsAttributePrefix, visit, remote, store, }.ujsAttributePrefix` | `string`                                                                                                                                                                                                                     |
| `{ ujsAttributePrefix, visit, remote, store, }.visit`              | [`ApplicationVisit`](types.requests.md#applicationvisit)                                                                                                                                                                     |
| `{ ujsAttributePrefix, visit, remote, store, }.remote`             | [`ApplicationRemote`](types.requests.md#applicationremote)                                                                                                                                                                   |
| `{ ujsAttributePrefix, visit, remote, store, }.store`              | [`SuperglueStore`](#supergluestore)                                                                                                                                                                                          |

#### Returns

[`Handlers`](#handlers)

---

<a id="saveandprocesspagethunk"></a>

### SaveAndProcessPageThunk

> **SaveAndProcessPageThunk** = `ThunkAction`\<`Promise`\<`void`\>, [`RootState`](#rootstate), `ExtraArgument`, `Action`\>

Defined in: [types/index.ts:504](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L504)

---

<a id="metathunk"></a>

### MetaThunk

> **MetaThunk** = `ThunkAction`\<`Promise`\<[`Result`](#result) \| [`ErrorResult`](#errorresult)\>, [`RootState`](#rootstate), `ExtraArgument`, `Action`\>

Defined in: [types/index.ts:511](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L511)

---

<a id="visitmetathunk"></a>

### VisitMetaThunk

> **VisitMetaThunk** = `ThunkAction`\<`Promise`\<[`VisitResult`](#visitresult) \| [`ErrorResult`](#errorresult)\>, [`RootState`](#rootstate), `ExtraArgument`, `Action`\>

Defined in: [types/index.ts:517](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L517)

---

<a id="defermentthunk"></a>

### DefermentThunk

> **DefermentThunk** = `ThunkAction`\<`Promise`\<`void`[]\>, [`RootState`](#rootstate), `ExtraArgument`, `Action`\>

Defined in: [types/index.ts:524](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L524)

---

<a id="navigateto"></a>

### NavigateTo()

> **NavigateTo** = (`path`: [`Keypath`](#keypath), `options?`: \{ `action?`: [`NavigationAction`](#navigationaction); `updateContent?`: (`draft`: [`JSONMappable`](#jsonmappable)) => `void`; \}) => `boolean`

Defined in: [types/index.ts:562](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L562)

Passed to every page component and also available as part of a NavigationContext:

```js
import { NavigationContext } from '@thoughtbot/superglue'

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

| Parameter                | Type                                                                                                                              | Description                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `path`                   | [`Keypath`](#keypath)                                                                                                             |                                                           |
| `options?`               | \{ `action?`: [`NavigationAction`](#navigationaction); `updateContent?`: (`draft`: [`JSONMappable`](#jsonmappable)) => `void`; \} | -                                                         |
| `options.action?`        | [`NavigationAction`](#navigationaction)                                                                                           | when `none`, `navigateTo` will immediately return `false` |
| `options.updateContent?` | (`draft`: [`JSONMappable`](#jsonmappable)) => `void`                                                                              | -                                                         |

#### Returns

`boolean`

`true` if the navigation was a success, `false` if the page was not found in the
store.

---

<a id="navigationcontextprops"></a>

### NavigationContextProps

> **NavigationContextProps** = \{ `navigateTo`: [`NavigateTo`](#navigateto); `copyTo`: [`CopyTo`](#copyto); `visit`: [`ApplicationVisit`](types.requests.md#applicationvisit); `remote`: [`ApplicationRemote`](types.requests.md#applicationremote); `pageKey`: [`SuperglueState`](#supergluestate)\[`"currentPageKey"`\]; `search`: [`SuperglueState`](#supergluestate)\[`"search"`\]; \}

Defined in: [types/index.ts:584](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L584)

#### Properties

<a id="navigateto-1"></a>

##### navigateTo

> **navigateTo**: [`NavigateTo`](#navigateto)

Defined in: [types/index.ts:585](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L585)

<a id="copyto-2"></a>

##### copyTo

> **copyTo**: [`CopyTo`](#copyto)

Defined in: [types/index.ts:586](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L586)

<a id="visit"></a>

##### visit

> **visit**: [`ApplicationVisit`](types.requests.md#applicationvisit)

Defined in: [types/index.ts:587](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L587)

<a id="remote"></a>

##### remote

> **remote**: [`ApplicationRemote`](types.requests.md#applicationremote)

Defined in: [types/index.ts:588](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L588)

<a id="pagekey-4"></a>

##### pageKey

> **pageKey**: [`SuperglueState`](#supergluestate)\[`"currentPageKey"`\]

Defined in: [types/index.ts:589](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L589)

<a id="search-1"></a>

##### search

> **search**: [`SuperglueState`](#supergluestate)\[`"search"`\]

Defined in: [types/index.ts:590](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L590)

---

<a id="providerprops"></a>

### ProviderProps

> **ProviderProps** = \{ `children?`: `React.ReactNode`; \}

Defined in: [types/index.ts:718](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L718)

Props for the `Provider` component returned from `createApp`.

#### Properties

<a id="children-1"></a>

##### children?

> `optional` **children**: `React.ReactNode`

Defined in: [types/index.ts:719](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/index.ts#L719)

## References

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

<a id="channelnamewithparams"></a>

### ChannelNameWithParams

Re-exports [ChannelNameWithParams](index.md#channelnamewithparams)

---

<a id="channelmixin"></a>

### ChannelMixin

Re-exports [ChannelMixin](index.md#channelmixin)

---

<a id="subscription"></a>

### Subscription

Re-exports [Subscription](index.md#subscription)

---

<a id="subscriptions"></a>

### Subscriptions

Re-exports [Subscriptions](index.md#subscriptions)

---

<a id="consumer"></a>

### Consumer

Re-exports [Consumer](index.md#consumer)

---

<a id="visit-3"></a>

### Visit

Re-exports [Visit](types.requests.md#visit)

---

<a id="visitprops"></a>

### VisitProps

Re-exports [VisitProps](types.requests.md#visitprops)

---

<a id="remote-3"></a>

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
