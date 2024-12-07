import { FetchArgs } from './actions'
import type { Action } from '@reduxjs/toolkit'
import { EnhancedStore, Tuple, StoreEnhancer } from '@reduxjs/toolkit'
import { ThunkDispatch } from '@reduxjs/toolkit'
import { ThunkAction } from '@reduxjs/toolkit'
import { ConnectedComponent } from 'react-redux'
import {
  VisitProps,
  RemoteProps,
  ApplicationVisit,
  ApplicationRemote,
} from './requests'
import { History } from 'history'
import { rootReducer } from '../reducers'
import { NavigationProvider } from '../components/Navigation'

export * from './requests'
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

// todo: change rsp to response

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
 * The VisitResponse is a protocol, a shape that is responsible for full page
 * visits in Superglue. Its meant to be implemented by the server and if you are
 * using superglue_rails, the generators would have generated a props_template
 * layout and view that would shape the visit responses for you.
 */
export type VisitResponse<T = JSONMappable> = {
  data: T
  componentIdentifier: ComponentIdentifier
  assets: string[]
  csrfToken?: string
  fragments: Fragment[]
  defers: Defer[]
  slices: JSONObject

  renderedAt: number
  restoreStrategy: RestoreStrategy
}

/**
 * A Page is a VisitResponse that's been saved to the store
 */
export type Page<T = JSONMappable> = VisitResponse<T> & {
  savedAt: number
  pageKey: PageKey
}

/**
 * The GraftResponse is a protocol, a shape that is responsible for partial
 * updates using props_template's digging functionality in Superglue. Its meant
 * to be implemented by the server and if you are using superglue_rails, the
 * generators would have generated a props_template layout and view that would
 * shape the graft responses for you.
 *
 * @property path Used by superglue to replace the data at that location.
 * @property equals to `graft` to indicate a {@link GraftResponse}
 * @interface
 */
export type GraftResponse<T = JSONMappable> = VisitResponse<T> & {
  action: 'graft'
  path: Keypath
}

/**
 * A PageResponse can be either a {@link GraftResponse} or a {@link VisitResponse}.
 * Its meant to be implemented by the server and if you are using
 * superglue_rails, the generators will handle both cases.
 */
export type PageResponse = GraftResponse | VisitResponse

/**
 * A Fragment identifies a cross cutting concern, like a shared header or footer.
 * @prop type A user supplied string identifying a fragment. This is usually created using
 * [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments)
 * @prop path A Keypath specifying the location of the fragment
 * @interface
 */
export type Fragment = {
  type: string
  path: Keypath
}

/**
 * The store where all page responses are stored indexed by PageKey. You are encouraged
 * to mutate the Pages in this store.
 */
export type AllPages<T = JSONMappable> = Record<PageKey, Page<T>>

/**
 * A read only state that contains meta information about
 * the current page.
 */
export interface SuperglueState {
  /** The {@link PageKey} of the current page. This can be pass to {@link Remote}.*/
  currentPageKey: PageKey
  /** The pathname of the current url.*/
  pathname: string
  /** The query string of the current url.*/
  search: string
  /** The hash of the current url.*/
  hash: string
  /** The Rails csrfToken that you can use for forms.*/
  csrfToken: string
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
}

/**
 * Helpful props passed to the page component.
 */
export interface PageOwnProps {
  /** the pagekey of the current page */
  pageKey: PageKey
  navigateTo: NavigateTo
  visit: ApplicationVisit
  remote: ApplicationRemote
}

/**
 * Your Page's content in the data node in {@link VisitResponse} merged with additional
 * helpers
 */
export type Content = PageOwnProps & {
  pageKey: PageKey
  fragments: Fragment[]
  csrfToken?: string
  [key: string]: unknown
}

/**
 * Meta is passed to the Promise when visit or remote
 * resolves and contains additional information for
 * navigation.
 */
export interface Meta {
  /**
   * The URL of the response converted to a pageKey. Superglue uses this to
   * persist the {@link VisitResponse} to store, when that happens.
   */
  pageKey: PageKey
  /** The {@link VisitResponse} of the page */
  page: VisitResponse
  /** Indicates if response was redirected */
  redirected: boolean
  /** The original response object*/
  rsp: Response
  /** The original args passed to fetch.*/
  fetchArgs: FetchArgs
  /** The {@link ComponentIdentifier} extracted from the response.*/
  componentIdentifier: ComponentIdentifier
  /** `true` when assets locally are detected to be out of date */
  needsRefresh: boolean
  /** The {@link NavigationAction}. This can be used for navigation.*/
  navigationAction?: NavigationAction
}

