import { configureStore } from '@reduxjs/toolkit'
import { pagesSlice } from "./slices/pages"
import { flashSlice } from "./slices/flash"
import {
  beforeVisit,
  beforeFetch,
  beforeRemote,
} from '@thoughtbot/superglue'

export const buildStore = (initialState, reducer) => {
  const {pages, superglue} = reducer

  return configureStore({
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [beforeFetch.type, beforeVisit.type, beforeRemote.type],
        },
      }),
    reducer: {
      superglue,
      pages: (state, action) => {
        const nextState = pages(state, action)
        return pagesSlice.reducer(nextState, action)
      },
      flash: flashSlice.reducer
    },
  });
};

