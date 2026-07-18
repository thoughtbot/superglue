## Interfaces

<a id="visit"></a>

### Visit()

Defined in: [types/requests.ts:12](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L12)

> **Visit**(`input`: `string`, `options`: [`VisitProps`](#visitprops)): `Promise`\<[`VisitResult`](types.md#visitresult)\>

Defined in: [types/requests.ts:31](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L31)

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

| Parameter | Type                        | Description                 |
| --------- | --------------------------- | --------------------------- |
| `input`   | `string`                    | The first argument to Fetch |
| `options` | [`VisitProps`](#visitprops) |                             |

#### Returns

`Promise`\<[`VisitResult`](types.md#visitresult)\>

---

<a id="visitprops"></a>

### VisitProps

Defined in: [types/requests.ts:39](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L39)

Options for Visit

#### Extends

- `Omit`\<`BaseProps`, `"signal"`\>

#### Properties

| Property                                      | Type                                                                     | Description                                                                                                                                                                                                                                | Inherited from                                              | Defined in                                                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="placeholderkey"></a> `placeholderKey?` | `string`                                                                 | Defaults to the currentPageKey. When present, Superglue will use the page state located at that pageKey and optimistally navigates to it as the next page's state while the requests resolves.                                             | -                                                           | [types/requests.ts:45](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L45) |
| <a id="revisit"></a> `revisit?`               | `boolean`                                                                | When `true` and the request method is a GET, changes the `suggestionAction` of the Result object to `none` so that Superglue does nothing to window.history. When the GET response was redirected, changes `navigationAction` to `replace` | -                                                           | [types/requests.ts:52](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L52) |
| <a id="method"></a> `method?`                 | `string`                                                                 | The HTTP method                                                                                                                                                                                                                            | [`RemoteProps`](#remoteprops).[`method`](#method-1)         | [types/requests.ts:77](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L77) |
| <a id="body"></a> `body?`                     | `BodyInit`                                                               | The HTTP body                                                                                                                                                                                                                              | [`RemoteProps`](#remoteprops).[`body`](#body-1)             | [types/requests.ts:79](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L79) |
| <a id="headers"></a> `headers?`               | \{\[`key`: `string`\]: `string`; \}                                      | The HTTP headers                                                                                                                                                                                                                           | `Omit.headers`                                              | [types/requests.ts:81](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L81) |
| <a id="beforesave"></a> `beforeSave?`         | [`BeforeSave`](#beforesave-2)\<[`JSONMappable`](types.md#jsonmappable)\> | -                                                                                                                                                                                                                                          | [`RemoteProps`](#remoteprops).[`beforeSave`](#beforesave-1) | [types/requests.ts:84](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L84) |

---

<a id="remote"></a>

### Remote()

Defined in: [types/requests.ts:55](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L55)

> **Remote**(`input`: `string`, `options`: [`RemoteProps`](#remoteprops)): `Promise`\<[`Result`](types.md#result)\>

Defined in: [types/requests.ts:69](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L69)

Remote is a wrapper around fetch. It's used to make a request and mutate the
store. Remote does not navigate, and it does not change the browser history.
There can be multiple Remote requests running concurrently.

This function is to be wrapped by a developer as a [ApplicationRemote](#applicationremote)
and returned to superglue. This is usually generated as
`application_visit.js` where you can make minimum edits to affect its
global usage.

#### Parameters

| Parameter | Type                          | Description                                   |
| --------- | ----------------------------- | --------------------------------------------- |
| `input`   | `string`                      | The first argument to Fetch                   |
| `options` | [`RemoteProps`](#remoteprops) | The fetch RequestInit with additional options |

#### Returns

`Promise`\<[`Result`](types.md#result)\>

---

<a id="remoteprops"></a>

### RemoteProps

Defined in: [types/requests.ts:90](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L90)

Options for Visit

#### Extends

- `BaseProps`

#### Properties

| Property                                | Type                                                                     | Description                                                                                                                                                                                                                                                                                                                                                                                                           | Inherited from         | Defined in                                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="method-1"></a> `method?`         | `string`                                                                 | The HTTP method                                                                                                                                                                                                                                                                                                                                                                                                       | `BaseProps.method`     | [types/requests.ts:77](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L77)   |
| <a id="body-1"></a> `body?`             | `BodyInit`                                                               | The HTTP body                                                                                                                                                                                                                                                                                                                                                                                                         | `BaseProps.body`       | [types/requests.ts:79](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L79)   |
| <a id="headers-1"></a> `headers?`       | \{\[`key`: `string`\]: `string`; \}                                      | The HTTP headers                                                                                                                                                                                                                                                                                                                                                                                                      | `BaseProps.headers`    | [types/requests.ts:81](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L81)   |
| <a id="beforesave-1"></a> `beforeSave?` | [`BeforeSave`](#beforesave-2)\<[`JSONMappable`](types.md#jsonmappable)\> | -                                                                                                                                                                                                                                                                                                                                                                                                                     | `BaseProps.beforeSave` | [types/requests.ts:84](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L84)   |
| <a id="pagekey"></a> `pageKey?`         | `string`                                                                 | Specifies where to store the remote payload, if not provided [Remote](#remote) will derive a key from the response's url.                                                                                                                                                                                                                                                                                             | -                      | [types/requests.ts:95](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L95)   |
| <a id="force"></a> `force?`             | `boolean`                                                                | By default, remote [Remote](#remote) disallows grafting a page response using props_at if the target pageKey provided has a different componentIdentifier. Setting `force: true` will ignore this limitation. This can be useful if you are absolutely sure that the page your grafting onto has a compatible shape with the response received with using props_at. A good example of this is a shared global header. | -                      | [types/requests.ts:105](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L105) |

---

<a id="beforesave-2"></a>

### BeforeSave()\<T\>

Defined in: [types/requests.ts:108](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L108)

#### Type Parameters

| Type Parameter | Default type                            |
| -------------- | --------------------------------------- |
| `T`            | [`JSONMappable`](types.md#jsonmappable) |

> **BeforeSave**\<`U`\>(`prevPage`: `undefined` \| [`Page`](types.md#page)\<`T`\>, `nextPage`: `U`): `U`

Defined in: [types/requests.ts:133](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L133)

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

| Type Parameter                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------- |
| `U` _extends_ [`SaveResponse`](types.md#saveresponse)\<`T`\> \| [`GraftResponse`](types.md#graftresponse)\<`T`\> |

#### Parameters

| Parameter  | Type                                          |
| ---------- | --------------------------------------------- |
| `prevPage` | `undefined` \| [`Page`](types.md#page)\<`T`\> |
| `nextPage` | `U`                                           |

#### Returns

`U`

---

<a id="applicationremote"></a>

### ApplicationRemote()

Defined in: [types/requests.ts:139](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L139)

> **ApplicationRemote**(`input`: `string`, `options?`: [`RemoteProps`](#remoteprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \}): `Promise`\<[`Result`](types.md#result) \| [`ErrorResult`](types.md#errorresult)\>

Defined in: [types/requests.ts:156](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L156)

ApplicationRemote is the developer provided wrapper around [Remote](#remote).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `remote` call. See [Remote](#remote) for more details.

The only difference between the two interfaces is ApplicationRemote will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationRemote and will pass the dataset of the HTML element where UJS is
enabled on.

Returns a `Promise<Result | ErrorResult>` — terminal branches (HTTP
error redirects, unexpected exceptions) should return a never-settling
promise rather than `undefined` so the chain reflects "the browser is
unloading."

#### Parameters

| Parameter  | Type                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| `input`    | `string`                                                                                               |
| `options?` | [`RemoteProps`](#remoteprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \} |

#### Returns

`Promise`\<[`Result`](types.md#result) \| [`ErrorResult`](types.md#errorresult)\>

---

<a id="applicationvisit"></a>

### ApplicationVisit()

Defined in: [types/requests.ts:166](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L166)

> **ApplicationVisit**(`input`: `string`, `options?`: [`VisitProps`](#visitprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \}): `Promise`\<[`VisitResult`](types.md#visitresult) \| [`ErrorResult`](types.md#errorresult)\>

Defined in: [types/requests.ts:183](https://github.com/thoughtbot/superglue/blob/38ea0f22384ca668ffa28ead0054dc09a0f39366/superglue/lib/types/requests.ts#L183)

ApplicationVisit is the developer provided wrapper around [Remote](#remote).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `visit` call. See [Remote](#remote) for more details.

The only difference between the two interfaces is ApplicationVisit will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationVisit and will pass the dataset of the HTML element where UJS is
enabled on.

Returns a `Promise<VisitResult | ErrorResult>` — terminal branches
(HTTP error redirects, unexpected exceptions) should return a
never-settling promise rather than `undefined` so the chain reflects
"the browser is unloading."

#### Parameters

| Parameter  | Type                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `input`    | `string`                                                                                             |
| `options?` | [`VisitProps`](#visitprops) & \{ `dataset?`: \{\[`name`: `string`\]: `undefined` \| `string`; \}; \} |

#### Returns

`Promise`\<[`VisitResult`](types.md#visitresult) \| [`ErrorResult`](types.md#errorresult)\>
