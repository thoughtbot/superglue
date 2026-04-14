import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import { createPageEvictionMiddleware } from '../../lib/middleware'

const defaultExtra = () => ({
  config: { baseUrl: '', maxPages: 20 },
  lastVisitController: { abort: () => {} },
  lastRequestIds: new Set(),
})

const buildStore = (preloadedState, extra) => {
  return configureStore({
    preloadedState,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(createPageEvictionMiddleware(extra)),
  })
}

const defaultSuperglue = {
  currentPageKey: '/',
  search: {},
  assets: [],
}

describe('pageEvictionMiddleware', () => {
  let now

  beforeEach(() => {
    now = 1000
    vi.spyOn(Date, 'now').mockImplementation(() => now++)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('page eviction', () => {
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

      const extra = defaultExtra()
      const store = buildStore(
        {
          pages,
          fragments: {},
          superglue: defaultSuperglue,
        },
        extra
      )

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

  describe('fragment cleanup', () => {
    it('removes orphaned fragments when a page is evicted', () => {
      const extra = defaultExtra()
      extra.config.maxPages = 2

      const store = buildStore(
        {
          pages: {},
          fragments: {},
          superglue: defaultSuperglue,
        },
        extra
      )

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'fragment_a', data: { a: 1 }, pageKey: '/a' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/a',
          page: {
            data: { ref: { __id: 'fragment_a' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'fragment_b', data: { b: 1 }, pageKey: '/b' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/b',
          page: {
            data: { ref: { __id: 'fragment_b' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      expect(store.getState().fragments).toHaveProperty('fragment_a')
      expect(store.getState().fragments).toHaveProperty('fragment_b')

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'fragment_c', data: { c: 1 }, pageKey: '/c' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/c',
          page: {
            data: { ref: { __id: 'fragment_c' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      expect(store.getState().fragments).not.toHaveProperty('fragment_a')
      expect(store.getState().fragments).toHaveProperty('fragment_b')
      expect(store.getState().fragments).toHaveProperty('fragment_c')
    })

    it('keeps fragments shared across pages', () => {
      const extra = defaultExtra()
      extra.config.maxPages = 2

      const store = buildStore(
        {
          pages: {},
          fragments: {},
          superglue: defaultSuperglue,
        },
        extra
      )

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: {
          fragmentId: 'fragment_shared',
          data: { shared: 1 },
          pageKey: '/a',
        },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/a',
          page: {
            data: { ref: { __id: 'fragment_shared' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: {
          fragmentId: 'fragment_shared',
          data: { shared: 1 },
          pageKey: '/b',
        },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/b',
          page: {
            data: { ref: { __id: 'fragment_shared' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'fragment_c', data: { c: 1 }, pageKey: '/c' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/c',
          page: {
            data: { ref: { __id: 'fragment_c' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      expect(store.getState().fragments).toHaveProperty('fragment_shared')
      expect(store.getState().fragments).toHaveProperty('fragment_c')
    })

    it('removes fragments on explicit removePage', () => {
      const extra = defaultExtra()
      const store = buildStore(
        {
          pages: {},
          fragments: {},
          superglue: defaultSuperglue,
        },
        extra
      )

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'frag_1', data: { x: 1 }, pageKey: '/page' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/page',
          page: {
            data: { ref: { __id: 'frag_1' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      expect(store.getState().fragments).toHaveProperty('frag_1')

      store.dispatch({
        type: '@@superglue/REMOVE_PAGE',
        payload: { pageKey: '/page' },
      })

      expect(store.getState().fragments).not.toHaveProperty('frag_1')
    })

    it('copies fragment associations on copyPage', () => {
      const extra = defaultExtra()
      const store = buildStore(
        {
          pages: {},
          fragments: {},
          superglue: defaultSuperglue,
        },
        extra
      )

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'frag_1', data: { x: 1 }, pageKey: '/original' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/original',
          page: {
            data: { ref: { __id: 'frag_1' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      store.dispatch({
        type: '@@superglue/COPY_PAGE',
        payload: { from: '/original', to: '/copy' },
      })

      store.dispatch({
        type: '@@superglue/REMOVE_PAGE',
        payload: { pageKey: '/original' },
      })

      expect(store.getState().fragments).toHaveProperty('frag_1')

      store.dispatch({
        type: '@@superglue/REMOVE_PAGE',
        payload: { pageKey: '/copy' },
      })

      expect(store.getState().fragments).not.toHaveProperty('frag_1')
    })

    it('clears pageFragments on resetStore', () => {
      const extra = defaultExtra()
      const store = buildStore(
        {
          pages: {},
          fragments: {},
          superglue: defaultSuperglue,
        },
        extra
      )

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'frag_1', data: { x: 1 }, pageKey: '/page' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/page',
          page: {
            data: { ref: { __id: 'frag_1' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      store.dispatch({ type: '@@superglue/RESET' })

      expect(store.getState().fragments).toEqual({})

      store.dispatch({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: { fragmentId: 'frag_2', data: { y: 1 }, pageKey: '/new' },
      })
      store.dispatch({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/new',
          page: {
            data: { ref: { __id: 'frag_2' } },
            csrfToken: 't',
            assets: [],
          },
        },
      })

      store.dispatch({
        type: '@@superglue/REMOVE_PAGE',
        payload: { pageKey: '/new' },
      })

      expect(store.getState().fragments).not.toHaveProperty('frag_2')
    })
  })
})
