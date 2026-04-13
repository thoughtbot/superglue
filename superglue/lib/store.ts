import { configureStore } from '@reduxjs/toolkit'
import { beforeFetch, beforeVisit, beforeRemote } from './actions'
import { rootReducer } from './reducers'
import { pageEvictionMiddleware } from './middleware'
import { SuperglueStore } from './types'

/**
 * The Superglue redux store. Created once at module load and reused for the
 * lifetime of the process. Each `createApp` call dispatches `resetStore` so
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
    }).concat(pageEvictionMiddleware),
})
