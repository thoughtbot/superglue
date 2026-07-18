import { History } from 'history'
import { SaveResponse } from './page'
import {
  VisitProps,
  RemoteProps,
  ApplicationVisit,
  ApplicationRemote,
  VisitResult,
  Result,
  ErrorResult,
} from './requests'
import { SuperglueStore, RootState } from './store'
import { NavigateTo } from './navigation'
import { Consumer } from './cable'
import { rootReducer } from '../reducers'

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
