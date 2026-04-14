import { configureStore } from '@reduxjs/toolkit'
import { beforeFetch, beforeVisit, beforeRemote } from './actions'
import { rootReducer } from './reducers'
import { createPageEvictionMiddleware } from './middleware'
import { SuperglueStore } from './types'

export function createStore(): SuperglueStore {
  return configureStore({
    devTools: process.env.NODE_ENV !== 'production',
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            beforeFetch.type,
            beforeVisit.type,
            beforeRemote.type,
          ],
        },
      }).concat(createPageEvictionMiddleware()),
  })
}
