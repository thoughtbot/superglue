import React from 'react'
import parse from 'url-parse'
import { rootReducer } from './reducers'
import { config } from './config'
import { urlToPageKey, ujsHandlers, argsForHistory } from './utils'
import { saveAndProcessPage } from './action_creators'
import { historyChange, setCSRFToken } from './actions'
import { ConnectedComponent, Provider, connect } from 'react-redux'

import {
  BrowserHistory,
  History,
  createBrowserHistory,
  createMemoryHistory,
} from 'history'

import Nav from './components/Nav'

export {
  beforeFetch,
  beforeVisit,
  beforeRemote,
  SAVE_RESPONSE,
  UPDATE_FRAGMENTS,
  COPY_PAGE,
  REMOVE_PAGE,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
} from './actions'

import { mapStateToProps, mapDispatchToProps } from './utils/react'
import {
  Remote,
  SuperglueStore,
  Handlers,
  Visit,
  VisitResponse,
  PageOwnProps,
  AllPages,
  Page,
  JSONValue,
} from './types'
// export { superglueReducer, pageReducer, rootReducer } from './reducers'
export { fragmentMiddleware } from './middleware'
export { getIn } from './utils/immutability'
export { urlToPageKey }

function pageToInitialState(key: string, page: VisitResponse) {
  const slices = page.slices || {}
  const nextPage: Page = {
    ...page,
    pageKey: key, //TODO remove this
    savedAt: Date.now(),
  }

  return {
    pages: { [key]: nextPage },
    ...slices,
  }
}

function start({
  initialPage,
  baseUrl = config.baseUrl,
  maxPages = config.maxPages,
  path,
}: {
  initialPage: VisitResponse
  baseUrl: string
  maxPages?: number
  path: string
}) {
  const initialPageKey = urlToPageKey(parse(path).href)
  const { csrfToken } = initialPage
  const location = parse(path)

  config.baseUrl = baseUrl
  config.maxPages = maxPages

  return {
    reducer: rootReducer,
    prepareStore: function (store: SuperglueStore) {
      store.dispatch(historyChange({
        pathname: location.pathname,
        search: location.query,
        hash: location.hash,
      }))
      store.dispatch(saveAndProcessPage(initialPageKey, initialPage))
      store.dispatch(setCSRFToken({csrfToken}))
    },
    initialState: pageToInitialState(initialPageKey, initialPage),
    initialPageKey,
  }
}
/**
 * Props for the `ApplicationBase` component
 */
interface ApplicationProps {
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
  /**
   * A store to perform setup on. If none is provided, it will build a basic
   * store.
   */
  store?: SuperglueStore
}

type ConnectedMapping = Record<
  string,
  ConnectedComponent<React.ComponentType, PageOwnProps>
>
/**
 * The entry point to your superglue application. You should create a class
 * (Application) that inherit from the ApplicationBase component and override
 * the {@link buildStore}, {@link mapping}, and {@link visitAndRemote} methods.
 *
 * This would be setup for you when installing Superglue at `application.js`.
 */
export abstract class ApplicationBase extends React.Component<ApplicationProps> {
  private hasWindow: boolean
  private navigatorRef: React.RefObject<Nav>
  private initialPageKey: string
  private store: SuperglueStore
  private history: History
  private connectedMapping: ConnectedMapping
  private ujsHandlers: Handlers
  private visit: Visit
  private remote: Remote

  /**
   * The constructor of the `ApplicationBase` class.
   * @param props
   */
  constructor(props: ApplicationProps) {
    super(props)
    this.hasWindow = typeof window !== 'undefined'

    // Create a navigator Ref for UJS attributes and to enhance the base `visit`
    // and `visit` thunks
    this.navigatorRef = React.createRef()

    // Retrieve initial values and methods to prepare the store.
    const { prepareStore, initialState, initialPageKey, reducer } = start({
      initialPage: this.props.initialPage,
      baseUrl: this.props.baseUrl,
      path: this.props.path,
      // The max number of pages to keep in the store. Default is 20
      // maxPages: 20
    })
    this.initialPageKey = initialPageKey

    // Build the store and pass Superglue's provided reducer to be combined with
    // your reducers located at `application_reducer.js`
    this.store = this.buildStore(initialState, reducer)

    // Fire initial events and populate the store
    prepareStore(this.store)

    // Build history
    this.history = this.createHistory()
    this.history.replace(...argsForHistory(this.props.path))

    const unconnectedMapping = this.mapping()
    const nextMapping: ConnectedMapping = {}
    for (const key in unconnectedMapping) {
      const component = unconnectedMapping[key]
      nextMapping[key] = connect(mapStateToProps, mapDispatchToProps)(component)
    }

    this.connectedMapping = nextMapping

    // Build visit and remote thunks
    // Your modified `visit` and `remote` will get passed below to the
    // Nav component then to your components
    //
    // You can access them via `this.props.visit` or `this.props.remote`. In
    // your page components
    const { visit, remote } = this.visitAndRemote(this.navigatorRef, this.store)
    this.visit = visit
    this.remote = remote
  }

  /**
   * Override this method to return a visit and remote function. These functions
   * will be used by Superglue to power its UJS attributes and passed to your
   * page components. You may customize this functionality to your liking, e.g,
   * adding a progress bar.
   *
   * @param navigatorRef
   * @param store
   *
   * @returns
   */
  abstract visitAndRemote(
    // eslint-disable-next-line
    navigatorRef: React.RefObject<Nav>,
    store: SuperglueStore
  ): { visit: Visit; remote: Remote }

  componentDidMount(): void {
    const { appEl } = this.props
    // Create the ujs event handlers. You can change the ujsAttributePrefix
    // in the event the data attribute conflicts with another.
    this.ujsHandlers = ujsHandlers({
      visit: this.visit,
      remote: this.remote,
      ujsAttributePrefix: 'data-sg',
    })
    const { onClick, onSubmit } = this.ujsHandlers

    appEl.addEventListener('click', onClick)
    appEl.addEventListener('submit', onSubmit)
  }

  componentWillUnmount(): void {
    const { appEl } = this.props
    const { onClick, onSubmit } = this.ujsHandlers

    appEl.removeEventListener('click', onClick)
    appEl.removeEventListener('submit', onSubmit)
  }

  /**
   * Override this method and return a Redux store for Superglue to use. This
   * would be setup and generated for you in `store.js`. We recommend using
   * using Redux toolkit's `configureStore` to build the store.
   *
   * @param initialState - A preconfigured intial state to pass to your store.
   * @param reducer - A preconfigured reducer
   */
  abstract buildStore(
    initialState: { pages: AllPages; [key: string]: JSONValue },
    reducer: typeof rootReducer
  ): SuperglueStore

  createHistory(): BrowserHistory {
    if (this.hasWindow) {
      // This is used for client side rendering
      return createBrowserHistory({})
    } else {
      // This is used for server side rendering
      return createMemoryHistory({})
    }
  }

  /**
   * Override this method and return a mapping between a componentIdentifier and
   * a PageComponent. This will be passed to Superglue to determine which Page component
   * to render with which payload.
   *
   * @returns
   */
  abstract mapping(): Record<string, React.ComponentType>

  render(): JSX.Element {
    // The Nav component is pretty bare and can be inherited from for custom
    // behavior or replaced with your own.
    return (
      <Provider store={this.store}>
        <Nav
          store={this.store}
          ref={this.navigatorRef}
          visit={this.visit}
          remote={this.remote}
          mapping={this.connectedMapping}
          history={this.history}
          initialPageKey={this.initialPageKey}
        />
      </Provider>
    )
  }
}
