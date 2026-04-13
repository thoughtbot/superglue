import React, { RefObject } from 'react'
import { setConfig } from './config'
import { urlToPageKey, ujsHandlers, argsForHistory } from './utils'
import { saveAndProcessPage } from './action_creators'
import { webVisit, webRemote } from './action_creators/web'
import {
  historyChange,
  setCSRFToken,
  receiveResponse,
  resetStore,
} from './actions'
import { store } from './store'
import { Provider as ReduxProvider } from 'react-redux'

import { CableContext, StreamActions } from './hooks/useStreamSource'

import { History, createBrowserHistory, createMemoryHistory } from 'history'

import { NavigationProvider, NavigationOutlet } from './components/Navigation'
export {
  NavigationProvider,
  NavigationOutlet,
  NavigationContext,
} from './components/Navigation'
export { webVisit, webRemote } from './action_creators/web'
export { SuperglueResponseError } from './utils/request'
export * from './types'

import {
  NavigateTo,
  CreateAppArgs,
  CreateAppResult,
  ProviderProps,
} from './types'
export { getIn } from './utils/immutability'
export { urlToPageKey }
export * from './hooks'
export { unproxy } from './hooks/useContent'

const hasWindow = typeof window !== 'undefined'

const createHistory = (): History => {
  if (hasWindow) {
    // This is used for client side rendering
    return createBrowserHistory({})
  } else {
    // This is used for server side rendering
    return createMemoryHistory({})
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
 * Bootstrap a Superglue application. Performs all of the per-request setup
 * (resetting the store, building visit/remote, installing history, seeding
 * the initial page) and returns a `{ Provider, Outlet }` pair the caller can
 * arrange in their own React tree.
 *
 * ```jsx
 * const { Provider, Outlet, ujs } = createApp({
 *   initialPage: window.SUPERGLUE_INITIAL_PAGE_STATE,
 *   baseUrl: location.origin,
 *   path: location.pathname + location.search + location.hash,
 *   mapping: pageIdentifierToPageComponent,
 *   buildVisitAndRemote,
 * })
 *
 * createRoot(el).render(
 *   <div onClick={ujs.onClick} onSubmit={ujs.onSubmit}>
 *     <Provider>
 *       <AppLayout>
 *         <Outlet />
 *       </AppLayout>
 *     </Provider>
 *   </div>
 * )
 * ```
 */
export function createApp({
  initialPage,
  baseUrl,
  path,
  mapping,
  buildVisitAndRemote,
  history,
  cable,
}: CreateAppArgs): CreateAppResult {
  store.dispatch(resetStore())
  setConfig({ baseUrl })

  const navigatorRef: RefObject<{ navigateTo: NavigateTo } | null> = {
    current: null,
  }

  const navigateTo: NavigateTo = (pageKey, options) => {
    if (!navigatorRef.current) {
      console.warn(
        '[superglue] navigateTo called before <Provider /> mounted; no-op'
      )
      return false
    }
    return navigatorRef.current.navigateTo(pageKey, options)
  }

  const { visit, remote } = buildVisitAndRemote({
    navigateTo,
    visit: (path, options) => webVisit(store, path, options),
    remote: (path, options) => webRemote(store, path, options),
  })

  const resolvedHistory = history || createHistory()
  resolvedHistory.replace(...argsForHistory(path))

  const initialPageKey = urlToPageKey(path)
  const { csrfToken } = initialPage
  store.dispatch(historyChange({ pageKey: initialPageKey }))
  store.dispatch(
    receiveResponse({ pageKey: initialPageKey, response: initialPage })
  )
  store.dispatch(saveAndProcessPage(initialPageKey, initialPage))
  store.dispatch(setCSRFToken({ csrfToken }))

  const ujs = ujsHandlers({
    visit,
    remote,
    ujsAttributePrefix: 'data-sg',
    store,
  })

  const streamActions = new StreamActions({ store })

  function Provider({ children }: ProviderProps) {
    return (
      <ReduxProvider store={store}>
        <CableContext.Provider value={{ streamActions, cable: cable ?? null }}>
          <NavigationProvider
            ref={navigatorRef}
            visit={visit}
            remote={remote}
            history={resolvedHistory}
          >
            {children}
          </NavigationProvider>
        </CableContext.Provider>
      </ReduxProvider>
    )
  }

  function Outlet() {
    return <NavigationOutlet mapping={mapping} />
  }

  return { Provider, Outlet, ujs }
}
