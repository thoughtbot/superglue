import {
  VisitProps,
  RemoteProps,
  ApplicationVisit,
  ApplicationRemote,
  Result,
  ErrorResult,
  VisitResult,
} from './requests'
import { History } from 'history'
import { rootReducer } from '../reducers'
import { JSONMappable } from './json'
import {
  PageKey,
  ComponentIdentifier,
  Keypath,
  NavigationAction,
  SaveResponse,
} from './page'
import {
  RootState,
  SuperglueState,
  SuperglueStore,
} from './store'

import { Consumer } from './cable'

export * from './requests'
export * from './cable'
export * from './actions'
export * from './json'
export * from './page'
export * from './fragment'
export * from './store'
export * from './thunks'

// I can do Visit['props'] or better yet Visit['options']

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
 * Provide this callback to {@link CreateAppArgs} returning a Redux store for
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
 * Arguments for `createApp`. Combines per-request bootstrap state
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
   * render them. The `Outlet` returned from `createApp` reads
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
 * Props for the `Provider` component returned from `createApp`.
 */
export type ProviderProps = {
  children?: React.ReactNode
}

/**
 * The result of calling `createApp`: a `Provider` component that owns
 * the Superglue React tree, an `Outlet` component that renders the current
 * page from the configured `mapping`, and a `ujs` object containing UJS
 * click/submit handlers the caller can attach wherever they choose.
 */
export interface CreateAppResult {
  Provider: React.ComponentType<ProviderProps>
  Outlet: React.ComponentType
  ujs: Handlers
}
