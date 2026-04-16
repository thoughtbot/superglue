import { FetchArgs } from './actions'
import type { Action } from '@reduxjs/toolkit'
import { EnhancedStore, Tuple, StoreEnhancer } from '@reduxjs/toolkit'
import { ThunkDispatch } from '@reduxjs/toolkit'
import { ThunkAction } from '@reduxjs/toolkit'
import {
  VisitProps,
  RemoteProps,
  ApplicationVisit,
  ApplicationRemote,
} from './requests'
import { History } from 'history'
import { rootReducer } from '../reducers'
import { FragmentProxy } from '../hooks/useFragment'
import { Consumer } from './cable'
import { Config } from '../config'

export * from './requests'
export * from './cable'

/**
 * Type marker for Deepkit runtime validation. This allows Deepkit
 * to be an optional peer dependency since Deepkit only checks for
 * the name of the type is ReceiveType.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ReceiveType<T> = unknown

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

export * from './actions'

/**
 * A JSON Primitive value
 */
export type JSONPrimitive = string | number | boolean | null | undefined

/**
 * A JSON Object
 */
export type JSONObject = {
  [key: string]: JSONValue
}

/**
 * A JSON Object or an array of values
 */
export type JSONMappable = JSONValue[] | JSONObject

/**
 * A array of JSON key value objects or a JSON Object
 */
export type JSONKeyable = JSONObject[] | JSONObject

/**
 * A primitive or a mappable object
 */
export type JSONValue = JSONPrimitive | JSONMappable

export type FlashState = Record<string, JSONValue>

/**
 * A Fragment is a rendered Rails partial with an identity. The use
 * of this type is optional, but it makes usage with unproxy and
 * useUpdateFragment type friendly.
 *
 * In general, Fragments enable normalized state management where Rails partials
 * become referenceable entities on the client. The server renders partials as
 * fragments with unique IDs, then Superglue normalizes them into a separate
 * fragments store while replacing the original data with fragment references.
 *
 * @example Server Response (normalized)
 * ```json
 * {
 *   "data": { "cart": { items: [...], totalCost: 69.97 } },
 *   "fragments": [{ "type": "userCart", "path": ["cart"] }]
 * }
 * ```
 *
 * @example Client State (denormalized)
 * ```js
 * {
 *   pages: { "/page": { data: { cart: { __id: "userCart" } } } },
 *   fragments: { "userCart": { items: [...], totalCost: 69.97 } }
 * }
 * ```
 *
 * @example Usage
 * ```tsx
 * type PageData = {
 *   cart: Fragment<{ items: Item[]; totalCost: number }, true>;
 *   user?: Fragment<{ name: string; email: string }>; // Optional fragment
 * }
 *
 * const content = useContent<PageData>()
 * const cart = content.cart // Resolves fragment reference to actual data
 * ```
 *
 * @example Usage
 * ```tsx
 * // You can also nest fragments within other fragments
 * interface Post {
 *  title: string
 *  author: Fragment<Author, true>
 *  comments: Array<Fragment<Comment, true>>
 * }
 *
 * const page = useContent<{ post: Fragment<Post, true> }>()
 * ```
 *
 * @typeParam T The shape of the fragment's data.
 * @typeParam Present Indicates whether the fragment is guaranteed to be
 * present. It's possible that a fragment was deleted from the store due to
 * client side mutations. If you are sure that the fragment will ALWAYS be
 * present, set this to `true`, otherwise its `false` by default.
 */

export type Fragment<T, Present = false> = Present extends true
  ? T & { __id: string }
  : (T & { __id: string }) | undefined

/**
 * Utility type for unproxy that converts Fragment types to fragment references.
 * This recursively processes objects and arrays to convert Fragment<T> to { __id: string }.
 */
export type Unproxy<T> = T extends FragmentProxy
  ? FragmentRef
  : T extends Fragment<unknown, unknown>
  ? FragmentRef
  : T extends (infer U)[]
  ? Unproxy<U>[]
  : T extends object
  ? { [K in keyof T]: Unproxy<T[K]> }
  : T

