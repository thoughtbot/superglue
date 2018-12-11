import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import {
  visit,
  wrappedFetch,
  remote,
  handleGraft,
  beforeFetch,
  handleError,
  saveResponse,
  ensureSingleVisit,
  saveAndProcessPage
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
          csrfToken: 'token',
          assets: [],
          defers: []
        };
      })();`
    )
}

describe('action creators', () => {
  describe('saveResponse', () => {
    it('fires SAVE_RESPONSE', () => {
      const pageKey = '/test'
      const page = {'foo': 'bar'}

      const action = saveResponse({
        pageKey,
        page,
      })

      expect(action).toEqual({
        type: '@@breezy/SAVE_RESPONSE',
        payload: {
          pageKey,
          page,
        }
      })
    })
  })

  describe('handleGraft', () => {
    it('fires HANDLE_GRAFT', () => {
      const pageKey = '/test'
      const node = {d: 'foo'}
      const pathToNode = 'a.b'
      const joints = {'foo': ['bar']}

      const action = handleGraft({
        pageKey,
        node,
        pathToNode,
        joints,
      })

      expect(action).toEqual({
        type: '@@breezy/HANDLE_GRAFT',
        payload: {
          pageKey,
          node,
          pathToNode,
          joints,
        }
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
            'x-breezy-location': '/foo'
          }
        })

      fetchMock
        .mock('/foo', {
          body: successfulBody(),
          headers: {
            'content-type': 'application/javascript',
            'x-response-url': '/foo'
          }
        })

      wrappedFetch(['/redirecting_url', {}], {}).then(done)
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
        assets: []
      }
      const store = mockStore(initialState())
      const expectedActions = [
        {
          type: '@@breezy/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: { heading: 'Some heading 2' },
              csrfToken: 'token',
              assets: []
            }
          }
        },
        {
          type: '@@breezy/UPDATE_ALL_JOINTS',
          payload: {
            pageKey: '/foo',
          }
        }
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual((expectedActions))
      })
    })

    it ('also handle deferments and fire more HANDLE_GRAFT',  () => {
      const store = mockStore({...initialState(), pages: {
        '/foo': {}
      }})
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

     const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        defers: [{url: '/some_defered_request?_bz=body'}]
      }

      const expectedActions = [
        {
          type: '@@breezy/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          }
        },
        {
          type:"@@breezy/UPDATE_ALL_JOINTS",
          payload: {
            pageKey:"/foo"
          }
        },
        {
          type: '@@breezy/BEFORE_FETCH',
          payload: jasmine.any(Object)
        },
        {
          type: '@@breezy/HANDLE_GRAFT',
          payload: {
            pageKey:"/foo",
            node:"success",
            pathToNode:"body",
            joints: {}
          },
        },
        {
          type:"@@breezy/UPDATE_ALL_JOINTS",
          payload: {
            pageKey:"/foo"
          }
        }
      ]

      fetchMock
        .mock('/some_defered_request?_bz=body&__=0', {
          body: `(function() {
            return {
              data: 'success',
              action: 'graft',
              path: 'body',
              csrfToken: 'token',
              assets: [],
              defers: []
            };
          })();`,
          headers: {
            'content-type': 'application/javascript',
            'x-response-url': '/some_defered_request'
          }
        })


      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual((expectedActions))
      })
    })

    it ('fires HANDLE_GRAFT and process a page',  () => {
      const store = mockStore({...initialState(), pages: {
        '/foo': {}
      }})

      const page = {
        data: 'success',
        action: 'graft',
        path: 'heading.cart',
        csrfToken: '',
        assets: [],
        defers: []
      }

      const expectedActions = [
        {
          type: '@@breezy/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            node: 'success',
            pathToNode: 'heading.cart',
            joints: {}
          }
        },
        {
          type: '@@breezy/UPDATE_ALL_JOINTS',
          payload: {
            pageKey: '/foo',
          }
        }
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual((expectedActions))
      })
    })

    it ('fires HANDLE_GRAFT, and process a page with a joint',  () => {
      const store = mockStore({...initialState(), pages: {
        '/foo': {}
      }})

      const page = {
        data: 'success',
        action: 'graft',
        path: 'heading.cart',
        csrfToken: '',
        assets: [],
        defers: [],
        joints: {
          info: ['header.email']
        },
        lastJointName: 'info',
        lastJointPath: 'header.email',
      }

      const expectedActions = [
        {
          type: '@@breezy/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            node: 'success',
            pathToNode: 'heading.cart',
            joints: {
              info: ['header.email']
            }
          }
        },
        {
          type: '@@breezy/MATCH_JOINTS_IN_PAGE',
          payload: {
            pageKey: '/foo',
            lastJointName: 'info',
            lastJointPath: 'header.email'
          }
        },
        {
          type: '@@breezy/UPDATE_ALL_JOINTS',
          payload: {
            pageKey: '/foo',
          }
        }
      ]

      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual((expectedActions))
      })
    })

    it ('fires a GRAFTING_ERROR when a fetch fails',  () => {
      const store = mockStore({...initialState(), pages: {
        '/foo': {}
      }})
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

     const page = {
        data: { heading: 'Some heading 2' },
        csrfToken: 'token',
        assets: [],
        defers: [{url: '/some_defered_request?_bz=body'}]
      }

      const expectedActions = [
        {
          type: '@@breezy/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: page,
          }
        },
        {
          type:"@@breezy/UPDATE_ALL_JOINTS",
          payload: {
            pageKey:"/foo"
          }
        },
        {
          type: '@@breezy/BEFORE_FETCH',
          payload: jasmine.any(Object)
        },
        {
          type: '@@breezy/ERROR',
          payload: jasmine.any(Object),
        },
        {
          type: '@@breezy/GRAFTING_ERROR',
          payload: {
            url: '/some_defered_request?_bz=body',
            pageKey:"/foo",
            err: jasmine.any(Object),
            keyPath: "body",
          },
        },
      ]

      fetchMock
        .mock('/some_defered_request?_bz=body&__=0', 500)


      return store.dispatch(saveAndProcessPage('/foo', page)).then(() => {
        expect(store.getActions()).toEqual((expectedActions))
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
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

      fetchMock
        .mock('/foo?__=0', {
          body: successfulBody(),
          headers: {
            'content-type': 'application/javascript',
            'x-response-url': '/foo'
          }
        })

      const expectedActions = [
        { type: '@@breezy/BEFORE_FETCH', payload: {fetchArgs: ['/foo?__=0', jasmine.any(Object)]}},
        {
          type: '@@breezy/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: { heading: 'Some heading 2' },
              csrfToken: 'token',
              assets: [],
              defers: [],
            }
          }
        },
        {
          type: '@@breezy/UPDATE_ALL_JOINTS',
          payload: {
            pageKey: '/foo',
          }
        }
      ]

      return store.dispatch(remote('/foo')).then(() => {
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
            'x-response-url': '/foo'
          }
        })


      return store.dispatch(remote('/with_pagekey_override', {method: 'POST'}, '/bar_override')).then((meta) => {
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
            'x-response-url': '/will_NOT_be_used',
            'content-location': '/will_be_used',
          }
        })


      return store.dispatch(remote('/foo', {method: 'POST'})).then((meta) => {
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
            'x-response-url': '/will_be_used',
          }
        })

      return store.dispatch(remote('/foo', {method: 'POST'})).then((meta) => {
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
        { type: '@@breezy/BEFORE_FETCH', payload: {fetchArgs: ['/foo?__=0', jasmine.any(Object)]}},
        {
          type: '@@breezy/ERROR',
          payload:{message: "Internal Server Error" }
        }
      ]

      return store.dispatch(remote('/foo')).catch((err) => {
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
        { type: '@@breezy/BEFORE_FETCH', payload:{fetchArgs: ['/foo?__=0', jasmine.any(Object)]}},
        {
          type: '@@breezy/ERROR',
          payload:{message: "Invalid Breezy Response" }
        }
      ]

      return store.dispatch(remote('/foo')).catch((err) => {
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
          }
        })

      const expectedActions = [
        { type: '@@breezy/BEFORE_FETCH', payload:{fetchArgs: ['/foo?__=0', jasmine.any(Object)]}},
        { type: '@@breezy/ERROR', payload:{message: 'Could not parse Server Generated Javascript Response for Breezy' }}
      ]

      return store.dispatch(remote('/foo')).catch((err) => {
        expect(err.message).toEqual('Could not parse Server Generated Javascript Response for Breezy')
        expect(err.response.status).toEqual(200)
        expect(store.getActions()).toEqual(jasmine.objectContaining(expectedActions))
      })
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
              csrfToken: 'token',
              assets: [],
              defers: defers
            };
          })();`,
          headers: {
            'content-type': 'application/javascript',
            'x-response-url': '/foo'
          }
        })

      store.subscribe(() => {
        const state = store.getState()
        const actions = store.getActions()
        const lastAction = actions[actions.length - 1]
        const {type, payload} = lastAction
        const {pageKey, node, pathToNode} = payload

        if(type === '@@breezy/HANDLE_GRAFT') {
          expect(pageKey).toEqual('/foo')
          expect(node).toEqual('success')
          expect(pathToNode).toEqual('heading.cart')
          done()
        }
      })

      store.dispatch(remote('/foo'))
    })
  })

  describe('visit', () => {
    afterEach(() => {
      fetchMock.reset()
      fetchMock.restore()
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
        { type: '@@breezy/OVERRIDE_VISIT_SEQ', payload: {seqId: 'firstId' }},
        { type: '@@breezy/BEFORE_FETCH' , payload: jasmine.any(Object)},
        { type: '@@breezy/OVERRIDE_VISIT_SEQ', payload: {seqId: 'secondId' }},
        { type: '@@breezy/BEFORE_FETCH', payload: jasmine.any(Object)},
        { type: '@@breezy/SAVE_RESPONSE',
          payload: jasmine.any(Object)
        },
        { type: '@@breezy/UPDATE_ALL_JOINTS',
          payload: jasmine.any(Object)
        },
        { type: '@@breezy/SAVE_RESPONSE',
          payload: jasmine.any(Object)
        },
        { type: '@@breezy/UPDATE_ALL_JOINTS',
          payload: jasmine.any(Object)
        }
      ]

      store.dispatch(visit('/second')).then((meta) => {
        expect(meta.canNavigate).toEqual(true)
        expect(store.getActions()).toEqual(expectedActions)
        done()
      })
    })
  })

  describe('ensureSingleVisit', () => {
    it('takes a fn that returns a promise and resolves it with canNavigate:true with one active visit', (done) => {
      const initialState = {
        breezy: {
          controlFlows: {
            visit: 'nextId'
          }
        }
      }

      const store = mockStore(initialState)
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'nextId')

      const customVisit = ensureSingleVisit(() => {
        const meta = {}
        return Promise.resolve(meta)
      })

      store.dispatch(customVisit).then((meta) => {
        expect(meta.canNavigate).toEqual(true)
        done()
      })
    })

    it('takes a fn that returns a promise and resolves it with canNavigate:false when another ensureSingleVisit is called elsewhere', (done) => {
      const initialState = {
        breezy: {
          controlFlows: {
            visit: 'nextId'
          }
        }
      }

      const store = mockStore(initialState)
      spyOn(connect, 'getStore').and.returnValue(store)
      spyOn(helpers, 'uuidv4').and.callFake(() => 'nextId')

      const customVisit = ensureSingleVisit(() => {
        const meta = {}
        initialState.breezy.controlFlows.visit = 'uuid_of_visit_that_got_initiated_elsewhere_while_this_was_resolving'
        return Promise.resolve(meta)
      })

      store.dispatch(customVisit).then((meta) => {
        expect(meta.canNavigate).toEqual(false)
        done()
      })
    })
  })
})

