## Classes

<a id="default" name="default"></a>

### default

A Nav component for browsers. It handles changine the browser history,
deciding which page component to render based on a passed mapping, and
passes a `navigateTo` to all page components.

#### Extends

- `Component`\<`Props`, `State`\>

#### Methods

<a id="navigateto" name="navigateto"></a>

##### navigateTo()

> **navigateTo**(`path`: `string`, `options`: \{`action`: [`SuggestedAction`](types.md#suggestedaction-1);`ownProps`: `Record`\<`string`, `unknown`\>; \}): `boolean`

Passed to every page component. Manually navigate using pages that exists
in the store and restores scroll position. This is what [Visit](types.requests.md#visit) in
your `application_visit.js` ultimately calls.

If there is an existing page in your store `navigateTo` will restore the props,
render the correct component, and return `true`. Otherwise, it will return
`false`. This is useful if you want to restore an existing page before making a
call to `visit` or `remote`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` |  |
| `options` | `object` | when `none`, immediately returns `false` |
| `options.action` | [`SuggestedAction`](types.md#suggestedaction-1) | - |
| `options.ownProps` | `Record`\<`string`, `unknown`\> | - |

###### Returns

`boolean`

`true` if the navigation was a success, `false` if the page was not found in the
store.

###### Defined in

[lib/components/Nav.tsx:85](https://github.com/thoughtbot/superglue/blob/be017596661ef6ab66e199643ed384e7715f12ba/superglue/lib/components/Nav.tsx#L85)