// I can do Visit['props'] or better yet Visit['options']

/**
 * VisitCreator is a Redux action creator that returns a thunk. Use this to build
 * the {@link Visit} function. Typically its already generated in `application_visit.js`
 */
export type VisitCreator = (
  input: string | PageKey,
  options: VisitProps
) => MetaThunk

/**
 * RemoteCreator is a Redux action creator that returns a thunk. Use this to build
 * the {@link Remote} function. Typically its already generated in `application_visit.js`
 */
export type RemoteCreator = (
  input: string | PageKey,
  options: RemoteProps
) => MetaThunk

export type Dispatch = ThunkDispatch<RootState, undefined, Action>

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
  onClick: (event: MouseEvent) => void
  onSubmit: (event: Event) => void
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
  undefined,
  Action
>

export type MetaThunk = ThunkAction<Promise<Meta>, RootState, undefined, Action>

export type DefermentThunk = ThunkAction<
  Promise<void[]>,
  RootState,
  undefined,
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
 * @param options.ownProps additional props that will be passed to the page component
 * @returns `true` if the navigation was a success, `false` if the page was not found in the
 * store.
 */
export type NavigateTo = (
  path: Keypath,
  options: {
    action: NavigationAction
    ownProps: Record<string, unknown>
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
 * @interface
 */
export type NavigationContextProps = {
  navigateTo: NavigateTo
  visit: ApplicationVisit
  remote: ApplicationRemote
  pageKey: PageKey
}

/**
 * This is the navigation component that gets used by {@link ApplicationProps}. The component
 * takes a mapping of page components and swaps them when navigating and passes
 * {@link NavigateTo} to all page components.
 *
 * @prop initialPageKey The {@link PageKey} that's to be used when first rendering. Used to
 * determine the initial page component to show.
 * @interface
 */
export type NavigationProviderProps = {
  history: History
  visit: ApplicationVisit
  remote: ApplicationRemote
  mapping: Record<
    ComponentIdentifier,
    ConnectedComponent<React.ComponentType, PageOwnProps>
  >
  initialPageKey: PageKey
}

export type ConnectedMapping = Record<
  ComponentIdentifier,
  ConnectedComponent<React.ComponentType, PageOwnProps>
>

/**
 * Provide this callback to {@link ApplicationProps} returning a Redux store for
 * Superglue to use. This would be setup and generated for you in `store.js`. We
 * recommend using using Redux toolkit's `configureStore` to build the store.
 *
 * @param initialState - A preconfigured intial state to pass to your store.
 * @param reducer - A preconfigured reducer
 */
export interface BuildStore {
  (
    initialState: { pages: AllPages; [key: string]: JSONValue },
    reducer: typeof rootReducer
  ): SuperglueStore
}

/**
 * Provide this callback to {@link ApplicationProps} returning a visit and remote
 * function. These functions will be used by Superglue to power its UJS
 * attributes and passed to your page components and {@link NavigationContextProps}.
 * You may customize this functionality to your liking, e.g, adding a progress
 * bar.
 *
 * @param navigatorRef
 * @param store
 *
 * @returns
 */
export interface BuildVisitAndRemote {
  (
    navigatorRef: React.RefObject<typeof NavigationProvider>,
    store: SuperglueStore
  ): {
    visit: ApplicationVisit
    remote: ApplicationRemote
  }
}

/**
 * Props for the `Application` component
 */
export interface ApplicationProps {
  /**
   * The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb
   * template, e.g., index.html.erb
   */
  initialPage: VisitResponse
  /**
   * The base url prefixed to all calls made by `visit` and
   * `remote`.
   */
  baseUrl: string
  /**
   * The path of the current page. It should equal to the `location.pathname` +
   * `location.search` + `location.hash`
   */
  path: string
  /**
   * The app element that was passed to React's `createRoot`. This will be used
   * to setup UJS helpers.
   */
  appEl: HTMLElement
  buildStore: BuildStore
  buildVisitAndRemote: BuildVisitAndRemote
  mapping: Record<string, React.ComponentType>
  history: History
}
