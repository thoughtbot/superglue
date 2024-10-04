## Classes

<a id="applicationbase" name="applicationbase"></a>

### `abstract` ApplicationBase

The entry point to your superglue application. You should create a class
(Application) that inherit from the ApplicationBase component and override
the [buildStore](index.md#buildstore), [mapping](index.md#mapping), and [visitAndRemote](index.md#visitandremote) methods.

This would be setup for you when installing Superglue at `application.js`.

#### Extends

- `Component`\<`ApplicationProps`\>

#### Constructors

<a id="constructors" name="constructors"></a>

##### new ApplicationBase()

> **new ApplicationBase**(`props`: `ApplicationProps`): [`ApplicationBase`](index.md#applicationbase)

The constructor of the `ApplicationBase` class.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `ApplicationProps` |  |

###### Returns

[`ApplicationBase`](index.md#applicationbase)

###### Overrides

`React.Component<ApplicationProps>.constructor`

###### Defined in

[lib/index.tsx:151](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L151)

#### Methods

<a id="visitandremote" name="visitandremote"></a>

##### visitAndRemote()

> `abstract` **visitAndRemote**(`navigatorRef`: `RefObject`\<[`default`](components.Nav.md#default)\>, `store`: [`SuperglueStore`](types.md#supergluestore)): \{`visit`: [`Visit`](types.requests.md#visit);`remote`: [`Remote`](types.requests.md#remote); \}

Override this method to return a visit and remote function. These functions
will be used by Superglue to power its UJS attributes and passed to your
page components. You may customize this functionality to your liking, e.g,
adding a progress bar.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `navigatorRef` | `RefObject`\<[`default`](components.Nav.md#default)\> |  |
| `store` | [`SuperglueStore`](types.md#supergluestore) |  |

###### Returns

\{`visit`: [`Visit`](types.requests.md#visit);`remote`: [`Remote`](types.requests.md#remote); \}

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `visit` | [`Visit`](types.requests.md#visit) | [lib/index.tsx:215](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L215) |
| `remote` | [`Remote`](types.requests.md#remote) | [lib/index.tsx:215](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L215) |

###### Defined in

[lib/index.tsx:211](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L211)

<a id="componentdidmount" name="componentdidmount"></a>

##### componentDidMount()

> **componentDidMount**(): `void`

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

###### Returns

`void`

###### Overrides

`React.Component.componentDidMount`

###### Defined in

[lib/index.tsx:217](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L217)

<a id="componentwillunmount" name="componentwillunmount"></a>

##### componentWillUnmount()

> **componentWillUnmount**(): `void`

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

###### Returns

`void`

###### Overrides

`React.Component.componentWillUnmount`

###### Defined in

[lib/index.tsx:232](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L232)

<a id="buildstore" name="buildstore"></a>

##### buildStore()

> `abstract` **buildStore**(`initialState`: \{`[key: string]`: [`JSONValue`](types.md#jsonvalue); `pages`: [`AllPages`](types.md#allpages); \}, `reducer`: \{`superglue`: `superglueReducer`;`pages`: `pageReducer`; \}): [`SuperglueStore`](types.md#supergluestore)

Override this method and return a Redux store for Superglue to use. This
would be setup and generated for you in `store.js`. We recommend using
using Redux toolkit's `configureStore` to build the store.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `initialState` | `object` | A preconfigured intial state to pass to your store. |
| `initialState.pages` | [`AllPages`](types.md#allpages) | - |
| `reducer` | `object` | A preconfigured reducer |
| `reducer.superglue` | (`state`: `Partial`\<[`SuperglueState`](types.md#supergluestate)\>, `action`: `UnknownAction` \| [`SuperglueReducerAction`](types.md#supergluereduceraction)) => `Partial`\<[`SuperglueState`](types.md#supergluestate)\> | - |
| `reducer.pages` | (`state`: [`AllPages`](types.md#allpages), `action`: `UnknownAction` \| [`PageReducerAction`](types.md#pagereduceraction)) => [`AllPages`](types.md#allpages) | - |

###### Returns

[`SuperglueStore`](types.md#supergluestore)

###### Defined in

[lib/index.tsx:248](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L248)

<a id="createhistory" name="createhistory"></a>

##### createHistory()

> **createHistory**(): `BrowserHistory`

###### Returns

`BrowserHistory`

###### Defined in

[lib/index.tsx:253](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L253)

<a id="mapping" name="mapping"></a>

##### mapping()

> `abstract` **mapping**(): `Record`\<`string`, `ComponentType`\<\{\}\>\>

Override this method and return a mapping between a componentIdentifier and
a PageComponent. This will be passed to Superglue to determine which Page component
to render with which payload.

###### Returns

`Record`\<`string`, `ComponentType`\<\{\}\>\>

###### Defined in

[lib/index.tsx:270](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L270)

<a id="render" name="render"></a>

##### render()

> **render**(): `Element`

###### Returns

`Element`

###### Overrides

`React.Component.render`

###### Defined in

[lib/index.tsx:272](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/index.tsx#L272)

## Variables

<a id="before_fetch" name="before_fetch"></a>

### BEFORE\_FETCH

> `const` **BEFORE\_FETCH**: `"@@superglue/BEFORE_FETCH"` = `'@@superglue/BEFORE_FETCH'`

#### Defined in

[lib/actions.ts:1](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L1)

***

<a id="before_visit" name="before_visit"></a>

### BEFORE\_VISIT

> `const` **BEFORE\_VISIT**: `"@@superglue/BEFORE_VISIT"` = `'@@superglue/BEFORE_VISIT'`

#### Defined in

[lib/actions.ts:2](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L2)

***

<a id="before_remote" name="before_remote"></a>

### BEFORE\_REMOTE

> `const` **BEFORE\_REMOTE**: `"@@superglue/BEFORE_REMOTE"` = `'@@superglue/BEFORE_REMOTE'`

#### Defined in

[lib/actions.ts:3](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L3)

***

<a id="save_response" name="save_response"></a>

### SAVE\_RESPONSE

> `const` **SAVE\_RESPONSE**: `"@@superglue/SAVE_RESPONSE"` = `'@@superglue/SAVE_RESPONSE'`

#### Defined in

[lib/actions.ts:5](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L5)

***

<a id="grafting_error" name="grafting_error"></a>

### GRAFTING\_ERROR

> `const` **GRAFTING\_ERROR**: `"@@superglue/GRAFTING_ERROR"` = `'@@superglue/GRAFTING_ERROR'`

#### Defined in

[lib/actions.ts:9](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L9)

***

<a id="grafting_success" name="grafting_success"></a>

### GRAFTING\_SUCCESS

> `const` **GRAFTING\_SUCCESS**: `"@@superglue/GRAFTING_SUCCESS"` = `'@@superglue/GRAFTING_SUCCESS'`

#### Defined in

[lib/actions.ts:10](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L10)

***

<a id="history_change" name="history_change"></a>

### HISTORY\_CHANGE

> `const` **HISTORY\_CHANGE**: `"@@superglue/HISTORY_CHANGE"` = `'@@superglue/HISTORY_CHANGE'`

#### Defined in

[lib/actions.ts:12](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L12)

***

<a id="remove_page" name="remove_page"></a>

### REMOVE\_PAGE

> `const` **REMOVE\_PAGE**: `"@@superglue/REMOVE_PAGE"` = `'@@superglue/REMOVE_PAGE'`

#### Defined in

[lib/actions.ts:14](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L14)

***

<a id="copy_page" name="copy_page"></a>

### COPY\_PAGE

> `const` **COPY\_PAGE**: `"@@superglue/COPY_PAGE"` = `'@@superglue/COPY_PAGE'`

#### Defined in

[lib/actions.ts:15](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L15)

***

<a id="update_fragments" name="update_fragments"></a>

### UPDATE\_FRAGMENTS

> `const` **UPDATE\_FRAGMENTS**: `"@@superglue/UPDATE_FRAGMENTS"` = `'@@superglue/UPDATE_FRAGMENTS'`

#### Defined in

[lib/actions.ts:16](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/actions.ts#L16)

## Functions

<a id="fragmentmiddleware" name="fragmentmiddleware"></a>

### fragmentMiddleware()

> **fragmentMiddleware**(`api`: `MiddlewareAPI`\<[`Dispatch`](types.md#dispatch), [`RootState`](types.md#rootstate)\>): (`next`: (`action`: `unknown`) => `unknown`) => (`action`: `unknown`) => `unknown`

**`Experimental`**

A middleware that will update all Fragment across the AllPages slice, if a fragment on any page was mutated.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `api` | `MiddlewareAPI`\<[`Dispatch`](types.md#dispatch), [`RootState`](types.md#rootstate)\> |

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `next` | (`action`: `unknown`) => `unknown` |

##### Returns

`Function`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `action` | `unknown` |

###### Returns

`unknown`

#### Defined in

[lib/middleware.ts:15](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/middleware.ts#L15)

***

<a id="getin" name="getin"></a>

### getIn()

> **getIn**(`node`: [`JSONMappable`](types.md#jsonmappable), `path`: `string`): [`JSONValue`](types.md#jsonvalue)

Retrieves data from a JSON object using a [Keypath](types.md#keypath-2)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node` | [`JSONMappable`](types.md#jsonmappable) |  |
| `path` | `string` |  |

#### Returns

[`JSONValue`](types.md#jsonvalue)

#### Defined in

[lib/utils/immutability.ts:22](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/utils/immutability.ts#L22)

***

<a id="urltopagekey" name="urltopagekey"></a>

### urlToPageKey()

> **urlToPageKey**(`url`: `string`): [`PageKey`](types.md#pagekey-8)

Converts a url to a PageKey.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` |  |

#### Returns

[`PageKey`](types.md#pagekey-8)

#### Defined in

[lib/utils/url.ts:57](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/utils/url.ts#L57)
