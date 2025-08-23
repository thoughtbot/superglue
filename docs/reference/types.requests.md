## Interfaces

<a id="visit"></a>

### Visit()

Defined in: [types/requests.ts:11](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L11)

> **Visit**(`input`: `string`, `options`: [`VisitProps`](#visitprops)): `Promise`\<[`Meta`](types.md#meta)\>

Defined in: [types/requests.ts:30](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L30)

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

`Promise`\<[`Meta`](types.md#meta)\>

***

<a id="visitprops"></a>

### VisitProps

Defined in: [types/requests.ts:38](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L38)

Options for Visit

#### Extends

- `Omit`\<`BaseProps`, `"signal"`\>

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="placeholderkey"></a> `placeholderKey?` | `string` | Defaults to the currentPageKey. When present, Superglue will use the page state located at that pageKey and optimistally navigates to it as the next page's state while the requests resolves. | - | [types/requests.ts:44](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L44) |
| <a id="revisit"></a> `revisit?` | `boolean` | When `true` and the request method is a GET, changes the `suggestionAction` of the Meta object to `none` so that Superglue does nothing to window.history. When the GET response was redirected, changes `navigationAction` to `replace` | - | [types/requests.ts:51](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L51) |
| <a id="method"></a> `method?` | `string` | The HTTP method | [`RemoteProps`](#remoteprops).[`method`](#method-1) | [types/requests.ts:76](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L76) |
| <a id="body"></a> `body?` | `BodyInit` | The HTTP body | [`RemoteProps`](#remoteprops).[`body`](#body-1) | [types/requests.ts:78](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L78) |
| <a id="headers"></a> `headers?` | \{\[`key`: `string`\]: `string`; \} | The HTTP headers | `Omit.headers` | [types/requests.ts:80](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L80) |
| <a id="beforesave"></a> `beforeSave?` | [`BeforeSave`](#beforesave-2)\<[`JSONMappable`](types.md#jsonmappable)\> | - | [`RemoteProps`](#remoteprops).[`beforeSave`](#beforesave-1) | [types/requests.ts:83](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L83) |

***

<a id="remote"></a>

### Remote()

Defined in: [types/requests.ts:54](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L54)

> **Remote**(`input`: `string`, `options`: [`RemoteProps`](#remoteprops)): `Promise`\<[`Meta`](types.md#meta)\>

Defined in: [types/requests.ts:68](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L68)

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

`Promise`\<[`Meta`](types.md#meta)\>

***

<a id="remoteprops"></a>

### RemoteProps

Defined in: [types/requests.ts:89](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L89)

Options for Visit

#### Extends

- `BaseProps`

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="method-1"></a> `method?` | `string` | The HTTP method | `BaseProps.method` | [types/requests.ts:76](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L76) |
| <a id="body-1"></a> `body?` | `BodyInit` | The HTTP body | `BaseProps.body` | [types/requests.ts:78](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L78) |
| <a id="headers-1"></a> `headers?` | \{\[`key`: `string`\]: `string`; \} | The HTTP headers | `BaseProps.headers` | [types/requests.ts:80](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L80) |
| <a id="beforesave-1"></a> `beforeSave?` | [`BeforeSave`](#beforesave-2)\<[`JSONMappable`](types.md#jsonmappable)\> | - | `BaseProps.beforeSave` | [types/requests.ts:83](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L83) |
| <a id="pagekey"></a> `pageKey?` | `string` | Specifies where to store the remote payload, if not provided [Remote](#remote) will derive a key from the response's url. | - | [types/requests.ts:94](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L94) |
| <a id="force"></a> `force?` | `boolean` | By default, remote [Remote](#remote) disallows grafting a page response using props_at if the target pageKey provided has a different componentIdentifier. Setting `force: true` will ignore this limitation. This can be useful if you are absolutely sure that the page your grafting onto has a compatible shape with the response received with using props_at. A good example of this is a shared global header. | - | [types/requests.ts:104](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L104) |

***

<a id="beforesave-2"></a>

### BeforeSave()\<T\>

Defined in: [types/requests.ts:107](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L107)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | [`JSONMappable`](types.md#jsonmappable) |

> **BeforeSave**\<`U`\>(`prevPage`: [`Page`](types.md#page)\<`T`\>, `receivedPage`: `U`): `U`

Defined in: [types/requests.ts:128](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L128)

A callback that fires in between recieving a payload and saving a
payload. Use this callback to modify the payload before it gets saved. Its
useful for appending, prepending, shuffeling, etc. recieved data to
existing data.

```
const beforeSave = (prevPage, nextPage) => {
  nextPage.data.messages = [
    prevPage.data.messages,
    ... nextPage.data.messages
  ]

  return nextPage
}

remote("/posts", {beforeSave})
```

#### Type Parameters

| Type Parameter |
| ------ |
| `U` *extends* [`SaveResponse`](types.md#saveresponse)\<`T`\> \| [`GraftResponse`](types.md#graftresponse)\<`T`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `prevPage` | [`Page`](types.md#page)\<`T`\> |
| `receivedPage` | `U` |

#### Returns

`U`

***

<a id="applicationremote"></a>

### ApplicationRemote()

Defined in: [types/requests.ts:134](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L134)

> **ApplicationRemote**(`input`: `string`, `options?`: [`RemoteProps`](#remoteprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \}): `Promise`\<[`Meta`](types.md#meta)\>

Defined in: [types/requests.ts:146](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L146)

ApplicationRemote is the developer provided wrapper around [Remote](#remote).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `remote` call. See [Remote](#remote) for more details.

The only difference between the two interfaces is ApplicationRemote will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationRemote and will pass the dataset of the HTML element where UJS is
enabled on.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `options?` | [`RemoteProps`](#remoteprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \} |

#### Returns

`Promise`\<[`Meta`](types.md#meta)\>

***

<a id="applicationvisit"></a>

### ApplicationVisit()

Defined in: [types/requests.ts:156](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L156)

> **ApplicationVisit**(`input`: `string`, `options?`: [`VisitProps`](#visitprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \}): `Promise`\<`undefined` \| `void` \| [`VisitMeta`](types.md#visitmeta)\>

Defined in: [types/requests.ts:168](https://github.com/thoughtbot/superglue/blob/46e766e2cea01dff2e2730d3b74a6719c2b2fe9f/superglue/lib/types/requests.ts#L168)

ApplicationVisit is the developer provided wrapper around [Remote](#remote).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `visit` call. See [Remote](#remote) for more details.

The only difference between the two interfaces is ApplicationVisit will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationVisit and will pass the dataset of the HTML element where UJS is
enabled on.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `options?` | [`VisitProps`](#visitprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \} |

#### Returns

`Promise`\<`undefined` \| `void` \| [`VisitMeta`](types.md#visitmeta)\>
