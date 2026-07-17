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

export const buildSuperglueState = (overrides = {}) => ({
  currentPageKey: '/bar',
  search: {},
  assets: [],
  isVisiting: false,
  csrfToken: 'token',
  ...overrides,
})

export const buildSaveResponse = (overrides = {}) => ({
  data: {},
  componentIdentifier: 'test-component',
  assets: [],
  csrfToken: 'token',
  fragments: [],
  defers: [],
  flash: {},
  action: 'savePage',
  renderedAt: Date.now(),
  restoreStrategy: 'fromCacheOnly',
  ...overrides,
})

export const buildGraftResponse = (overrides = {}) => ({
  data: {},
  componentIdentifier: 'test-component',
  assets: [],
  csrfToken: 'token',
  fragments: [],
  defers: [],
  flash: {},
  action: 'graft',
  renderedAt: Date.now(),
  path: '',
  ...overrides,
})

export const buildStreamResponse = (overrides = {}) => ({
  data: [],
  fragments: [],
  assets: [],
  csrfToken: 'token',
  action: 'handleStreamResponse',
  renderedAt: Date.now(),
  flash: {},
  ...overrides,
})

export const buildPage = (overrides = {}) => ({
  ...buildSaveResponse(),
  savedAt: Date.now(),
  ...overrides,
})

export const initialState = () => {
  return {
    superglue: buildSuperglueState(),
  }
}

export const renderWithProvider = (component, store) => {
  return render(<Provider store={store}>{component}</Provider>)
}

export const createProviderWrapper = (store) => {
  return ({ children }) => <Provider store={store}>{children}</Provider>
}