// todo: rename rsp to response

export interface ParsedResponse {
  rsp: Response
  json: PageResponse
}

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
 * A FragmentRef is a reference to a Fragment.
 *
 * @prop __id A user supplied string identifying the fragment. This is usually created using
 * [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments)
 * @interface
 */

export type FragmentRef = {
  __id: string
}

/**
 * The store where all page responses are stored indexed by PageKey. You are encouraged
 * to mutate the Pages in this store.
 */
export type AllPages<T = JSONMappable> = Record<PageKey, Page<T>>

/**
 * The store where all page responses are stored indexed by PageKey. You are encouraged
 * to mutate the Pages in this store.
 */
export type AllFragments = Record<string, JSONMappable>

/**
 * A read only state that contains meta information about
 * the current page.
 */
export interface SuperglueState {
  /** The {@link PageKey} (url pathname + search) of the current page. This can be pass to {@link Remote}.*/
  currentPageKey: PageKey
  /** The query string object of the current url.*/
  search: Record<string, string | undefined>
  /** The Rails csrfToken that you can use for forms.*/
  csrfToken?: string
  /** The tracked asset digests.*/
  assets: string[]
}

/**
 * The root state for a Superglue application. It occupies
 * 2 keys in your app.
 */
export interface RootState<T = JSONMappable> {
  /** Contains readonly metadata about the current page */
  superglue: SuperglueState
  /** Every {@link PageResponse} that superglue recieves is stored here.*/
  pages: AllPages<T>
  fragments: AllFragments
  flash: FlashState
  [name: string]: unknown
}

/**
 * The success branch of a `remote` call. Resolved by the `remote` thunk
 * and {@link webRemote}; the `hasError: false` literal acts as the
 * discriminant for narrowing against {@link ErrorResult}.
 */
export interface Result {
  hasError: false
  /**
   * The URL of the response converted to a pageKey. Superglue uses this to
   * persist the {@link SaveResponse} to store, when that happens.
   */
  pageKey: PageKey
  /** The {@link SaveResponse} of the page */
  page: PageResponse
  /** Indicates if response was redirected */
  redirected: boolean
  /** The original response object*/
  rsp: Response
  /** The original args passed to fetch.*/
  fetchArgs: FetchArgs
  /** The {@link ComponentIdentifier} extracted from the response.*/
  componentIdentifier?: ComponentIdentifier
  /** `true` when assets locally are detected to be out of date */
  needsRefresh: boolean
}

/**
 * The success branch of a `visit` call. Extends {@link Result} with the
 * computed {@link NavigationAction} for browser-history orchestration.
 */
export interface VisitResult extends Result {
  /** The {@link NavigationAction}. This can be used for navigation.*/
  navigationAction: NavigationAction
}

/**
 * The error branch returned by `visit` and `remote` when the server
 * responds with a non-2xx status. Non-HTTP failures (network, parse,
 * abort, programming bugs) propagate as a rejected promise instead.
 */
export interface ErrorResult {
  hasError: true
  /** The failed HTTP response. */
  response: Response
}

// I can do Visit['props'] or better yet Visit['options']

/**
 * VisitCreator is a Redux action creator that returns a thunk. Use this to build
 * the {@link Visit} function. Typically it's already generated in `application_visit.js`
 */
export type VisitCreator = (
  input: string | PageKey,
  options?: VisitProps
) => VisitMetaThunk

/**
 * RemoteCreator is a Redux action creator that returns a thunk. Use this to build
 * the {@link Remote} function. Typically it's already generated in `application_visit.js`
 */
export type RemoteCreator = (
  input: string | PageKey,
  options?: RemoteProps
) => MetaThunk

export interface ExtraArgument {
  config: Config
  lastVisitController: { abort: (reason: string) => void }
}

export type Dispatch = ThunkDispatch<RootState, ExtraArgument, Action>

/**
 * A Store created with Redux Toolkit's `configureStore` setup with reducers
 * from Superglue. If you are using superglue_rails this would have been
 * generated for you in `store.js` and setup correctly in application.js
 */
