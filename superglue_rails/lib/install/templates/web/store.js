import { configureStore } from '@reduxjs/toolkit'
import { pagesSlice } from "./slices/pages"
import { flashSlice } from "./slices/flash"
import {
  BEFORE_VISIT,
  BEFORE_FETCH,
  BEFORE_REMOTE,
  fragmentMiddleware
} from '@thoughtbot/superglue'

export const buildStore = (initialState, superglueReducer, supergluePagesReducer) => {

  return configureStore({
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [BEFORE_VISIT, BEFORE_FETCH, BEFORE_REMOTE],
        },
      }).concat(fragmentMiddleware),
    reducer: {
      superglue: superglueReducer,
      pages: (state, action) => {
        const nextState = supergluePagesReducer(state, action)
        return pagesSlice.reducer(nextState, action)
      },
      flash: flashSlice.reducer
    },
  });
};

