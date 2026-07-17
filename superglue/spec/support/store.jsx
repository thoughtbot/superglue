import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'

export const defaultExtra = () => ({
  config: { baseUrl: 'https://example.com', maxPages: 20 },
  lastVisitController: { abort: () => {} },
})

export const buildStore = (preloadedState) => {
  let resultsReducer = (state = [], action) => {
    return state.concat([action])
  }

  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
      results: resultsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: defaultExtra() },
      }),
  })
}

export const buildSimpleStore = (preloadedState) => {
  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
    },
  })
}

export const allSuperglueActions = (store) => {
  return store
    .getState()
    .results.filter((action) => !action.type.startsWith('@@redux'))
}

export const initialState = () => {
  return {
    superglue: {
      currentPageKey: '/bar',
      csrfToken: 'token',
    },
  }
}

export const renderWithProvider = (component, store) => {
  return render(<Provider store={store}>{component}</Provider>)
}

export const createProviderWrapper = (store) => {
  return ({ children }) => <Provider store={store}>{children}</Provider>
}
