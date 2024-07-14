import React from 'react'
import parse from 'url-parse'
import { rootReducer } from './reducers'
import { config } from './config'
import { urlToPageKey, ujsHandlers, argsForHistory } from './utils'
import { saveAndProcessPage } from './action_creators'
import { HISTORY_CHANGE, SET_CSRF_TOKEN } from './actions'
import { ConnectedComponent, Provider, connect } from 'react-redux'

import {
  BrowserHistory,
  History,
  createBrowserHistory,
  createMemoryHistory,
} from 'history'

import Nav from './components/Nav'

export {
  BEFORE_FETCH,
  BEFORE_VISIT,
  BEFORE_REMOTE,
  SAVE_RESPONSE,
  UPDATE_FRAGMENTS,
  COPY_PAGE,
  REMOVE_PAGE,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
  HISTORY_CHANGE,
} from './actions'

export {
  mapStateToProps,
  mapDispatchToProps,
  mapDispatchToPropsIncludingVisitAndRemote,
} from './utils/react'
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
export { superglueReducer, pageReducer, rootReducer } from './reducers'
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
      store.dispatch({
        type: HISTORY_CHANGE,
        payload: {
          pathname: location.pathname,
          search: location.query,
          hash: location.hash,
        },
      })
      store.dispatch(saveAndProcessPage(initialPageKey, initialPage))
      store.dispatch({ type: SET_CSRF_TOKEN, payload: { csrfToken } })
    },
    initialState: pageToInitialState(initialPageKey, initialPage),
    initialPageKey,
  }
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

interface Props {
  initialPage: VisitResponse
  baseUrl: string
  path: string
  appEl: HTMLElement
}

type ConnectedMapping = Record<
  string,
  ConnectedComponent<React.ComponentType, PageOwnProps>
>

export abstract class ApplicationBase extends React.Component<Props> {
  public hasWindow: boolean
  public navigatorRef: React.RefObject<Nav>
  public initialPageKey: string
  public store: SuperglueStore
  public history: History
  public connectedMapping: ConnectedMapping
  public ujsHandlers: Handlers
  public visit: Visit
  public remote: Remote

  constructor(props: Props) {
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

  visitAndRemote(
    // eslint-disable-next-line
    navigatorRef: React.RefObject<Nav>,
    store: SuperglueStore
  ): { visit: Visit; remote: Remote } {
    throw new NotImplementedError('Implement this')
  }

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
