import { JSONMappable, JSONValue } from './json'

export type ValidationResult = {
  success: boolean
  errors: unknown[]
}

export type ValidateOption = {
  validate?: (data: unknown) => ValidationResult
}

/**
 * A PageKey is a combination of a parsed URL's pathname + query string. No hash.
 *
 * * @example
 * /posts?foobar=123
 */
export type PageKey = string

/**
 * Defines the behavior when navigating to a page that is already stored on the
 * client. For example, when navigating back.
 *
 * When the page already exists in the store:
 * - `fromCacheOnly` - Use the cached page that exists on the store, only.
 * - `revisitOnly` - Ignore the cache and make a request for the latest page. If
 * the response was 200, the {@link NavigationAction} would be `none` as we don't want
 * to push into history. If the response was redirected, the {@link NavigationAction} would be set to
 * `replace`.
 * - `fromCacheAndRevisitInBackground` - Use the cache version of the page so
 *    superglue can optimistically navigate to it, then make an additional request
 *    for the latest version.
 */
export type RestoreStrategy =
  | 'fromCacheOnly'
  | 'revisitOnly'
  | 'fromCacheAndRevisitInBackground'

/**
 * A NavigationAction is used to tell Superglue to history.push, history.replace
 * or do nothing.
 */
export type NavigationAction = 'push' | 'replace' | 'none'

/**
 * An identifier that Superglue will uses to determine which page component to render
 * with your page response.
 */
export type ComponentIdentifier = string

/**
 * A keypath is a string representing the location of a piece of data. Superglue uses
 * the keypath to dig for or update data.
 *
 * @example
 * Object access
 * ```
 * data.header.avatar
 * ```
 *
 * @example
 * Array access
 * ```
 * data.body.posts.0.title
 * ```
 *
 * @example
 * Array with lookahead
 * ```
 * data.body.posts.post_id=foobar.title
 * ```
 */
export type Keypath = string

export type FlashState = Record<string, JSONValue>

/**
 * Defer is a node in the page response thats been intentionally filled
 * with empty or placeholder data for the purposes of fetching it later.
 *
 * You would typically use it with props_template for parts of a page that you
 * know would be slower to load.
 *
 * @property url A url with props_at keypath in the query parameter to indicate
 * how to dig for the data, and where to place the data.
 * @property type When set to `auto` Superglue will automatically make the
 * request using the `url`. When set to `manual`, Superglue does nothing, and
 * you would need to manually use `remote` with the `url` to fetch the missing
 * data.
 * @property path A keypath indicates how to dig for the data and where to place
 * the data.
 * @property successAction a user defined action for Superglue to dispatch when
 * auto deferement is successful
 * @property failAction a user defined action for Superglue to dispatch when
 * auto deferement failed
 * @interface
 */
export type Defer = {
  url: string
  type: 'auto' | 'manual'
  path: Keypath
  successAction: string
  failAction: string
}

/**
 * A FragmentPath identifies a fragment inside of a PageResponse. Its used internally by Superglue to
 * denormalize a page response into fragments, if any.
 *
 * @prop type A user supplied string identifying a fragment. This is usually created using
 * [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments)
 * @prop path A Keypath specifying the location of the fragment
 * @interface
 */

export type FragmentPath = {
  id: string
  path: Keypath
}

/**
 * The SaveResponse response is responsible for persisting a full page
 * visit in Superglue.
 */
export type SaveResponse<T = JSONMappable> = {
  data: T
  componentIdentifier: ComponentIdentifier
  assets: string[]
  csrfToken?: string
  fragments: FragmentPath[]
  defers: Defer[]
  flash: FlashState
  action: 'savePage'

  renderedAt: number
  restoreStrategy: RestoreStrategy
}

/**
 * A Page is a SaveResponse that's been saved to the store
 */
export type Page<T = JSONMappable> = SaveResponse<T> & {
  savedAt: number
}

/**
 * The GraftResponse is responsible for partial updates using props_template's
 * digging functionality in Superglue.
 *
 * @property path Used by superglue to replace the data at that location.
 * @property equals to `graft` to indicate a {@link GraftResponse}
 * @interface
 */
export type GraftResponse<T = JSONMappable> = {
  data: T
  componentIdentifier: ComponentIdentifier
  assets: string[]
  csrfToken?: string
  fragments: FragmentPath[]
  defers: Defer[]
  flash: FlashState
  action: 'graft'
  renderedAt: number

  path: Keypath
  fragmentContext?: string
}

export type StreamMessage = {
  data: JSONMappable
  fragmentIds: string[]
  handler: 'append' | 'prepend' | 'update'
  options: Record<string, string>
}

export type StreamResponse = {
  data: StreamMessage[]
  fragments: FragmentPath[]
  assets: string[]
  csrfToken?: string
  action: 'handleStreamResponse'
  renderedAt: number
  flash: FlashState
}

/**
 * A PageResponse can be either a {@link GraftResponse}, {@link SaveResponse}.
 * or a {@link StreamResponse} Its meant to be implemented by the server and if
 * you are using superglue_rails, the generators will handle all cases.
 */
export type PageResponse = GraftResponse | SaveResponse | StreamResponse

// todo: rename rsp to response

export interface ParsedResponse {
  rsp: Response
  json: PageResponse
}
