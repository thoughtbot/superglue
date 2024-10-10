import { describe, expect, afterEach, it, vi } from 'vitest'
import configureMockStore from 'redux-mock-store'
import { thunk } from 'redux-thunk'
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

const middlewares = [thunk]
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
      const store = mockStore(initialState())
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
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('handles deferments on the page and fires HANDLE_GRAFT', () => {
      const store = mockStore({
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

      fetchMock.mock('/foo?props_at=body&format=json', {
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
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('handles nested deferments to complete the page before updating fragments', () => {
      const store = mockStore({
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
        fragments: [{ type: 'body', path: 'data.body' }],
        defers: [{ url: '/foo?props_at=data.body', type: 'auto' }],
      }

      fetchMock.mock('/foo?props_at=data.body&format=json', {
        body: JSON.stringify({
          data: {
            aside: {
              top: {},
            },
          },
          action: 'graft',
          path: 'data.body',
          csrfToken: 'token',
          fragments: [],
          assets: [],
          defers: [{ url: '/foo?props_at=data.body.aside.top', type: 'auto' }],
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      fetchMock.mock('/foo?props_at=data.body.aside.top&format=json', {
        body: JSON.stringify({
          data: {
            hello: 'world',
          },
          action: 'graft',
          path: 'data.body.aside.top',
          csrfToken: 'token',
          fragments: [],
          assets: [],
          defers: [],
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const expectedActions = [
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: { heading: 'Some heading 2', body: {} },
              csrfToken: 'token',
              assets: [],
              fragments: [{ type: 'body', path: 'data.body' }],
              defers: [{ url: '/foo?props_at=data.body', type: 'auto' }],
            },
          },
        },
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: {
            currentPageKey: '/bar',
            fetchArgs: [
              '/foo?props_at=data.body&format=json',
              {
                method: 'GET',
                headers: {
                  accept: 'application/json',
                  'x-requested-with': 'XMLHttpRequest',
                  'x-superglue-request': 'true',
                  'x-csrf-token': 'token',
                },
                credentials: 'same-origin',
                referrer: '/bar',
              },
            ],
          },
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: {
            fetchArgs: [
              '/foo?props_at=data.body&format=json',
              {
                method: 'GET',
                headers: {
                  accept: 'application/json',
                  'x-requested-with': 'XMLHttpRequest',
                  'x-superglue-request': 'true',
                  'x-csrf-token': 'token',
                },
                credentials: 'same-origin',
                referrer: '/bar',
              },
            ],
          },
        },
        {
          type: '@@superglue/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            page: {
              data: { aside: { top: {} } },
              action: 'graft',
              path: 'data.body',
              csrfToken: 'token',
              fragments: [],
              assets: [],
              defers: [
                { url: '/foo?props_at=data.body.aside.top', type: 'auto' },
              ],
            },
          },
        },
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: {
            currentPageKey: '/bar',
            fetchArgs: [
              '/foo?props_at=data.body.aside.top&format=json',
              {
                method: 'GET',
                headers: {
                  accept: 'application/json',
                  'x-requested-with': 'XMLHttpRequest',
                  'x-superglue-request': 'true',
                  'x-csrf-token': 'token',
                },
                credentials: 'same-origin',
                referrer: '/bar',
              },
            ],
          },
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: {
            fetchArgs: [
              '/foo?props_at=data.body.aside.top&format=json',
              {
                method: 'GET',
                headers: {
                  accept: 'application/json',
                  'x-requested-with': 'XMLHttpRequest',
                  'x-superglue-request': 'true',
                  'x-csrf-token': 'token',
                },
                credentials: 'same-origin',
                referrer: '/bar',
              },
            ],
          },
        },
        {
          type: '@@superglue/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            page: {
              data: { hello: 'world' },
              action: 'graft',
              path: 'data.body.aside.top',
              csrfToken: 'token',
              fragments: [],
              assets: [],
              defers: [],
            },
          },
        },
        {
          type: '@@superglue/GRAFTING_SUCCESS',
          payload: {
            pageKey: '/foo',
            keyPath: 'data.body.aside.top',
          },
        },
        {
          type: '@@superglue/GRAFTING_SUCCESS',
          payload: { pageKey: '/foo', keyPath: 'data.body' },
        },
        {
          type: '@@superglue/UPDATE_FRAGMENTS',
          payload: { changedFragments: {} },
        },
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('does not handle deferments when using SSR', () => {
      const prevFetch = global.fetch
      global.fetch = undefined

      const store = mockStore({
        ...initialState(),
        pages: {
          '/foo': {},
        },
      })

      const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
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
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        global.fetch = prevFetch
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('handles deferments on the page and fires user defined success', () => {
      const store = mockStore({
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

      fetchMock.mock('/foo?props_at=body&format=json', {
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
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('ignores manual deferments on the page', () => {
      const store = mockStore({
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
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('fires HANDLE_GRAFT and process a page', () => {
      const store = mockStore({
        ...initialState(),
        pages: {
          '/foo': {},
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
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('fires HANDLE_GRAFT, and process a page with a fragment', () => {
      const store = mockStore({
        ...initialState(),
        pages: {
          '/foo': {
            data: {
              heading: {
                cart: {},
              },
            },
            fragments: [],
          },
        },
      })

      const page = {
        data: { status: 'success' },
        action: 'graft',
        path: 'data.heading.cart',
        csrfToken: '',
        fragments: [{ path: 'data.heading.cart', type: 'cart' }],
      }

      // Figure out a better way to test this, the last element in the
      // array isn't correct because getState on a mockstore doesn't work
      const expectedActions = [
        {
          type: '@@superglue/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            page,
          },
        },
        {
          type: '@@superglue/UPDATE_FRAGMENTS',
          payload: {
            changedFragments: {},
          },
        },
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    //TODO: add tests for when type is mannual

    it('fires a GRAFTING_ERROR when a fetch fails', () => {
      const store = mockStore({
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

      fetchMock.mock('/some_defered_request?props_at=body&format=json', 500)

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('fires a user defined error when a fetch fails', () => {
      const store = mockStore({
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

      fetchMock.mock('/some_defered_request?props_at=body&format=json', 500)

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })

  describe('remote', () => {
    afterEach(() => {
      fetchMock.reset()
      fetchMock.restore()
    })

    it('fetches with correct headers and fires SAVE_RESPONSE', () => {
      const store = mockStore(initialState())

      fetchMock.mock('/foo?format=json', {
        body: successfulBody(),
        headers: {
          'content-type': 'application/json',
        },
      })

      const expectedActions = [
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: {
            currentPageKey: '/bar',
            fetchArgs: ['/foo?format=json', expect.any(Object)],
          },
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: { fetchArgs: ['/foo?format=json', expect.any(Object)] },
        },
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: { heading: 'Some heading 2' },
              csrfToken: 'token',
              assets: [],
              defers: [],
              fragments: [],
            },
          },
        },
      ]

      return store.dispatch(remote('/foo', { pageKey: '/foo' })).then(() => {
        const requestheaders = fetchMock.lastCall('/foo?format=json')[1].headers

        expect(requestheaders).toEqual({
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': 'true',
          'x-csrf-token': 'token',
        })

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    it('accepts a beforeSave to modify the response before saving', () => {
      const initialState = {
        pages: {
          '/foo': {
            data: {
              posts: ['post 1'],
            },
            fragments: [],
          },
        },
        superglue: {
          currentPageKey: '/bar',
          csrfToken: 'token',
        },
      }
      const store = mockStore(initialState)

      const body = {
        data: {
          posts: ['post 2'],
        },
        fragments: [],
        csrfToken: 'token',
        assets: [],
        defers: [],
      }

      fetchMock.mock('/foo?format=json', {
        body,
        headers: {
          'content-type': 'application/json',
          'x-response-url': '/foo',
        },
      })

      const expectedActions = [
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: {
            currentPageKey: '/bar',
            fetchArgs: ['/foo?format=json', expect.any(Object)],
          },
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: { fetchArgs: ['/foo?format=json', expect.any(Object)] },
        },
        {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: { posts: ['post 1', 'post 2'] },
              csrfToken: 'token',
              assets: [],
              defers: [],
              fragments: [],
            },
          },
        },
      ]

      const beforeSave = (prevPage, receivedPage) => {
        const receivedPosts = receivedPage.data.posts
        const prevPosts = prevPage.data.posts
        receivedPage.data.posts = [...prevPosts, ...receivedPosts]

        return receivedPage
      }

      return store
        .dispatch(remote('/foo', { beforeSave, pageKey: '/foo' }))
        .then(() => {
          expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it('defaults to the currentPageKey as the pageKey', () => {
      const store = mockStore({
        superglue: {
          currentPageKey: '/current_url',
          csrfToken: 'token',
        },
      })

      fetchMock.mock('/foobar?format=json', {
        body: successfulBody(),
        headers: {
          'content-type': 'application/json',
        },
      })

      return store
        .dispatch(remote('/foobar', { method: 'POST' }))
        .then((meta) => {
          expect(meta).toEqual(
            expect.objectContaining({
              pageKey: '/current_url',
            })
          )
        })
    })

    it('uses the pageKey option to override the currentPageKey as the preferred pageKey', () => {
      const store = mockStore({
        superglue: {
          currentPageKey: '/url_to_be_overridden',
          csrfToken: 'token',
        },
      })

      fetchMock.mock('/foobar?format=json', {
        body: successfulBody(),
        headers: {
          'content-type': 'application/json',
        },
      })

      return store
        .dispatch(
          remote('/foobar', {
            method: 'POST',
            pageKey: '/bar_override',
          })
        )
        .then((meta) => {
          expect(meta).toEqual(
            expect.objectContaining({
              pageKey: '/bar_override',
            })
          )
        })
    })

    it('removes format from params', () =>
      new Promise((done) => {
        const store = mockStore(initialState())

        fetchMock.mock('/first?props_at=foo&format=json', rsp.visitSuccess())
        store.dispatch(remote('/first?props_at=foo')).then((meta) => {
          done()
        })
      }))

    it('returns a meta with redirected true if was redirected', () => {
      const store = mockStore(initialState())

      fetchMock.mock('/redirecting_url?format=json', {
        status: 200,
        redirectUrl: '/foo',
        headers: {
          'content-type': 'application/json',
          location: '/foo',
        },
        body: successfulBody(),
      })

      return store.dispatch(remote('/redirecting_url')).then((meta) => {
        expect(meta.redirected).toEqual(true)
      })
    })

    it('fires SUPERGLUE_REQUEST_ERROR on a bad server response status', () => {
      const store = mockStore(initialState())
      fetchMock.mock('/foo?format=json', { body: '{}', status: 500 })

      const expectedActions = [
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: {
            currentPageKey: '/bar',
            fetchArgs: ['/foo?format=json', expect.any(Object)],
          },
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: { fetchArgs: ['/foo?format=json', expect.any(Object)] },
        },
        {
          type: '@@superglue/ERROR',
          payload: { message: 'Internal Server Error' },
        },
      ]

      return store.dispatch(remote('/foo')).catch((err) => {
        expect(err.message).toEqual('Internal Server Error')
        expect(err.response.status).toEqual(500)
        expect(store.getActions()).toEqual(
          expect.objectContaining(expectedActions)
        )
      })
    })

    it('fires SUPERGLUE_REQUEST_ERROR on a invalid response', () => {
      const store = mockStore(initialState())
      fetchMock.mock('/foo?format=json', {
        status: 200,
        headers: {
          'content-type': 'text/bad',
        },
        body: '',
      })

      const expectedActions = [
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: {
            currentPageKey: '/bar',
            fetchArgs: ['/foo?format=json', expect.any(Object)],
          },
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: { fetchArgs: ['/foo?format=json', expect.any(Object)] },
        },
        {
          type: '@@superglue/ERROR',
          payload: {
            message:
              'invalid json response body at /foo?format=json reason: Unexpected end of JSON input',
          },
        },
      ]

      return store.dispatch(remote('/foo')).catch((err) => {
        expect(err.message).toEqual(
          'invalid json response body at /foo?format=json reason: Unexpected end of JSON input'
        )
        expect(err.response.status).toEqual(200)
        expect(store.getActions()).toEqual(
          expect.objectContaining(expectedActions)
        )
      })
    })

    it('fires SUPERGLUE_REQUEST_ERROR when the SJR returns nothing', () => {
      const store = mockStore(initialState())

      fetchMock.mock('/foo?format=json', {
        body: ``,
        headers: {
          'content-type': 'application/json',
        },
      })

      const expectedActions = [
        {
          type: '@@superglue/BEFORE_REMOTE',
          payload: {
            currentPageKey: '/bar',
            fetchArgs: ['/foo?format=json', expect.any(Object)],
          },
        },
        {
          type: '@@superglue/BEFORE_FETCH',
          payload: { fetchArgs: ['/foo?format=json', expect.any(Object)] },
        },
        {
          type: '@@superglue/ERROR',
          payload: {
            message:
              'invalid json response body at /foo?format=json reason: Unexpected end of JSON input',
          },
        },
      ]

      return store.dispatch(remote('/foo')).catch((err) => {
        expect(err.message).toEqual(
          'invalid json response body at /foo?format=json reason: Unexpected end of JSON input'
        )
        expect(err.response.status).toEqual(200)
        expect(store.getActions()).toEqual(
          expect.objectContaining(expectedActions)
        )
      })
    })

    it('fires SUPERGLUE_HANDLE_GRAFT when the response is a graft', () =>
      new Promise((done) => {
        const store = mockStore({
          ...initialState(),
          pages: {
            '/foo': {},
          },
        })
        fetchMock.mock('/foo?format=json', {
          body: JSON.stringify({
            data: 'success',
            action: 'graft',
            path: 'heading.cart',
            csrfToken: 'token',
            assets: [],
            fragments: [],
            defers: [],
          }),
          headers: {
            'content-type': 'application/json',
          },
        })

        store.subscribe(() => {
          const state = store.getState()
          const actions = store.getActions()
          const lastAction = actions[actions.length - 1]
          const { type, payload } = lastAction

          if (type === '@@superglue/HANDLE_GRAFT') {
            expect(payload).toEqual({
              pageKey: '/foo',
              page: {
                data: 'success',
                action: 'graft',
                path: 'heading.cart',
                csrfToken: 'token',
                assets: [],
                fragments: [],
                defers: [],
              },
            })

            done()
          }
        })

        store.dispatch(remote('/foo', { pageKey: '/foo' }))
      }))

    it('warns if a received page has a completely component id that the target page it will replace', () => {
      vi.spyOn(console, 'warn')
      const store = mockStore({
        superglue: {
          currentPageKey: '/bar',
          csrfToken: 'token',
        },
        pages: {
          '/bar': {
            data: {},
            componentIdentifier: 'bar-id',
          },
        },
      })

      const successfulBody = {
        data: {},
        componentIdentifier: 'foo-id',
        csrfToken: 'token',
        assets: [],
        defers: [],
        fragments: [],
      }

      fetchMock.mock('/bar?format=json', {
        body: successfulBody,
        headers: {
          'content-type': 'application/json',
        },
      })

      return store.dispatch(remote('/bar')).then(() => {
        expect(console.warn).toHaveBeenCalledWith(
          `You're about replace an existing page located at pages["/bar"]
that has the componentIdentifier "bar-id" with the contents of a
received page that has a componentIdentifier of "foo-id".

This can happen if you're using data-sg-remote or remote but your response
redirected to a completely different page. Since remote requests do not
navigate or change the current page component, your current page component may
receive a shape that is unexpected and cause issues with rendering.

Consider using data-sg-visit, the visit function, or redirect_back.`
        )
      })
    })

    it('does not warn if a received page is not replacing a target page with a different componentIdentifier', () => {
      vi.spyOn(console, 'warn')
      const store = mockStore({
        superglue: {
          currentPageKey: '/bar',
          csrfToken: 'token',
        },
        pages: {
          '/bar': {
            data: {},
            componentIdentifier: 'ForBar',
          },
        },
      })

      const successfulBody = {
        data: {},
        componentIdentifier: 'ForBar',
        csrfToken: 'token',
        assets: [],
        defers: [],
        fragments: [],
      }

      fetchMock.mock('/bar?format=json', {
        body: successfulBody,
        headers: {
          'content-type': 'application/json',
        },
      })

      return store.dispatch(remote('/bar')).then(() => {
        expect(console.warn).not.toHaveBeenCalled()
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

        const store = mockStore(initialState)

        fetchMock.mock('/first?format=json', rsp.visitSuccess())
        store
          .dispatch(visit('/first?props_at=foo&format=json'))
          .then((meta) => {
            done()
          })
      }))

    describe('when initiated with a revisit indicator', () => {
      it('returns a meta with suggestedAction of "replace" if was redirected', () => {
        const initialState = {
          pages: {},
          superglue: {
            assets: [],
          },
        }

        const store = mockStore(initialState)

        fetchMock.mock('/redirecting_url?format=json', {
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
            expect(meta.suggestedAction).toEqual('replace')
          })
      })

      it('returns a meta with suggestedAction of "none" if was not redirected', () => {
        const initialState = {
          pages: {},
          superglue: {
            assets: [],
          },
        }

        const store = mockStore(initialState)

        fetchMock.mock('/first?format=json', rsp.visitSuccess())

        return store
          .dispatch(visit('/first', { revisit: true }))
          .then((meta) => {
            expect(meta.redirected).toEqual(false)
            expect(meta.suggestedAction).toEqual('none')
          })
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

        const store = mockStore(initialState)

        fetchMock.mock('/first?format=json', rsp.visitSuccess())
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

        const store = mockStore(initialState)

        fetchMock.mock('/first?format=json', rsp.visitSuccess())

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

        const store = mockStore(initialState)

        fetchMock.mock('/first?props_at=foo&format=json', rsp.visitSuccess())

        const expectedFetchUrl = '/first?props_at=foo&format=json'
        store
          .dispatch(visit(expectedFetchUrl, { placeholderKey: '/does-exist' }))
          .then((meta) => {
            done()
          })
      }))

    it('warns when props_at is included but a placeholder was not passed', () =>
      new Promise((done) => {
        vi.spyOn(console, 'warn')
        const initialState = {
          superglue: {
            assets: [],
          },
          pages: {
            '/does-exist': {},
          },
        }

        const store = mockStore(initialState)

        fetchMock.mock('/first?format=json', rsp.visitSuccess())

        const expectedFetchUrl = '/first?props_at=foo'
        store.dispatch(visit(expectedFetchUrl)).then((meta) => {
          expect(console.warn).toHaveBeenCalledWith(
            'visit was called with props_at param in the path /first?props_at=foo, this will be ignore unless you provide a placeholder.'
          )
          done()
        })
      }))

    it('uses a placeholder when attempting to graft', () =>
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

        const store = mockStore(initialState)

        let mockResponse = rsp.graftSuccessWithNewZip()
        fetchMock.mock(
          '/details?props_at=data.address&format=json',
          mockResponse
        )

        const expectedActions = [
          {
            type: '@@superglue/COPY_PAGE',
            payload: { from: '/current', to: '/details' },
          },
          {
            type: '@@superglue/BEFORE_VISIT',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/BEFORE_FETCH',
            payload: expect.any(Object),
          },
          {
            type: '@@superglue/HANDLE_GRAFT',
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
            expect(store.getActions()).toEqual(expectedActions)
            done()
          })
      }))
  })
})
