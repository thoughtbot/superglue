import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import {
  visit,
  wrappedFetch,
  remote,
  handleGraft,
  setInPage,
  delInPage,
  extendInPage,
  setInJoint,
  delInJoint,
  extendInJoint,
  beforeFetch,
  handleError,
} from './action_creators'
import * as helpers from './utils/helpers'
import * as connect from './connector'
import * as rsp from '../spec/fixtures'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const delay = (duration) => {
  return new Promise((res, rej) => setTimeout(res, duration))
}
const initialState = () => {
  return {
    breezy: {
      currentUrl: '/bar',
      csrfToken: 'token',
      controlFlows: {
        visit: 'fakeUUID'
      }
    }
  }
}

const successfulBody = () => {
  return (
    `(function() {
        return {
          data: { heading: 'Some heading 2' },
          title: 'title 2',
          csrf_token: 'token',
          assets: ['application-123.js', 'application-123.js']
        };
      })();`
    )
}

describe('action creators', () => {
  describe('handleGraft', () => {
    it('fires BREEZY_HANDLE_GRAFT', () => {
      const pageKey = '/test'
      const page = {d: 'foo'}

      const action = handleGraft({
        pageKey,
        page,
      })

      expect(action).toEqual({
        type: '@@breezy/HANDLE_GRAFT',
        pageKey,
        page,
      })
    })
  })

  describe('setInPage', () => {
    it('fires BREEZY_SET_IN_PAGE', () => {
      const pageKey = '/test?hello=123'
      const keypath = 'a.b.c'
      const value = {d: 'foo'}

      const action = setInPage({
        pageKey,
        keypath,
        value,
      })

      expect(action).toEqual({
        type: '@@breezy/SET_IN_PAGE',
        pageKey,
        keypath,
        value,
      })
    })
  })

  describe('delInPage', () => {
    it('fires immutable BREEZY_DEL_IN_PAGE', () => {
      const pageKey = '/test?hello=123'
      const keypath = 'a.b.c'

      const action = delInPage({
        pageKey ,
        keypath,
      })

      expect(action).toEqual({
        type: '@@breezy/DEL_IN_PAGE',
        pageKey,
        keypath,
      })
    })
  })

  describe('extendInPage', () => {
    it('fires immutable BREEZY_EXTEND_IN_PAGE', () => {
      const pageKey = '/test?hello=123'
      const keypath = 'a.b.c'
      const value = {d: 'foo'}

      const action = extendInPage({
        pageKey,
        keypath,
        value,
      })

      expect(action).toEqual({
        type: '@@breezy/EXTEND_IN_PAGE',
        pageKey,
        keypath,
        value,
      })
    })
  })

  describe('setInJoint', () => {
    it('fires immutable BREEZY_SET_IN_JOINT', () => {
      const name = 'some_partial'
      const keypath = 'a.b.c'
      const value = {d: 'foo'}

      const action = setInJoint({
        type: '@@breezy/SET_IN_JOINT',
        name,
        keypath,
        value,
      })

      expect(action).toEqual({
        type: '@@breezy/SET_IN_JOINT',
        name,
        keypath,
        value,
      })
    })
  })

  describe('delInJoint', () => {
    it('fires immutable BREEZY_DEL_IN_JOINT', () => {
      const name = 'some_partial'
      const keypath = 'a.b.c'

      const action = delInJoint({
        type: '@@breezy/DEL_IN_JOINT',
        name,
        keypath,
      })

      expect(action).toEqual({
        type: '@@breezy/DEL_IN_JOINT',
        name,
        keypath,
      })
    })
  })

  describe('extendInJoint', () => {
    it('fires immutable BREEZY_DEL_IN_JOINT', () => {
      const name = 'some_partial'
      const keypath = 'a.b.c'
      const value = {d: 'foo'}

      const action = extendInJoint({
        type: '@@breezy/EXTEND_IN_JOINT',
        name,
        keypath,
        value,
      })

      expect(action).toEqual({
        type: '@@breezy/EXTEND_IN_JOINT',
        name,
        keypath,
        value,
      })
    })
  })

  describe('wrappedFetch', () => {
    afterEach(() => {
      fetchMock.reset()
      fetchMock.restore()
    })

    it('follows x-breezy-location redirects', (done) => {
      fetchMock
        .mock('/redirecting_url', {
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-breezy-location': '/foo'
          }
        })

      fetchMock
        .mock('/foo', {
          body: successfulBody(),
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/foo'
          }
        })

      wrappedFetch(['/redirecting_url', {}], {}).then(done)
    })
  })

  describe('visit', () => {
    afterEach(() => {
      fetchMock.reset()
      fetchMock.restore()
    })


    it('fires BREEZY_SAVE_RESPONSE when fetching', () => {
      const store = mockStore(initialState())
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

      fetchMock
        .mock('/foo?__=0', {
          body: successfulBody(),
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/foo'
          }
        })


      const expectedActions = [
        { type: '@@breezy/BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
        { type: '@@breezy/OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
        {
          pageKey: '/foo',
          type: '@@breezy/SAVE_RESPONSE',
          page: {
            data: { heading: 'Some heading 2' },
            title: 'title 2',
            csrf_token: 'token',
            assets: ['application-123.js', 'application-123.js']
          }
        }
      ]

      return store.dispatch(visit('/foo')).then(() => {
        const requestheaders = fetchMock.lastCall('/foo?__=0')[1].headers
        expect(requestheaders).toEqual({
          accept: "text/javascript, application/x-javascript, application/javascript",
          'x-xhr-referer': '/bar',
          'x-requested-with': "XMLHttpRequest",
          'x-breezy-request': true,
          'x-csrf-token': 'token'
        })

        expect(store.getActions()).toEqual((expectedActions))
      })
    })

    it('uses the override as the pageKey on non-GET requests', (done) => {
      const store = mockStore(initialState())
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

      fetchMock
        .mock('/with_pagekey_override?__=0', {
          body: successfulBody(),
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/foo'
          }
        })


      return store.dispatch(visit('/with_pagekey_override', {method: 'POST'}, '/bar_override')).then((meta) => {
        expect(meta).toEqual(jasmine.objectContaining({
          pageKey: '/bar_override'
        }))

        done()
      })
    })

    it('uses the content-location over x-response-url as the pageKey if no explicit key was set on non-GET requests', (done) => {
      const store = mockStore(initialState())
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

      fetchMock
        .mock('/foo?__=0', {
          body: successfulBody(),
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/will_NOT_be_used',
            'content-location': '/will_be_used',
          }
        })


      return store.dispatch(visit('/foo', {method: 'POST'})).then((meta) => {
        expect(meta).toEqual(jasmine.objectContaining({
          pageKey: '/will_be_used'
        }))

        done()
      })
    })

   it('uses the x-response-url as the pageKey if no explicit key was set on non-GET requests and content-location is not avail', (done) => {
      const store = mockStore(initialState())
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

      fetchMock
        .mock('/foo?__=0', {
          body: successfulBody(),
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/will_be_used',
          }
        })

      return store.dispatch(visit('/foo', {method: 'POST'})).then((meta) => {
        expect(meta).toEqual(jasmine.objectContaining({
          pageKey: '/will_be_used'
        }))

        done()
      })
    })

    it('fires BREEZY_REQUEST_ERROR on a bad server response status', () => {
      const store = mockStore(initialState())
      fetchMock.mock('/foo?__=0', {status: 500})

      const expectedActions = [
        { type: '@@breezy/BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
        { type: '@@breezy/OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
        {
          type: '@@breezy/FETCH_ERROR',
          payload:{error: "Internal Server Error" }
        }
      ]

      return store.dispatch(visit('/foo')).catch((err) => {
        expect(err.message).toEqual('Internal Server Error')
        expect(err.response.status).toEqual(500)
        expect(store.getActions()).toEqual(jasmine.objectContaining(expectedActions))
      })
    })

    it('fires BREEZY_REQUEST_ERROR on a invalid response', () => {
      const store = mockStore(initialState())
      spyOn(connect, 'getStore').and.returnValue(store)
      fetchMock.mock('/foo?__=0', {status: 200, headers: {
        'content-type': 'text/bad'
      }})

      const expectedActions = [
        { type: '@@breezy/BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
        { type: '@@breezy/OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
        {
          type: '@@breezy/FETCH_ERROR',
          payload:{error: "Invalid Breezy Response" }
        }
      ]

      return store.dispatch(visit('/foo')).catch((err) => {
        expect(err.message).toEqual('Invalid Breezy Response')
        expect(err.response.status).toEqual(200)
        expect(store.getActions()).toEqual(jasmine.objectContaining(expectedActions))
      })
    })


    it('fires BREEZY_REQUEST_ERROR when the SJR returns nothing', () => {
      const store = mockStore(initialState())
      spyOn(connect, 'getStore').and.returnValue(store)

      fetchMock
        .mock('/foo?__=0', {
          body: ``,
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline'
          }
        })

      const expectedActions = [
        { type: '@@breezy/BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
        { type: '@@breezy/OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
        {type: '@@breezy/FETCH_ERROR', payload:{error: 'Could not parse Server Generated Javascript Response for Breezy' }}
      ]

      return store.dispatch(visit('/foo')).catch((err) => {
        expect(err.message).toEqual('Could not parse Server Generated Javascript Response for Breezy')
        expect(err.response.status).toEqual(200)
        expect(store.getActions()).toEqual(jasmine.objectContaining(expectedActions))
      })
    })

    it('fires another BREEZY_SAVE_RESPONSE when the response has deferments', (done) => {
      const store = mockStore(initialState())
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')
      fetchMock
        .mock('/foo?__=0', {
          body: `(function() {
            var defers=[];
            defers.push({url: '/some_defered_request'})
            return {
              data: { heading: 'Some heading 2' },
              title: 'title 2',
              csrf_token: 'token',
              assets: ['application-123.js', 'application-123.js'],
              defers: defers
            };
          })();`,
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/foo'
          }
        })

      fetchMock
        .mock('/some_defered_request?__=0', {
          body: `(function() {
            var defers=[];
            return {
              data: { heading: 'defered response heading' },
              title: 'title 2',
              csrf_token: 'token',
              assets: ['application-123.js', 'application-123.js'],
              defers: defers
            };
          })();`,
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/some_defered_request'
          }
        })


      store.subscribe(() => {
        const state = store.getState()
        const actions = store.getActions()
        const lastAction = actions[actions.length - 1]
        const {type, pathQuery, page} = lastAction;

        if(type === '@@breezy/SAVE_RESPONSE' && page.data.heading === 'defered response heading') {
          done()
        }
      })

      store.dispatch(visit('/foo'))
    })

    it('fires BREEZY_HANDLE_GRAFT when the response is a graft', (done) => {
      const store = mockStore({...initialState(), pages: {
        '/foo': {}
      }})
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')
      fetchMock
        .mock('/foo?__=0', {
          body: `(function() {
            var defers=[];
            return {
              data: 'success',
              action: 'graft',
              path: 'heading.cart',
              title: 'title 2',
              csrf_token: 'token',
              assets: ['application-123.js', 'application-123.js'],
              defers: defers
            };
          })();`,
          headers: {
            'content-type': 'application/javascript',
            'content-disposition': 'inline',
            'x-response-url': '/foo'
          }
        })

      store.subscribe(() => {
        const state = store.getState()
        const actions = store.getActions()
        const lastAction = actions[actions.length - 1]
        const {type, pageKey, page} = lastAction;

        if(type === '@@breezy/HANDLE_GRAFT') {
          expect(pageKey).toEqual('/foo')
          expect(page.data).toEqual('success')
          done()
        }
      })

      store.dispatch(visit('/foo'))
    })
  })






  it('will only allow one navigatable visit at a time, any earlier requests just saves', (done) => {
    const initialState = {
      breezy: {
        assets:[],
        controlFlows: {
          visit: 'firstId'
        }
      }
    }

    const store = mockStore(initialState)
    spyOn(connect, 'getStore').and.returnValue(store)

    let mockResponse = rsp.visitSuccess()
    mockResponse.headers['x-response-url'] = '/first'
    fetchMock.mock('/first?__=0', delay(500).then(() => mockResponse))

    let mockResponse2 = rsp.visitSuccess()
    mockResponse2.headers['x-response-url'] = '/second'
    fetchMock.mock('/second?__=0', delay(2000).then(() => mockResponse2))

    const spy = spyOn(helpers, 'uuidv4')
    spy.and.returnValue('firstId')
    store.dispatch(visit('/first')).then((meta)=>{
      expect(meta.canNavigate).toEqual(false)
    })

    spy.and.returnValue('secondId')
    initialState.breezy.controlFlows.visit = 'secondId'

    const expectedActions = [
      { type: '@@breezy/BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
      { type: '@@breezy/OVERRIDE_VISIT_SEQ', seqId: 'firstId' },
      { type: '@@breezy/BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
      { type: '@@breezy/OVERRIDE_VISIT_SEQ', seqId: 'secondId' },
      { type: '@@breezy/SAVE_RESPONSE',
        pageKey: '/first',
        page: jasmine.any(Object)
      },
      { type: '@@breezy/SAVE_RESPONSE',
        pageKey: '/second',
        page: jasmine.any(Object)
      }
    ]

    store.dispatch(visit('/second')).then((meta) => {
      expect(meta.canNavigate).toEqual(true)
      expect(store.getActions()).toEqual(expectedActions)
      done()
    })
  })


  describe('remote', () => {
    it('raises error when no pageKey is passed ', () => {
      expect(() => {
        remote('/foo', {})
      }).toThrow(new Error("pageKey is a required parameter"))
    })

    it('will fire and resolve', (done) => {
      const store = mockStore({
        breezy: {
          assets:[],
        }
      })

      spyOn(helpers, 'uuidv4').and.returnValue('nextId')
      spyOn(connect, 'getStore').and.returnValue(store)

      let mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('/foo?__=0', mockResponse)

      const expectedActions = [
        { type: '@@breezy/BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
        {
          type: '@@breezy/SAVE_RESPONSE',
          pageKey: '/foo',
          page: jasmine.any(Object)
        }
      ]
      const req = store.dispatch(remote('/foo', {}, '/foo'))
      req.then(() => {
        expect(store.getActions()).toEqual(expectedActions)
        done()
      })
    })
  })
})

