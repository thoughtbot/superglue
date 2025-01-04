import React, { useRef, useMemo } from 'react'
import parse from 'url-parse'
import { config } from './config'
import { urlToPageKey, ujsHandlers, argsForHistory } from './utils'
import { saveAndProcessPage } from './action_creators'
import { historyChange, setCSRFToken } from './actions'
import { Provider } from 'react-redux'

import { createBrowserHistory, createMemoryHistory } from 'history'

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

import {
  VisitResponse,
  ApplicationProps,
  NavigateTo,
  SuperglueStore,
  SetupProps,
} from './types'
export { superglueReducer, pageReducer, rootReducer } from './reducers'
export { getIn } from './utils/immutability'
export { urlToPageKey }
export * from './hooks'

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

export const prepareStore = (
  store: SuperglueStore,
  initialPage: VisitResponse,
  path: string
) => {
  const location = parse(path)
  const initialPageKey = urlToPageKey(location.href)
  const { csrfToken } = initialPage

  store.dispatch(
    historyChange({
      pageKey: initialPageKey,
    })
  )
  store.dispatch(saveAndProcessPage(initialPageKey, initialPage))
  store.dispatch(setCSRFToken({ csrfToken }))
}

/**
 * This is the setup function that the Application calls. Use this function if
 * you like to build your own Application component.
 */
export const setup = ({
  initialPage,
  baseUrl,
  path,
  store,
  buildVisitAndRemote,
  history,
  navigatorRef,
}: SetupProps) => {
  config.baseUrl = baseUrl

  const { visit, remote } = buildVisitAndRemote(navigatorRef, store)

  const initialPageKey = urlToPageKey(parse(path).href)
  const nextHistory = history || createHistory()
  nextHistory.replace(...argsForHistory(path))
  prepareStore(store, initialPage, path)

  const handlers = ujsHandlers({
    visit,
    remote,
    ujsAttributePrefix: 'data-sg',
    store,
  })

  return {
    visit,
    remote,
    nextHistory,
    initialPageKey,
    ujs: handlers,
  }
}

/**
 * The entry point to your superglue application. It sets up the redux Provider,
 * redux state and the Navigation component.
 *
 * This is a simple component, you can override this by copying the source code and
 * use the exported methods used by this component (`start` and `ujsHandler`).
 */
function Application({
  initialPage,
  baseUrl,
  path,
  store,
  buildVisitAndRemote,
  history,
  mapping,
  ...rest
}: ApplicationProps) {
  const navigatorRef = useRef<{ navigateTo: NavigateTo } | null>(null)

  const { visit, remote, nextHistory, initialPageKey, ujs } = useMemo(() => {
    return setup({
      initialPage,
      baseUrl,
      path,
      store,
      buildVisitAndRemote,
      history,
      navigatorRef,
    })
  }, [])

  // The Nav component is pretty bare and can be inherited from for custom
  // behavior or replaced with your own.
  return (
    <div onClick={ujs.onClick} onSubmit={ujs.onSubmit} {...rest}>
      <Provider store={store}>
        <NavigationProvider
          ref={navigatorRef}
          visit={visit}
          remote={remote}
          mapping={mapping}
          history={nextHistory}
          initialPageKey={initialPageKey}
        />
      </Provider>
    </div>
  )
}

export { Application }
