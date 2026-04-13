import { describe, expect, it } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import { pageEvictionMiddleware } from '../../lib/middleware'

const buildStore = (preloadedState) => {
  return configureStore({
    preloadedState,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(pageEvictionMiddleware),
  })
}

describe('pageEvictionMiddleware', () => {
  it('saves a maximum of 20 pages', () => {
    const pages = {}

    for (var i = 0; i < 20; i++) {
      pages[`/foo${i}`] = {
        data: {},
        csrfToken: 'token',
        assets: ['application-123.js'],
        pageKey: '/foo',
        fragments: [],
        savedAt: i,
      }
    }

    const store = buildStore({
      pages,
      fragments: {},
      superglue: {
        currentPageKey: '/foo0',
        search: {},
        assets: [],
      },
    })

    store.dispatch({
      type: '@@superglue/SAVE_RESPONSE',
      payload: {
        pageKey: '/foo21',
        page: {
          data: {},
          csrfToken: 'token',
          assets: ['application-123.js'],
        },
      },
    })

    const nextState = store.getState().pages
    expect(Object.keys(nextState).length).toEqual(20)
    expect(nextState.hasOwnProperty('/foo21')).toEqual(true)
    expect(nextState.hasOwnProperty('/foo0')).toEqual(false)
  })
})
