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

[lib/types/requests.ts:22](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L22)

***

<a id="visitprops" name="visitprops"></a>

### VisitProps

Options for Visit

#### Extends

- `Omit`\<`BaseProps`, `"signal"`\>

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="placeholderkey" name="placeholderkey"></a> `placeholderKey?` | `string` | Defaults to the currentPageKey. When present, Superglue will use the page state located at that pageKey and optimistally navigates to it as the next page's state while the requests resolves. | - | [lib/types/requests.ts:36](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L36) |
| <a id="revisit" name="revisit"></a> `revisit?` | `boolean` | When `true` and the request method is a GET, changes the `suggestionAction` of the Meta object to `none` so that Superglue does nothing to window.history. When the GET response was redirected, changes `navigationAction` to `replace` | - | [lib/types/requests.ts:43](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L43) |
| <a id="method" name="method"></a> `method?` | `string` | The HTTP method | `Omit.method` | [lib/types/requests.ts:68](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L68) |
| <a id="body" name="body"></a> `body?` | `BodyInit` | The HTTP body | `Omit.body` | [lib/types/requests.ts:70](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L70) |
| <a id="headers" name="headers"></a> `headers?` | \{\} | The HTTP headers | `Omit.headers` | [lib/types/requests.ts:72](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L72) |
| <a id="beforesave" name="beforesave"></a> `beforeSave?` | [`BeforeSave`](types.requests.md#beforesave-2) | - | `Omit.beforeSave` | [lib/types/requests.ts:75](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L75) |

***

<a id="remote" name="remote"></a>

### Remote()

> **Remote**(`input`: `string`, `options`: [`RemoteProps`](types.requests.md#remoteprops)): `Promise`\<[`Meta`](types.md#meta)\>

Remote is is wrapper around fetch. Its used to make a request and mutate the
store. Remote does not navigate, and it does not change the browser history.
There can be multiple Remote requests running concurrently.

This function is to be wrapped by a deverloper as a [ApplicationRemote](types.requests.md#applicationremote)
and returned to superglue.  This is usually generated as
`application_visit.js` where you can make minimum edits to affect its
global usage.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | The first argument to Fetch |
| `options` | [`RemoteProps`](types.requests.md#remoteprops) | The fetch RequestInit with additional options |

#### Returns

`Promise`\<[`Meta`](types.md#meta)\>

#### Defined in

[lib/types/requests.ts:60](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L60)

***

<a id="remoteprops" name="remoteprops"></a>

### RemoteProps

Options for Visit

#### Extends

- `BaseProps`

#### Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="method-1" name="method-1"></a> `method?` | `string` | The HTTP method | `BaseProps.method` | [lib/types/requests.ts:68](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L68) |
| <a id="body-1" name="body-1"></a> `body?` | `BodyInit` | The HTTP body | `BaseProps.body` | [lib/types/requests.ts:70](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L70) |
| <a id="headers-1" name="headers-1"></a> `headers?` | \{\} | The HTTP headers | `BaseProps.headers` | [lib/types/requests.ts:72](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L72) |
| <a id="beforesave-1" name="beforesave-1"></a> `beforeSave?` | [`BeforeSave`](types.requests.md#beforesave-2) | - | `BaseProps.beforeSave` | [lib/types/requests.ts:75](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L75) |
| <a id="pagekey" name="pagekey"></a> `pageKey?` | `string` | Specifies where to store the remote payload, if not provided [Remote](types.requests.md#remote) will derive a key from the response's url. | - | [lib/types/requests.ts:86](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L86) |
| <a id="force" name="force"></a> `force?` | `boolean` | By default, remote [Remote](types.requests.md#remote) disallows grafting a page response using props_at if the target pageKey provided has a different componentIdentifier. Setting `force: true` will ignore this limitation. This can be useful if you are absolutely sure that the page your grafting onto has a compatible shape with the response received with using props_at. A good example of this is a shared global header. | - | [lib/types/requests.ts:96](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L96) |

***

<a id="beforesave-2" name="beforesave-2"></a>

### BeforeSave()

> **BeforeSave**(`prevPage`: [`VisitResponse`](types.md#visitresponset), `receivedPage`: [`VisitResponse`](types.md#visitresponset)): [`VisitResponse`](types.md#visitresponset)

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
| `prevPage` | [`VisitResponse`](types.md#visitresponset) |
| `receivedPage` | [`VisitResponse`](types.md#visitresponset) |

#### Returns

[`VisitResponse`](types.md#visitresponset)

#### Defined in

[lib/types/requests.ts:119](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L119)

***

<a id="applicationremote" name="applicationremote"></a>

### ApplicationRemote()

> **ApplicationRemote**(`input`: `string`, `options`: [`RemoteProps`](types.requests.md#remoteprops) & \{`dataset`: \{\}; \}): `Promise`\<[`Meta`](types.md#meta)\>

ApplicationRemote is the developer provided wrapper around [Remote](types.requests.md#remote).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `remote` call. See [Remote](types.requests.md#remote) for more details.

The only difference between the two interfaces is ApplicationRemote will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationRemote and will pass the dataset of the HTML element where UJS is
enabled on.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `options` | [`RemoteProps`](types.requests.md#remoteprops) & \{`dataset`: \{\}; \} |

#### Returns

`Promise`\<[`Meta`](types.md#meta)\>

#### Defined in

[lib/types/requests.ts:134](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L134)

***

<a id="applicationvisit" name="applicationvisit"></a>

### ApplicationVisit()

> **ApplicationVisit**(`input`: `string`, `options`: [`VisitProps`](types.requests.md#visitprops) & \{`dataset`: \{\}; \}): `Promise`\<`undefined` \| `void` \| [`VisitMeta`](types.md#visitmeta)\>

ApplicationVisit is the developer provided wrapper around [Remote](types.requests.md#remote).

It contains custom functionality, but is bound by the interface that
Superglue uses to make a `visit` call. See [Remote](types.requests.md#remote) for more details.

The only difference between the two interfaces is ApplicationVisit will also
be passed a dataset as an option. This is because Superglue UJS uses
ApplicationVisit and will pass the dataset of the HTML element where UJS is
enabled on.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |
| `options` | [`VisitProps`](types.requests.md#visitprops) & \{`dataset`: \{\}; \} |

#### Returns

`Promise`\<`undefined` \| `void` \| [`VisitMeta`](types.md#visitmeta)\>

#### Defined in

[lib/types/requests.ts:156](https://github.com/thoughtbot/superglue/blob/082475a624bd2c23522d97710a5b2ed335eb293c/superglue/lib/types/requests.ts#L156)
