import { describe, expect, afterEach, it, vi } from 'vitest'
import configureMockStore from 'redux-mock-store'
import { withExtraArgument } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import {
  visit,
  remote,
  beforeFetch,
  handleError,
} from '../../lib/action_creators'
import * as helpers from '../../lib/utils/helpers'
import * as rsp from '../../spec/fixtures'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import { MismatchedComponentError } from '../../lib/action_creators'

const defaultExtra = () => ({
  config: { baseUrl: 'https://example.com', maxPages: 20 },
  lastVisitController: { abort: () => {} },
})

const buildStore = (preloadedState) => {
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

const allSuperglueActions = (store) => {
  return store
    .getState()
    .results.filter((action) => !action.type.startsWith('@@redux'))
}

const middlewares = [withExtraArgument(defaultExtra())]
const mockStore = configureMockStore(middlewares)
const delay = (duration) => {
  return new Promise((res, rej) => setTimeout(res, duration))
}
const initialState = () => {
  return {
    superglue: {
      currentPageKey: '/bar',
      csrfToken: 'token',
    },
  }
}

const successfulBody = () => {
  return JSON.stringify({
    data: { heading: 'Some heading 2' },
    csrfToken: 'token',
    assets: [],
    defers: [],
    fragments: [],
  })
}

const successfulStreamResponseBody = () => {
  return JSON.stringify({
    data: [
      {
        type: 'message',
        data: {
          heading: {
            title: 'hello',
            comment: { rating: 'great!' },
          },
        },
        fragmentIds: ['top'],
        action: 'update',
        options: {},
      },
    ],
    csrfToken: 'token',
    assets: [],
    fragments: [
      {
        type: 'comment',
        path: 'data.0.data.heading.comment',
      },
    ],
    action: 'handleStreamResponse',
  })
}

fetchMock.mock()

describe('action creators', () => {
  it.todo('beforeFetch')
  it.todo('handleError')
})
