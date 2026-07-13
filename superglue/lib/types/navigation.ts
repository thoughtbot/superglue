import { JSONMappable } from './json'
import { PageKey, NavigationAction, Keypath, ComponentIdentifier } from './page'
import { SuperglueState } from './store'
import { ApplicationVisit, ApplicationRemote } from './requests'
import { History } from 'history'

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
