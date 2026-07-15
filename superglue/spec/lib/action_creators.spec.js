import { describe, expect, afterEach, it, vi } from 'vitest'
import configureMockStore from 'redux-mock-store'
import { withExtraArgument } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import {
  visit,
  remote,
  beforeFetch,
  handleError,
  saveAndProcessPage,
} from '../../lib/action_creators'
import { handleGraft, saveResponse } from '../../lib/actions'
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
  describe('saveResponse', () => {
    it('fires SAVE_RESPONSE', () => {
      const pageKey = '/test'
      const page = { foo: 'bar' }

      const action = saveResponse({
        pageKey,
        page,
      })

      expect(action).toEqual({
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey,
          page,
        },
      })
    })
  })

  describe('handleGraft', () => {
    it('fires HANDLE_GRAFT', () => {
      const pageKey = '/test'
      const node = { d: 'foo' }
      const pathToNode = 'a.b'
      const fragments = [{ foo: ['bar'] }]
      const page = {
        data: {
          d: 'foo',
        },
        path: 'a.b',
        fragments: [['foo', 'bar']],
      }

      const action = handleGraft({
        pageKey,
        page,
      })

      expect(action).toEqual({
        type: '@@superglue/HANDLE_GRAFT',
        payload: { pageKey, page },
      })
    })
  })

  describe('saveAndProcessPage', () => {
    afterEach(() => {
      fetchMock.reset()
      fetchMock.restore()
    })

    it('fires SAVE_RESPONSE and process a page', () => {
      const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        fragments: [],
      }
      const store = buildStore(initialState())
      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: { heading: 'Some heading 2' },
              csrfToken: 'token',
              assets: [],
              fragments: [],
            },
          },
        },
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    it('uses existing deferred nodes as placeholders when there is already a page in the store', () => {
      const initialState = () => {
        return {
          pages: {
            '/foo': {
              data: {
                foo: {
                  bar: {
                    greetings: 'hello world',
                  },
                },
              },
              defers: [
                { url: '/foo?props_at=data.foo.bar', path: 'data.foo.bar' },
              ],
              fragments: [],
            },
          },
          superglue: {
            currentPageKey: '/bar',
            csrfToken: 'token',
          },
        }
      }

      const store = buildStore(initialState())

      const receivedPage = {
        data: {
          foo: {
            baz: { name: 'john' },
            bar: {},
          },
        },
        defers: [{ url: '/foo?props_at=data.foo.bar', path: 'data.foo.bar' }],
        fragments: [],
        action: 'savePage',
      }

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: {
                foo: {
                  baz: { name: 'john' },
                  bar: {
                    greetings: 'hello world',
                  },
                },
              },
              defers: [
                { url: '/foo?props_at=data.foo.bar', path: 'data.foo.bar' },
              ],
              fragments: [],
              action: 'savePage',
            },
          },
        },
      ]

      return store
        .dispatch(saveAndProcessPage('/foo', receivedPage))
        .then(() => {
          expect(allSuperglueActions(store)).toEqual(expectedActions)
        })
    })

    it('uses existing fragment nodes as placeholders for deferred fragments', () => {
      const initialState = () => {
        return {
          pages: {
            '/bar': {
              data: {
                foo: {
                  __id: 'info',
                },
              },
              defers: [
                { url: '/bar?props_at=data.foo.bar', path: 'data.foo.bar' },
              ],
              fragments: [{ type: 'info', path: 'data.foo.bar' }],
            },
          },
          fragments: {
            info: {
              bar: {
                greetings: 'existing greeting',
              },
            },
          },
        }
      }

      const store = buildStore(initialState())

      const receivedPage = {
        data: {
          foo: {
            bar: {
              greetings: 'This is a placeholder',
            },
          },
          baz: 'received',
        },
        defers: [{ url: '/bar?props_at=data.foo.bar', path: 'data.foo.bar' }],
        fragments: [{ id: 'info', path: 'data.foo.bar' }],
        action: 'savePage',
      }

      const expectedActions = [
        {
          payload: {
            data: {
              greetings: 'existing greeting',
            },
            fragmentId: 'info',
            pageKey: '/bar',
          },
          type: '@@superglue/SAVE_FRAGMENT',
        },
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/bar',
            page: {
              data: {
                foo: {
                  bar: {
                    __id: 'info',
                  },
                },
                baz: 'received',
              },
              defers: [
                { url: '/bar?props_at=data.foo.bar', path: 'data.foo.bar' },
              ],
              fragments: [{ id: 'info', path: 'data.foo.bar' }],
              action: 'savePage',
            },
          },
        },
      ]

      return store
        .dispatch(saveAndProcessPage('/bar', receivedPage))
        .then(() => {
          expect(allSuperglueActions(store)).toEqual(expectedActions)
        })
    })

    it('skips fragments whose path is already collapsed to an __id stub', () => {
      const initialState = () => {
        return {
          pages: {
            '/foo': {
              data: {},
              fragments: [],
            },
          },
          fragments: {
            sidebar_1: {
              title: 'existing sidebar',
              header: { text: 'existing header' },
            },
          },
          superglue: {
            currentPageKey: '/foo',
            csrfToken: 'token',
          },
        }
      }

      const store = buildStore(initialState())

      // Simulates the output of preparePageForSave after beforeSave copied
      // a fragment ref from prevPage: data.sidebar is already {__id: 'sidebar_1'}
      // but the fragments array still lists both parent and nested fragments.
      const receivedPage = {
        data: {
          sidebar: { __id: 'sidebar_1' },
        },
        fragments: [
          { id: 'sidebar_1', path: 'data.sidebar' },
          { id: 'header_1', path: 'data.sidebar.header' },
        ],
        action: 'savePage',
      }

      return store
        .dispatch(saveAndProcessPage('/foo', receivedPage))
        .then(() => {
          const saveFragmentActions = allSuperglueActions(store).filter(
            (a) => a.type === '@@superglue/SAVE_FRAGMENT'
          )

          expect(saveFragmentActions).toEqual([])
        })
    })

    it('handles deferments on the page and fires HANDLE_GRAFT', () => {
      const store = buildStore({
        ...initialState(),
        pages: {
          '/foo': {
            fragments: [],
          },
        },
      })

      const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        fragments: [],
        defers: [{ url: '/foo?props_at=body', type: 'auto' }],
      }

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          },
        },
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/RECEIVE_RESPONSE',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            page: {
              data: 'success',
              action: 'graft',
              path: 'body',
              csrfToken: 'token',
              fragments: [],
              assets: [],
              defers: [],
            },
          },
        },
        {
          type: '@@superglue/GRAFTING_SUCCESS',
          payload: expect.any(Object),
        },
      ]

      fetchMock.mock('https://example.com/foo?props_at=body&format=json', {
        body: JSON.stringify({
          data: 'success',
          action: 'graft',
          path: 'body',
          csrfToken: 'token',
          fragments: [],
          assets: [],
          defers: [],
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    it('does not handle deferments when using SSR', () => {
      const prevFetch = global.fetch
      global.fetch = undefined

      const store = buildStore({
        ...initialState(),
        pages: {
          '/foo': {
            fragments: [],
          },
        },
      })

      const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        defers: [{ url: '/foo?props_at=body', type: 'auto' }],
        fragments: [],
      }

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          },
        },
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        global.fetch = prevFetch
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    it('handles deferments on the page and fires user defined success', () => {
      const store = buildStore({
        ...initialState(),
        pages: {
          '/foo': {
            fragments: [],
          },
        },
      })

      const page = {
        data: { heading: 'Some heading 2', body: {} },
        csrfToken: 'token',
        assets: [],
        fragments: [],
        defers: [
          {
            url: '/foo?props_at=body',
            type: 'auto',
            successAction: 'FOOBAR',
          },
        ],
      }

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          },
        },
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/RECEIVE_RESPONSE',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            page: {
              data: 'success',
              action: 'graft',
              path: 'body',
              csrfToken: 'token',
              fragments: [],
              assets: [],
              defers: [],
            },
          },
        },
        {
          type: 'FOOBAR',
          payload: expect.any(Object),
        },
      ]

      fetchMock.mock('https://example.com/foo?props_at=body&format=json', {
        body: JSON.stringify({
          data: 'success',
          action: 'graft',
          path: 'body',
          csrfToken: 'token',
          fragments: [],
          assets: [],
          defers: [],
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    it('ignores manual deferments on the page', () => {
      const store = buildStore({
        ...initialState(),
        pages: {
          '/foo': {
            fragments: [],
          },
        },
      })

      const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        fragments: [],
        defers: [
          { url: '/some_defered_request?props_at=body', type: 'manual' },
        ],
      }

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          },
        },
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    it('fires HANDLE_GRAFT and process a page', () => {
      const store = buildStore({
        ...initialState(),
        pages: {
          '/foo': {
            heading: {
              cart: {},
            },
            fragments: [],
          },
        },
      })

      const page = {
        data: 'success',
        action: 'graft',
        path: 'heading.cart',
        csrfToken: '',
        assets: [],
        defers: [],
        fragments: [],
      }

      const expectedActions = [
        {
          type: '@@superglue/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            page,
          },
        },
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    //TODO: add tests for when type is mannual

    it('fires a GRAFTING_ERROR when a fetch fails', () => {
      const store = buildStore({
        ...initialState(),
        pages: {
          '/foo': {},
        },
      })

      const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        fragments: [],
        defers: [{ url: '/some_defered_request?props_at=body', type: 'auto' }],
      }

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          },
        },
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/ERROR',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/GRAFTING_ERROR',
          payload: {
            url: '/some_defered_request?props_at=body',
            pageKey: '/foo',
            err: expect.any(Object),
            keyPath: 'body',
          },
        },
      ]

      fetchMock.mock(
        'https://example.com/some_defered_request?props_at=body&format=json',
        500
      )

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    it('fires a user defined error when a fetch fails', () => {
      const store = buildStore({
        ...initialState(),
        pages: {
          '/foo': {},
        },
      })

      const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        fragments: [],
        defers: [
          {
            url: '/some_defered_request?props_at=body',
            type: 'auto',
            failAction: 'FOOBAR',
          },
        ],
      }

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          },
        },
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: expect.any(Object),
        },
        {
          type: '@@superglue/ERROR',
          payload: expect.any(Object),
        },
        {
          type: 'FOOBAR',
          payload: {
            url: '/some_defered_request?props_at=body',
            pageKey: '/foo',
            err: expect.any(Object),
            keyPath: 'body',
          },
        },
      ]

      fetchMock.mock(
        'https://example.com/some_defered_request?props_at=body&format=json',
        500
      )

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
    })

    it('handles a streamResponse', () => {
      const page = {
        data: {
          body: {
            footer: {
              note: 'buy paper',
            },
          },
          sideBar: {
            message: 'hello',
          },
          notFragment: {
            chart: 'this should be ignored',
          },
        },
        csrfToken: 'token',
        assets: [],
        action: 'handleFagments',
        fragments: [
          { id: 'footer', path: 'data.body.footer' },
          { id: 'side', path: 'data.sideBar' },
        ],
      }
      const store = buildStore(initialState())

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getState()).toMatchObject({
          fragments: {
            footer: {
              note: 'buy paper',
            },
            side: {
              message: 'hello',
            },
          },
          pages: {},
        })
      })
    })

    it('does not mutate the original fragments', () => {
      const fragments = [
        { id: 'first', path: 'data.first' },
        { id: 'second', path: 'data.second' },
        { id: 'third', path: 'data.third' },
      ]

      const page = {
        data: {
          first: { value: 'one' },
          second: { value: 'two' },
          third: { value: 'three' },
        },
        csrfToken: 'token',
        assets: [],
        defers: [],
        fragments,
      }

      const store = buildStore(initialState())
      const originalOrder = [...fragments]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(fragments).toEqual(originalOrder)
      })
    })
  })


  describe('visit', () => {
    afterEach(() => {
      fetchMock.reset()
      fetchMock.restore()
    })

    it('removes formats json, and props_at params', () =>
      new Promise((done) => {
        const initialState = {
          pages: {},
          superglue: {
            assets: [],
          },
        }

        const store = buildStore(initialState)

        fetchMock.mock(
          'https://example.com/first?format=json',
          rsp.visitSuccess()
        )
        store
          .dispatch(visit('/first?props_at=foo&format=json'))
          .then((meta) => {
            done()
          })
      }))

    describe('when initiated with a revisit indicator', () => {
      it('returns a meta with navigationAction of "replace" if was redirected', () => {
        const initialState = {
          pages: {},
          superglue: {
            assets: [],
          },
        }

        const store = buildStore(initialState)

        fetchMock.mock('https://example.com/redirecting_url?format=json', {
          status: 200,
          redirectUrl: '/foo',
          headers: {
            'content-type': 'application/json',
            location: '/foo',
          },
          body: successfulBody(),
        })

        return store
          .dispatch(visit('/redirecting_url', { revisit: true }))
          .then((meta) => {
            expect(meta.redirected).toEqual(true)
            expect(meta.navigationAction).toEqual('replace')
          })
      })

      it('returns a meta with navigationAction of "none" if was not redirected', () => {
        const initialState = {
          pages: {},
          superglue: {
            assets: [],
          },
        }

        const store = buildStore(initialState)

        fetchMock.mock(
          'https://example.com/first?format=json',
          rsp.visitSuccess()
        )

        return store
          .dispatch(visit('/first', { revisit: true }))
          .then((meta) => {
            expect(meta.redirected).toEqual(false)
            expect(meta.navigationAction).toEqual('none')
          })
      })
    })

    it('returns a meta with navigationAction of "none" if the next page has the same pageKey as the current page', () => {
      const initialState = {
        pages: {},
        superglue: {
          assets: [],
          currentPageKey: '/same_page',
        },
      }

      const store = buildStore(initialState)

      fetchMock.mock(
        'https://example.com/same_page?format=json',
        rsp.visitSuccess()
      )

      return store.dispatch(visit('/same_page')).then((meta) => {
        expect(meta.redirected).toEqual(false)
        expect(meta.navigationAction).toEqual('none')
      })
    })

    it('gets aborted when a new visit starts', () =>
      new Promise((done) => {
        const initialState = {
          pages: {},
          superglue: {
            assets: [],
          },
        }

        const store = buildStore(initialState)

        fetchMock.mock(
          'https://example.com/first?format=json',
          rsp.visitSuccess()
        )
        store.dispatch(visit('/first')).catch((err) => {
          expect(err.message).toEqual('The operation was aborted.')
          done()
        })
        store.dispatch(visit('/first'))
      }))

    it('warns when a placeholder is passed but does not exist in state', () =>
      new Promise((done) => {
        vi.spyOn(console, 'warn')
        const initialState = {
          superglue: {
            assets: [],
          },
          pages: {},
        }

        const store = buildStore(initialState)

        fetchMock.mock(
          'https://example.com/first?format=json',
          rsp.visitSuccess()
        )

        const expectedFetchUrl = '/first?props_at=foo&format=json'
        store
          .dispatch(
            visit(expectedFetchUrl, {
              placeholderKey: '/does-not-exist',
            })
          )
          .then((meta) => {
            expect(console.warn).toHaveBeenCalledWith(
              'Could not find placeholder with key /does-not-exist in state. The props_at param will be ignored'
            )
            done()
          })
      }))

    it('keeps the props_at parameter when a placeholder is passed and exists in state', () =>
      new Promise((done) => {
        const initialState = {
          superglue: {
            assets: [],
          },
          pages: {
            '/does-exist': {},
          },
        }

        const store = buildStore(initialState)

        fetchMock.mock(
          'https://example.com/first?props_at=foo&format=json',
          rsp.visitSuccess()
        )

        const expectedFetchUrl = '/first?props_at=foo&format=json'
        store
          .dispatch(visit(expectedFetchUrl, { placeholderKey: '/does-exist' }))
          .then((meta) => {
            done()
          })
      }))

    it('uses the currentPageKey as the placeholder implicitly when attempting to graft', () =>
      new Promise((done) => {
        const initialState = {
          superglue: {
            assets: [],
            currentPageKey: '/current',
          },
          pages: {
            '/current': {
              data: {
                address: {},
              },
              csrfToken: 'token',
              assets: ['application-new123.js', 'application-new123.js'],
              fragments: [],
            },
          },
        }

        const store = buildStore(initialState)

        let mockResponse = rsp.graftSuccessWithNewZip()
        fetchMock.mock(
          'https://example.com/details?props_at=data.address&format=json',
          mockResponse
        )

        const expectedActions = [
          {
            type: '@@superglue/BEFORE_VISIT',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/BEFORE_FETCH',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/COPY_PAGE',
            payload: { from: '/current', to: '/details' },
          },
          {
            type: '@@superglue/RECEIVE_RESPONSE',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/HANDLE_GRAFT',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/VISIT_END',
            payload: expect.any(Object),
          },
        ]

        store
          .dispatch(visit('/details?props_at=data.address'))
          .then((meta) => {
            expect(allSuperglueActions(store)).toEqual(expectedActions)
          })
          .finally(() => {
            done()
          })
      }))

    it('uses an explicit placeholder when attempting to graft', () =>
      new Promise((done) => {
        const initialState = {
          superglue: {
            assets: [],
            currentPageKey: '/home',
          },
          pages: {
            '/current': {
              data: {
                address: {},
              },
              csrfToken: 'token',
              assets: ['application-new123.js', 'application-new123.js'],
              fragments: [],
            },
          },
        }

        const store = buildStore(initialState)

        let mockResponse = rsp.graftSuccessWithNewZip()
        fetchMock.mock(
          'https://example.com/details?props_at=data.address&format=json',
          mockResponse
        )

        const expectedActions = [
          {
            type: '@@superglue/BEFORE_VISIT',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/BEFORE_FETCH',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/COPY_PAGE',
            payload: { from: '/current', to: '/details' },
          },
          {
            type: '@@superglue/RECEIVE_RESPONSE',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/HANDLE_GRAFT',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/VISIT_END',
            payload: expect.any(Object),
          },
        ]

        store
          .dispatch(
            visit('/details?props_at=data.address', {
              placeholderKey: '/current',
            })
          )
          .then((meta) => {
            expect(allSuperglueActions(store)).toEqual(expectedActions)
          })
          .finally(() => {
            done()
          })
      }))

    it('throws an error when the componentIdentifer of the placeholder is different when attempting to graft', () => {
      const initialState = {
        superglue: {
          assets: [],
          currentPageKey: '/home',
        },
        pages: {
          '/current': {
            data: {
              address: {},
            },
            csrfToken: 'token',
            assets: ['application-new123.js', 'application-new123.js'],
            fragments: [],
            componentIdentifier: 'Home',
          },
        },
      }

      const store = buildStore(initialState)

      let mockResponse = rsp.graftSuccessWithNewZip()
      mockResponse.componentIdentifier = 'DoesNotExist'
      fetchMock.mock(
        'https://example.com/details?props_at=data.address&format=json',
        mockResponse
      )

      expect(() => {
        return store.dispatch(
          visit('/details?props_at=data.address', {
            placeholderKey: '/current',
          })
        )
      }).rejects.toThrow(MismatchedComponentError)
    })

    it('sets the navigation action on meta to none for fragment responses', () => {
      const store = buildStore({
        superglue: {
          currentPageKey: '/current_url',
          csrfToken: 'token',
        },
      })

      fetchMock.mock('https://example.com/foobar?format=json', {
        body: successfulStreamResponseBody(),
        headers: {
          'content-type': 'application/json',
        },
      })

      return store.dispatch(visit('/foobar')).then((meta) => {
        expect(meta).toEqual(
          expect.objectContaining({
            navigationAction: 'none',
          })
        )
      })
    })
  })
})