export type SuperglueStore = EnhancedStore<
  RootState,
  Action,
  Tuple<
    [
      StoreEnhancer<{
        dispatch: Dispatch
      }>,
      StoreEnhancer
    ]
  >
>

export interface Handlers {
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onSubmit: (event: React.FormEvent<HTMLDivElement>) => void
}

export type UJSHandlers = ({
  ujsAttributePrefix,
  visit,
  remote,
  store,
}: {
  ujsAttributePrefix: string
  visit: ApplicationVisit
  remote: ApplicationRemote
  store: SuperglueStore
}) => Handlers

/**
 * The state that is saved to history.state. Superglue stores
 * information about the current page so that it can restore
 * the page state when navigating back
 */
export interface HistoryState {
  /** Is always `true` so superglue can differentiate pages that have superglue enabled or not */
  superglue: true
  /** The page key in {@link SuperglueState} to restore from */
  pageKey: PageKey
  /** The scroll position X of the page*/
  posX: number
  /** The scroll position Y of the page*/
  posY: number
}

export type SaveAndProcessPageThunk = ThunkAction<
  Promise<void>,
  RootState,
  ExtraArgument,
  Action
>

export type MetaThunk = ThunkAction<
  Promise<Result | ErrorResult>,
  RootState,
  ExtraArgument,
  Action
>
export type VisitMetaThunk = ThunkAction<
  Promise<VisitResult | ErrorResult>,
  RootState,
  ExtraArgument,
  Action
>

export type DefermentThunk = ThunkAction<
  Promise<void[]>,
  RootState,
  ExtraArgument,
  Action
>

/** A variation of RequestInit except the headers must be a regular object */
export interface BasicRequestInit extends RequestInit {
  headers?: {
    [key: string]: string
  }
}

/**
 * Passed to every page component and also available as part of a NavigationContext:
 *
 * ```js
 * import { NavigationContext } from '@thoughtbot/superglue';
 *
 *
 * const { navigateTo } = useContext(NavigationContext)
 * ```
 *
 * Manually navigate using pages that exists in the store and restores scroll
 * position. `navigateTo` is what {@link Visit} in your `application_visit.js`
 * ultimately calls.
 *
 * If there is an existing page in your store `navigateTo` will restore the props,
 * render the correct component, and return `true`. Otherwise, it will return
 * `false`. This is useful if you want to restore an existing page before making a
 * call to `visit` or `remote`.
 *
 * @param path
 * @param options.action when `none`, `navigateTo` will immediately return `false`
 * @returns `true` if the navigation was a success, `false` if the page was not found in the
 * store.
 */
export type NavigateTo = (
  path: Keypath,
  options?: {
    action?: NavigationAction
    updateContent?: (draft: JSONMappable) => void
  }
) => boolean

/**
 * Superglue comes with a Navigation component that provides a context with
 * access to {@link Visit}, {@link Remote} and other useful tooling.
 *
 * You can also use this to build your own `<Link>` component.
 *
 * @prop pageKey The pagekey that's being used to render the current page
 * component. Useful when used in combination with {@link Remote} to create
 * requests that target the current page.
 * @prop search The current pageKey (current url) query params as an object.
 * @interface
 */
export type CopyTo = (path: Keypath) => void

export type NavigationContextProps = {
  navigateTo: NavigateTo
  copyTo: CopyTo
  visit: ApplicationVisit
  remote: ApplicationRemote
  pageKey: SuperglueState['currentPageKey']
  search: SuperglueState['search']
}

/**
 * Props for the Superglue navigation provider. Installs the history listener,
 * scroll restoration, and provides {@link NavigationContextProps} to its
 * descendants. Wraps `children` so a layout (or any other tree) can sit
 * between the provider and the rendered page.
 * @interface
 */
export type NavigationProviderProps = {
  history: History
  visit: ApplicationVisit
  remote: ApplicationRemote
  children?: React.ReactNode
}

/**
 * Props for the Superglue navigation outlet. Reads the current page from the
 * Superglue store and renders the matching component from `mapping`.
 * @interface
 */
