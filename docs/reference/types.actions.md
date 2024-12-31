## Interfaces

<a id="graftingsuccessaction" name="graftingsuccessaction"></a>

### GraftingSuccessAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type" name="type"></a> `type` | `string` | `Action.type` | [lib/types/actions.ts:12](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L12) |
| <a id="payload" name="payload"></a> `payload` | \{`pageKey`: `string`;`keyPath`: `string`; \} | - | [lib/types/actions.ts:13](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L13) |
| <a id="pagekey" name="pagekey"></a> `payload.pageKey` | `string` | - | [lib/types/actions.ts:14](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L14) |
| <a id="keypath" name="keypath"></a> `payload.keyPath` | `string` | - | [lib/types/actions.ts:15](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L15) |

***

<a id="graftingerroraction" name="graftingerroraction"></a>

### GraftingErrorAction

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-1" name="type-1"></a> `type` | `string` | `Action.type` | [lib/types/actions.ts:20](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L20) |
| <a id="payload-1" name="payload-1"></a> `payload` | \{`pageKey`: `string`;`url`: `string`;`err`: `unknown`;`keyPath`: `string`; \} | - | [lib/types/actions.ts:21](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L21) |
| <a id="pagekey-1" name="pagekey-1"></a> `payload.pageKey` | `string` | - | [lib/types/actions.ts:22](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L22) |
| <a id="url" name="url"></a> `payload.url` | `string` | - | [lib/types/actions.ts:23](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L23) |
| <a id="err" name="err"></a> `payload.err` | `unknown` | - | [lib/types/actions.ts:24](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L24) |
| <a id="keypath-1" name="keypath-1"></a> `payload.keyPath` | `string` | - | [lib/types/actions.ts:25](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L25) |

## Type Aliases

<a id="fetchargs" name="fetchargs"></a>

### FetchArgs

> **FetchArgs**: [`string`, [`BasicRequestInit`](types.md#basicrequestinit)]

Tuple of Fetch arguments that Superglue passes to Fetch.

#### Defined in

[lib/types/actions.ts:7](https://github.com/thoughtbot/superglue/blob/596d8e2334d11fa65762247bc4e1bdc41ab87e3e/superglue/lib/types/actions.ts#L7)
