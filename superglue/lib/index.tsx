import React, { useRef, useMemo } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { setConfig } from './config'
import { urlToPageKey, ujsHandlers, argsForHistory } from './utils'
import { saveAndProcessPage } from './action_creators'
import {
  historyChange,
  setCSRFToken,
  receiveResponse,
  beforeFetch,
  beforeVisit,
  beforeRemote,
  resetStore,
} from './actions'
import { rootReducer } from './reducers'
import { Provider } from 'react-redux'

import { CableContext, StreamActions } from './hooks/useStreamSource'

import { createBrowserHistory, createMemoryHistory } from 'history'

import { NavigationProvider, NavigationOutlet } from './components/Navigation'
export {
  NavigationProvider,
  NavigationOutlet,
  NavigationContext,
} from './components/Navigation'
export { saveAndProcessPage } from './action_creators'
export {
  beforeFetch,
  beforeVisit,
  beforeRemote,
  copyPage,
  removePage,
  saveResponse,
  receiveResponse,
  resetStore,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
} from './actions'
export * from './types'

import {
  SaveResponse,
  ApplicationProps,
  NavigateTo,
  SuperglueStore,
  SetupProps,
} from './types'
export { superglueReducer, pageReducer, rootReducer } from './reducers'
export { getIn } from './utils/immutability'
export { urlToPageKey }
export * from './hooks'
export { unproxy } from './hooks/useContent'

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

/**
 * The Superglue redux store. Created once at module load and reused for the
 * lifetime of the process. Each Application mount dispatches `resetStore` so
 * tests, SSR requests, and re-mounts all start from a clean slate.
 */
export const store: SuperglueStore = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [beforeFetch.type, beforeVisit.type, beforeRemote.type],
      },
    }),
})

export const prepareStore = (
  store: SuperglueStore,
  initialPage: SaveResponse,
  path: string
) => {
  const initialPageKey = urlToPageKey(path)
  const { csrfToken } = initialPage

  store.dispatch(
    historyChange({
      pageKey: initialPageKey,
    })
  )
  store.dispatch(
    receiveResponse({ pageKey: initialPageKey, response: initialPage })
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
  store.dispatch(resetStore())
  setConfig({ baseUrl })

  const { visit, remote } = buildVisitAndRemote(navigatorRef, store)

  const initialPageKey = urlToPageKey(path)
  const nextHistory = history || createHistory()
  nextHistory.replace(...argsForHistory(path))
  prepareStore(store, initialPage, path)

  const handlers = ujsHandlers({
    visit,
    remote,
    ujsAttributePrefix: 'data-sg',
    store,
  })

  const streamActions = new StreamActions({ store })

  return {
    visit,
    remote,
    nextHistory,
    initialPageKey,
    ujs: handlers,
    streamActions,
  }
}

if (process.env.NODE_ENV !== 'production') {
  console.info(
    '%cSuperglue Development Mode: ' +
      'Remember to build for production before deploying.',
    'font-weight:bold'
  )
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
  buildVisitAndRemote,
  history,
  mapping,
  cable,
  ...rest
}: ApplicationProps) {
  const navigatorRef = useRef<{ navigateTo: NavigateTo } | null>(null)

  const { visit, remote, nextHistory, ujs, streamActions } = useMemo(() => {
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
        <CableContext.Provider value={{ streamActions, cable: cable ?? null }}>
          <NavigationProvider
            ref={navigatorRef}
            visit={visit}
            remote={remote}
            history={nextHistory}
          >
            <NavigationOutlet mapping={mapping} />
          </NavigationProvider>
        </CableContext.Provider>
      </Provider>
    </div>
  )
}

export { Application }
