import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react'
import parse from 'url-parse'
import { rootReducer } from './reducers'
import { config } from './config'
import { urlToPageKey, ujsHandlers, argsForHistory } from './utils'
import { saveAndProcessPage } from './action_creators'
import { Provider, connect } from 'react-redux'

import { History, createBrowserHistory, createMemoryHistory } from 'history'

import { NavigationProvider } from './components/Navigation'
export { NavigationProvider, NavigationContext } from './components/Navigation'
export { saveAndProcessPage } from './action_creators'
export {
  beforeFetch,
  beforeVisit,
  beforeRemote,
  updateFragments,
  copyPage,
  removePage,
  saveResponse,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
} from './actions'
export * from './types'

import { mapStateToProps, mapDispatchToProps } from './utils/react'
import {
  VisitResponse,
  AllPages,
  BuildVisitAndRemote,
  BuildStore,
  ConnectedMapping,
  ApplicationProps,
  NavigateTo,
  SuperglueState
} from './types'
export { superglueReducer, pageReducer, rootReducer } from './reducers'
export { getIn } from './utils/immutability'
export { urlToPageKey }
export { usePage, useSuperglue } from './hooks'

const hasWindow = typeof window !== 'undefined'

const createHistory = () => {
  if (hasWindow) {
    // This is used for client side rendering
    return createBrowserHistory({})
  } else {
    // This is used for server side rendering
    return createMemoryHistory({})
  }
}
type InitialState = {
  pages: AllPages,
  superglue: SuperglueState
  [name: string]: unknown
}

export function start(
  initialPage: VisitResponse,
  baseUrl: string,
  path: string,
  buildStore: BuildStore,
  mapping: Record<string, React.ComponentType>,
  buildVisitAndRemote: BuildVisitAndRemote,
  navigatorRef: React.RefObject<{ navigateTo: NavigateTo }>,
  history: History
) {
  const initialPageKey = urlToPageKey(parse(path).href)
  const { csrfToken } = initialPage
  const location = parse(path)

  config.baseUrl = baseUrl
  const reducer = rootReducer

  const pathname = location.pathname
  const search = location.query
  const hash = location.hash
  const currentPageKey = urlToPageKey(pathname + search)
  const initialSuperglueState = {
    pathname,
    currentPageKey,
    search,
    hash,
    assets: initialPage.assets,
    csrfToken
  }

  const initialState : InitialState = {
    pages: {
      [initialPageKey]: {
        ...initialPage,
        pageKey: initialPageKey,
        savedAt: Date.now()
      }
    },
    superglue: initialSuperglueState,
    ...initialPage.slices
  }

  // Fire initial events
  const store = buildStore(initialState, reducer)
  store.dispatch(saveAndProcessPage(initialPageKey, initialPage))

  history.replace(...argsForHistory(path))

  const unconnectedMapping = mapping
  const nextMapping: ConnectedMapping = {}
  for (const key in unconnectedMapping) {
    const component = unconnectedMapping[key]
    nextMapping[key] = connect(mapStateToProps, mapDispatchToProps)(component)
  }

  const connectedMapping = nextMapping
  const { visit, remote } = buildVisitAndRemote(navigatorRef, store)

  return {
    store,
    visit,
    remote,
    connectedMapping,
    history,
    initialPageKey,
  }
}

/**
 * The entry point to your superglue application. It sets up the redux Provider,
 * redux state and the Navigation component.
 *
 * This is a simple component, you can override this by copying the source code and
 * use the exported methods used by this component (`start` and `ujsHandler`).
 */
const Application = forwardRef(function Application(
  {
    initialPage,
    baseUrl,
    path,
    buildStore,
    buildVisitAndRemote,
    history,
    mapping,
    appEl,
  }: ApplicationProps,
  ref
) {
  const navigatorRef = useRef<{ navigateTo: NavigateTo }>(null)

  history = history || createHistory()

  const { store, visit, remote, connectedMapping, initialPageKey } = start(
    initialPage,
    baseUrl,
    path,
    buildStore,
    mapping,
    buildVisitAndRemote,
    navigatorRef,
    history
  )

  useImperativeHandle(
    ref,
    () => {
      return {
        store,
      }
    },
    []
  )
  const handlers = ujsHandlers({
    visit,
    remote,
    ujsAttributePrefix: 'data-sg',
    store,
  })

  useEffect(() => {
    const { onClick, onSubmit } = handlers
    appEl.addEventListener('click', onClick)
    appEl.addEventListener('submit', onSubmit)

    return () => {
      appEl.removeEventListener('click', onClick)
      appEl.removeEventListener('submit', onSubmit)
    }
  })

  // The Nav component is pretty bare and can be inherited from for custom
  // behavior or replaced with your own.
  return (
    <Provider store={store}>
      <NavigationProvider
        ref={navigatorRef}
        visit={visit}
        remote={remote}
        mapping={connectedMapping}
        history={history}
        initialPageKey={initialPageKey}
      />
    </Provider>
  )
})

export { Application }
