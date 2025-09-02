## Interfaces

<a id="graftingsuccessaction"></a>

### GraftingSuccessAction

Defined in: [types/actions.ts:11](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L11)

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type"></a> `type` | `string` | `Action.type` | [types/actions.ts:12](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L12) |
| <a id="payload"></a> `payload` | \{ `pageKey`: `string`; `keyPath`: `string`; \} | - | [types/actions.ts:13](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L13) |
| `payload.pageKey` | `string` | - | [types/actions.ts:14](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L14) |
| `payload.keyPath` | `string` | - | [types/actions.ts:15](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L15) |

***

<a id="graftingerroraction"></a>

### GraftingErrorAction

Defined in: [types/actions.ts:19](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L19)

#### Extends

- `Action`

#### Properties

| Property | Type | Overrides | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="type-1"></a> `type` | `string` | `Action.type` | [types/actions.ts:20](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L20) |
| <a id="payload-1"></a> `payload` | \{ `pageKey`: `string`; `url`: `string`; `err`: `unknown`; `keyPath`: `string`; \} | - | [types/actions.ts:21](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L21) |
| `payload.pageKey` | `string` | - | [types/actions.ts:22](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L22) |
| `payload.url` | `string` | - | [types/actions.ts:23](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L23) |
| `payload.err` | `unknown` | - | [types/actions.ts:24](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L24) |
| `payload.keyPath` | `string` | - | [types/actions.ts:25](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L25) |

## Type Aliases

<a id="fetchargs"></a>

### FetchArgs

> **FetchArgs** = \[`string`, [`BasicRequestInit`](types.md#basicrequestinit)\]

Defined in: [types/actions.ts:7](https://github.com/thoughtbot/superglue/blob/6828bbda8f8692c93cd2c69d86a8a10fbb351d20/superglue/lib/types/actions.ts#L7)

Tuple of Fetch arguments that Superglue passes to Fetch.
