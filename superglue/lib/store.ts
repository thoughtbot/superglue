import { configureStore } from '@reduxjs/toolkit'
import { beforeFetch, beforeVisit, beforeRemote } from './actions'
import { rootReducer } from './reducers'
import { createPageEvictionMiddleware } from './middleware'
import { SuperglueStore, ExtraArgument } from './types'
import { LimitedSet } from './utils/limited_set'

export interface StoreResult {
  store: SuperglueStore
  extra: ExtraArgument
}

export function createStore(devTools: boolean = false): StoreResult {
  const extra: ExtraArgument = {
    config: {
      baseUrl: '',
      maxPages: 20,
    },
    lastVisitController: {
      abort: () => {
        // noop
      },
    },
  }

  const store = configureStore({
    devTools,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: extra },
        serializableCheck: {
          ignoredActions: [
            beforeFetch.type,
            beforeVisit.type,
            beforeRemote.type,
          ],
        },
      }).concat(createPageEvictionMiddleware(extra)),
  })

  return { store, extra }
}
