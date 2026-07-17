import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import fetchMock from 'fetch-mock'
import { visit, remote } from '../../lib/action_creators'
import * as rsp from '../../spec/fixtures'
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

describe('remote', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('fetches with correct headers and fires SAVE_RESPONSE', () => {
    const store = buildStore(initialState())

    fetchMock.mock('https://example.com/foo?format=json', {
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
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/BEFORE_FETCH',
        payload: {
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/RECEIVE_RESPONSE',
        payload: expect.any(Object),
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
      const requestheaders = fetchMock.lastCall(
        'https://example.com/foo?format=json'
      )[1].headers

      expect(requestheaders).toEqual({
        accept: 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'x-superglue-request': 'true',
        'x-csrf-token': 'token',
      })

      expect(allSuperglueActions(store)).toEqual(expectedActions)
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
    const store = buildStore(initialState)

    const body = {
      data: {
        posts: ['post 2'],
      },
      action: 'savePage',
      fragments: [],
      csrfToken: 'token',
      assets: [],
      defers: [],
    }

    fetchMock.mock('https://example.com/foo?format=json', {
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
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/BEFORE_FETCH',
        payload: {
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/RECEIVE_RESPONSE',
        payload: expect.any(Object),
      },
      {
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          pageKey: '/foo',
          page: {
            action: 'savePage',
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
        expect(allSuperglueActions(store)).toEqual(expectedActions)
      })
  })

  it('provides resolved fragment data to beforeSave in remote', async () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/bar',
        csrfToken: 'token',
      },
      pages: {
        '/bar': {
          data: {
            header: { __id: 'header_frag' },
          },
          csrfToken: 'token',
          assets: [],
          fragments: [{ id: 'header_frag', path: 'data.header' }],
          componentIdentifier: 'bar',
        },
      },
      fragments: {
        header_frag: {
          title: 'Original Title',
        },
      },
    })

    const responseBody = {
      data: { header: { title: 'New Title' } },
      csrfToken: 'token',
      assets: [],
      fragments: [],
      componentIdentifier: 'bar',
      action: 'savePage',
    }

    fetchMock.mock('https://example.com/bar?format=json', {
      body: JSON.stringify(responseBody),
      headers: {
        'content-type': 'application/json',
        'content-disposition': 'inline',
      },
    })

    let capturedPrevPage = null
    await store.dispatch(
      remote('/bar', {
        pageKey: '/bar',
        beforeSave: (prevPage, receivedPage) => {
          capturedPrevPage = JSON.parse(JSON.stringify(prevPage))
          return receivedPage
        },
      })
    )

    expect(capturedPrevPage.data.header.title).toEqual('Original Title')
    expect(capturedPrevPage.data.header.__id).toBeUndefined()
  })

  it('provides resolved fragment data to beforeSave in visit', async () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/bar',
        csrfToken: 'token',
        assets: [],
      },
      pages: {
        '/bar': {
          data: {
            header: { __id: 'header_frag' },
          },
          csrfToken: 'token',
          assets: [],
          fragments: [{ id: 'header_frag', path: 'data.header' }],
          componentIdentifier: 'bar',
        },
      },
      fragments: {
        header_frag: {
          title: 'Original Title',
        },
      },
    })

    const responseBody = {
      data: { header: { title: 'New Title' } },
      csrfToken: 'token',
      assets: [],
      fragments: [],
      componentIdentifier: 'bar',
      action: 'savePage',
    }

    fetchMock.mock('https://example.com/bar?format=json', {
      body: JSON.stringify(responseBody),
      headers: {
        'content-type': 'application/json',
        'content-disposition': 'inline',
      },
    })

    let capturedPrevPage = null
    await store.dispatch(
      visit('/bar', {
        beforeSave: (prevPage, receivedPage) => {
          capturedPrevPage = JSON.parse(JSON.stringify(prevPage))
          return receivedPage
        },
      })
    )

    expect(capturedPrevPage.data.header.title).toEqual('Original Title')
    expect(capturedPrevPage.data.header.__id).toBeUndefined()
  })

  it('defaults to the response url as the pageKey on GET requests', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/current_url',
        csrfToken: 'token',
      },
    })

    fetchMock.mock('https://example.com/foobar?format=json', {
      body: successfulBody(),
      headers: {
        'content-type': 'application/json',
      },
    })

    return store.dispatch(remote('/foobar', { method: 'GET' })).then((meta) => {
      expect(meta).toEqual(
        expect.objectContaining({
          pageKey: '/foobar',
        })
      )
    })
  })

  it('defaults to the currentPageKey as the pageKey when a non GET renders', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/current_url',
        csrfToken: 'token',
      },
    })

    fetchMock.mock('https://example.com/foobar?format=json', {
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

  it('uses the pageKey option to explicitly specify where to store the response', () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/url_to_be_overridden',
        csrfToken: 'token',
      },
    })

    fetchMock.mock('https://example.com/foobar?format=json', {
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
      const store = buildStore(initialState())

      fetchMock.mock(
        'https://example.com/first?props_at=foo&format=json',
        rsp.visitSuccess()
      )
      store.dispatch(remote('/first?props_at=foo')).then(() => {
        done()
      })
    }))

  it('returns a meta with redirected true if was redirected', () => {
    const store = buildStore(initialState())

    fetchMock.mock('https://example.com/redirecting_url?format=json', {
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

  it('resolves with hasError and dispatches SUPERGLUE_ERROR on a bad server response status', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
      body: '{}',
      status: 500,
    })

    const expectedActions = [
      {
        type: '@@superglue/BEFORE_REMOTE',
        payload: {
          currentPageKey: '/bar',
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/BEFORE_FETCH',
        payload: {
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/ERROR',
        payload: { message: 'Internal Server Error' },
      },
    ]

    return store.dispatch(remote('/foo')).then((result) => {
      expect(result.hasError).toBe(true)
      if (result.hasError) {
        expect(result.response.status).toEqual(500)
        expect(result.response.statusText).toEqual('Internal Server Error')
      }
      expect(allSuperglueActions(store)).toEqual(
        expect.objectContaining(expectedActions)
      )
    })
  })

  it('fires SUPERGLUE_REQUEST_ERROR on a invalid response', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
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
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/BEFORE_FETCH',
        payload: {
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/ERROR',
        payload: {
          message:
            'invalid json response body at https://example.com/foo?format=json reason: Unexpected end of JSON input',
        },
      },
    ]

    return store.dispatch(remote('/foo')).catch((err) => {
      expect(err.message).toEqual(
        'invalid json response body at https://example.com/foo?format=json reason: Unexpected end of JSON input'
      )
      expect(err.response.status).toEqual(200)
      expect(allSuperglueActions(store)).toEqual(
        expect.objectContaining(expectedActions)
      )
    })
  })

  it('fires SUPERGLUE_REQUEST_ERROR when the SJR returns nothing', () => {
    const store = buildStore(initialState())

    fetchMock.mock('https://example.com/foo?format=json', {
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
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/BEFORE_FETCH',
        payload: {
          fetchArgs: [
            'https://example.com/foo?format=json',
            expect.any(Object),
          ],
        },
      },
      {
        type: '@@superglue/ERROR',
        payload: {
          message:
            'invalid json response body at https://example.com/foo?format=json reason: Unexpected end of JSON input',
        },
      },
    ]

    return store.dispatch(remote('/foo')).catch((err) => {
      expect(err.message).toEqual(
        'invalid json response body at https://example.com/foo?format=json reason: Unexpected end of JSON input'
      )
      expect(err.response.status).toEqual(200)
      expect(allSuperglueActions(store)).toEqual(
        expect.objectContaining(expectedActions)
      )
    })
  })

  it('fires SUPERGLUE_HANDLE_GRAFT when the response is a graft', () =>
    new Promise((done) => {
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
      fetchMock.mock('https://example.com/foo?format=json', {
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
        const actions = allSuperglueActions(store)
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

  it('throws if a received page has a completely component id that the target page it will replace', () => {
    const store = buildStore({
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

    fetchMock.mock('https://example.com/bar?format=json', {
      body: successfulBody,
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(() => store.dispatch(remote('/bar'))).rejects.toThrow(
      MismatchedComponentError
    )
  })

  it('forces a remote even if a received page has a completely component id than the target page', () => {
    const store = buildStore({
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
      data: { greeting: 'hello' },
      componentIdentifier: 'foo-id',
      csrfToken: 'token',
      assets: [],
      defers: [],
      fragments: [],
    }

    fetchMock.mock('https://example.com/bar?format=json', {
      body: successfulBody,
      headers: {
        'content-type': 'application/json',
      },
    })

    return store.dispatch(remote('/bar', { force: true })).then(() => {
      expect(store.getState().pages['/bar'].data).toEqual(
        expect.objectContaining({
          greeting: 'hello',
        })
      )
    })
  })

  it('does not warn if a received page is not replacing a target page with a different componentIdentifier', () => {
    vi.spyOn(console, 'warn')
    const store = buildStore({
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

    fetchMock.mock('https://example.com/bar?format=json', {
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

      const store = buildStore(initialState)

      fetchMock.mock(
        'https://example.com/first?format=json',
        rsp.visitSuccess()
      )
      store.dispatch(visit('/first?props_at=foo&format=json')).then(() => {
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

      return store.dispatch(visit('/first', { revisit: true })).then((meta) => {
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
        .then(() => {
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
        .then(() => {
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
        .then(() => {
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
        .then(() => {
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

  it('sets isVisiting to true on beforeVisit and false on visitEnd', () => {
    const initialState = {
      pages: {},
      superglue: {
        assets: [],
        isVisiting: false,
      },
    }

    const store = buildStore(initialState)

    fetchMock.mock('https://example.com/first?format=json', rsp.visitSuccess())

    expect(store.getState().superglue.isVisiting).toEqual(false)

    return store.dispatch(visit('/first')).then(() => {
      expect(store.getState().superglue.isVisiting).toEqual(false)
    })
  })

  it('dispatches beforeVisit and visitEnd actions', () => {
    const initialState = {
      pages: {},
      superglue: {
        assets: [],
        isVisiting: false,
      },
    }

    const store = buildStore(initialState)

    fetchMock.mock('https://example.com/first?format=json', rsp.visitSuccess())

    return store.dispatch(visit('/first')).then(() => {
      const actions = allSuperglueActions(store)
      const beforeVisitAction = actions.find(
        (a) => a.type === '@@superglue/BEFORE_VISIT'
      )
      const visitEndAction = actions.find(
        (a) => a.type === '@@superglue/VISIT_END'
      )

      expect(beforeVisitAction).toBeDefined()
      expect(visitEndAction).toBeDefined()
    })
  })
})
