## Interfaces

<a id="visit" name="visit"></a>

### Visit()

> **Visit**(`input`: `string`, `options`: [`VisitProps`](types.requests.md#visitprops)): `Promise`\<[`Meta`](types.md#meta)\>

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
| `options` | [`VisitProps`](types.requests.md#visitprops) |  |

#### Returns

`Promise`\<[`Meta`](types.md#meta)\>

#### Defined in

[lib/types/requests.ts:22](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L22)

***

<a id="visitprops" name="visitprops"></a>

### VisitProps

Options for Visit

#### Extends

- `BaseProps`

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="placeholderkey" name="placeholderkey"></a> `placeholderKey?` | `string` | When present, Superglue will use the page state located at that pageKey and optimistally navigates to it as the next page's state while the requests resolves. | - | [lib/types/requests.ts:36](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L36) |
| <a id="revisit" name="revisit"></a> `revisit?` | `boolean` | When `true` and the request method is a GET, changes the `suggestionAction` of the Meta object to `none` so that Superglue does nothing to window.history. When the GET response was redirected, changes `suggestedAction` to `replace` | - | [lib/types/requests.ts:43](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L43) |
| <a id="method" name="method"></a> `method?` | `string` | The HTTP method | `BaseProps.method` | [lib/types/requests.ts:67](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L67) |
| <a id="body" name="body"></a> `body?` | `BodyInit` | The HTTP body | `BaseProps.body` | [lib/types/requests.ts:69](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L69) |
| <a id="headers" name="headers"></a> `headers?` | \{\} | The HTTP headers | `BaseProps.headers` | [lib/types/requests.ts:71](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L71) |
| <a id="beforesave" name="beforesave"></a> `beforeSave?` | [`BeforeSave`](types.requests.md#beforesave-2) | - | `BaseProps.beforeSave` | [lib/types/requests.ts:74](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L74) |

***

<a id="remote" name="remote"></a>

### Remote()

> **Remote**(`input`: `string`, `options`: [`RemoteProps`](types.requests.md#remoteprops)): `Promise`\<[`Meta`](types.md#meta)\>

Remote is is wrapper around fetch. Its used to make a request and mutate the
store. Remote does not navigate, and it does not change the browser history.
There can be multiple Remote requests running concurrently.

This function is to be built, customized, and returned to superglue by the
developer. This is usually generated as `application_visit.js` where you can
make minimum edits to affect its global usage.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | The first argument to Fetch |
| `options` | [`RemoteProps`](types.requests.md#remoteprops) | The fetch RequestInit with additional options |

#### Returns

`Promise`\<[`Meta`](types.md#meta)\>

#### Defined in

[lib/types/requests.ts:59](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L59)

***

<a id="remoteprops" name="remoteprops"></a>

### RemoteProps

Options for Visit

#### Extends

- `BaseProps`

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="method-1" name="method-1"></a> `method?` | `string` | The HTTP method | `BaseProps.method` | [lib/types/requests.ts:67](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L67) |
| <a id="body-1" name="body-1"></a> `body?` | `BodyInit` | The HTTP body | `BaseProps.body` | [lib/types/requests.ts:69](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L69) |
| <a id="headers-1" name="headers-1"></a> `headers?` | \{\} | The HTTP headers | `BaseProps.headers` | [lib/types/requests.ts:71](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L71) |
| <a id="beforesave-1" name="beforesave-1"></a> `beforeSave?` | [`BeforeSave`](types.requests.md#beforesave-2) | - | `BaseProps.beforeSave` | [lib/types/requests.ts:74](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L74) |
| <a id="pagekey" name="pagekey"></a> `pageKey?` | `string` | Specifies where to store the remote payload, if not provided [Remote](types.requests.md#remote) will use the `currentPageKey` at SuperglueState | - | [lib/types/requests.ts:85](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L85) |

***

<a id="beforesave-2" name="beforesave-2"></a>

### BeforeSave()

> **BeforeSave**(`prevPage`: [`VisitResponse`](types.md#visitresponse), `receivedPage`: [`VisitResponse`](types.md#visitresponse)): [`VisitResponse`](types.md#visitresponse)

A callback that will be fire in between recieving a payload and saving a
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

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `prevPage` | [`VisitResponse`](types.md#visitresponse) |
| `receivedPage` | [`VisitResponse`](types.md#visitresponse) |

#### Returns

[`VisitResponse`](types.md#visitresponse)

#### Defined in

[lib/types/requests.ts:108](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/types/requests.ts#L108)