export type NavigationOutletProps = {
  mapping: Record<ComponentIdentifier, React.ComponentType>
}

/**
 * Provide this callback to {@link ApplicationProps} returning a Redux store for
 * Superglue to use. This would be setup and generated for you in `store.js`. We
 * recommend using using Redux toolkit's `configureStore` to build the store.
 *
 * @param initialState - A preconfigured intial state to pass to your store.
 * @param reducer - A preconfigured reducer
 */
export interface BuildStore {
  (initialState: RootState, reducer: typeof rootReducer): SuperglueStore
}

/**
 * Provide this callback to {@link CreateAppArgs}. Receives a context object
 * containing `visit` and `remote` callables.  Customize this function to add
 * progress bars, error reporting (Sentry), or app-specific error-page
 * redirects.
 *
 * Be sure to returns a wrapped `{ visit, remote }` pair that Superglue and UJS
 * use for navigation.
 *
 * @returns A wrapped {@link ApplicationVisit} / {@link ApplicationRemote} pair.
 */
export interface BuildVisitAndRemote {
  (context: BuildVisitAndRemoteContext): {
    visit: ApplicationVisit
    remote: ApplicationRemote
  }
}

/**
 * The context passed to {@link BuildVisitAndRemote}
 *
 * The visit and remote functions in this context will resolve to a VisitResult
 * or ErrorResult.
 */
export interface BuildVisitAndRemoteContext {
  /** Navigates after a successful visit. Bound to the createApp instance. */
  navigateTo: NavigateTo
  /** Pre-bound visit. Returns a discriminated result. */
  visit: (
    path: string,
    options?: VisitProps
  ) => Promise<VisitResult | ErrorResult>
  /** Pre-bound remote. Returns a discriminated result. */
  remote: (path: string, options?: RemoteProps) => Promise<Result | ErrorResult>
}

/**
 * Arguments for {@link createApp}. Combines per-request bootstrap state
 * (`initialPage`, `baseUrl`, `path`) with app-wide config (`mapping`,
 * `history`, `cable`, `buildVisitAndRemote`).
 */
export interface CreateAppArgs {
  /**
   * The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb
   * template, e.g., application/superglue.html.erb
   */
  initialPage: SaveResponse
  /**
   * The base url prefixed to all calls made by `visit` and `remote`.
   */
  baseUrl: string
  /**
   * The path of the current page. It should equal to the `location.pathname` +
   * `location.search` + `location.hash`
   */
  path: string
  /**
   * A mapping between page identifiers and the React components that
   * render them. The {@link Outlet} returned from {@link createApp} reads
   * this mapping when rendering the current page.
   */
  mapping: Record<string, React.ComponentType>
  /**
   * A factory function that returns a `visit` and `remote` function. All
   * of Superglue and UJS will use these functions. You should customize
   * the function, for example, to add a progress bar.
   */
  buildVisitAndRemote: BuildVisitAndRemote
  /**
   * An optional history object https://github.com/remix-run/history. If
   * none is provided Superglue will create one for you.
   */
  history?: History
  /**
   * An optional ActionCable-compatible Consumer used by `useStreamSource`
   * for real-time streaming. Construct this in your application code with
   * `createConsumer` from `@rails/actioncable` or `createCable` from
   * `@anycable/web` and pass it in. If omitted, `useStreamSource` is a
   * no-op.
   */
  cable?: Consumer
  /**
   * Enable Redux DevTools integration. Defaults to `false`.
   */
  devTools?: boolean
}

/**
 * Props for the {@link Provider} component returned from {@link createApp}.
 */
export type ProviderProps = {
  children?: React.ReactNode
}

/**
 * The result of calling {@link createApp}: a `Provider` component that owns
 * the Superglue React tree, an `Outlet` component that renders the current
 * page from the configured `mapping`, and a `ujs` object containing UJS
 * click/submit handlers the caller can attach wherever they choose.
 */
export interface CreateAppResult {
  Provider: React.ComponentType<ProviderProps>
  Outlet: React.ComponentType
  ujs: Handlers
}
