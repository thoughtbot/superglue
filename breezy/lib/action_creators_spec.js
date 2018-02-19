import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import {
  visit,
  remoteInOrder,
  remote
} from './action_creators'
import * as helpers from './utils/helpers'
import * as connect from './connector'
import * as rsp from '../spec/fixtures'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const delay = (duration) => {
  return new Promise((res, rej) => setTimeout(res, duration))
}

describe('action creators', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('fires BREEZY_SAVE_RESPONSE when fetching', () => {
    const store = mockStore({
      breezy: {
        currentUrl: '/bar',
        csrfToken: 'token',
        controlFlows: {
          visit: 'fakeUUID'
        }
      }
    })
    spyOn(connect, 'getStore').and.returnValue(store)
    spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')

    fetchMock
      .mock('/foo?__=0', {
        body: `(function() {
          return {
            data: { heading: 'Some heading 2' },
            title: 'title 2',
            csrf_token: 'token',
            assets: ['application-123.js', 'application-123.js']
          };
        })();`,
        headers: {
          'content-type': 'application/javascript',
          'content-disposition': 'inline',
          'x-response-url': '/foo'
        }
      })


    const expectedActions = [
      { type: 'BREEZY_BEFORE_VISIT'},
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      {
        pathQuery: '/foo',
        type: 'BREEZY_SAVE_RESPONSE',
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

  it('fires BREEZY_REQUEST_ERROR on a bad server response status', () => {
    const store = mockStore({
      breezy: {
        currentUrl: '/bar',
        csrfToken: 'token',
        controlFlows: {
          visit: 4
        }
      }
    })

    fetchMock.mock('/foo?__=0', {status: 500})

    const expectedActions = [
      { type: 'BREEZY_BEFORE_VISIT' },
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      {
        type: 'BREEZY_FETCH_ERROR',
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
    const store = mockStore({
      breezy: {
        currentUrl: '/bar',
        csrfToken: 'token',
        controlFlows: {
          visit: 4
        }
      }
    })
    spyOn(connect, 'getStore').and.returnValue(store)
    fetchMock.mock('/foo?__=0', {status: 200, headers: {
      'content-type': 'text/bad'
    }})

    const expectedActions = [
      { type: 'BREEZY_BEFORE_VISIT'},
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      {
        type: 'BREEZY_FETCH_ERROR',
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
    const store = mockStore({
      breezy: {
        currentUrl: '/bar',
        csrfToken: 'token',
        controlFlows: {
          visit: 4
        }
      }
    })
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
      { type: 'BREEZY_BEFORE_VISIT' },
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: ['/foo?__=0', jasmine.any(Object)]},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      {type: 'BREEZY_FETCH_ERROR', payload:{error: 'Could not parse Server Generated Javascript Response for Breezy' }}
    ]

    return store.dispatch(visit('/foo')).catch((err) => {
      expect(err.message).toEqual('Could not parse Server Generated Javascript Response for Breezy')
      expect(err.response.status).toEqual(200)
      expect(store.getActions()).toEqual(jasmine.objectContaining(expectedActions))
    })
  })

  it('fires another BREEZY_SAVE_RESPONSE when the response has deferments', (done) => {
    const store = mockStore({
      breezy: {
        currentUrl: '/bar',
        csrfToken: 'token',
        controlFlows: {
          visit: 'fakeUUID',
          remote: ['fakeUUID']
        }
      }
    })
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

      if(type === 'BREEZY_SAVE_RESPONSE' && page.data.heading === 'defered response heading') {
        done()
      }
    })

    store.dispatch(visit('/foo'))
  })

  describe('control flows', () => {
    beforeEach(() => {
      fetchMock.restore()
    })

    describe('visit', () => {
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
          { type: 'BREEZY_BEFORE_VISIT' },
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: 'firstId' },
          { type: 'BREEZY_BEFORE_VISIT' },
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: 'secondId' },
          { type: 'BREEZY_SAVE_RESPONSE',
            pathQuery: '/first',
            page: jasmine.any(Object)
          },
          { type: 'BREEZY_NOOP' },
          { type: 'BREEZY_SAVE_RESPONSE',
            pathQuery: '/second',
            page: jasmine.any(Object)
          }
        ]

        store.dispatch(visit('/second')).then((meta) => {
          expect(meta.canNavigate).toEqual(true)
          expect(store.getActions()).toEqual(expectedActions)
          done()
        })
      })
    })


    describe('remote', () => {
      it('will fire and resolve', (done) => {
        const store = mockStore({
          breezy: {
            assets:[],
            controlFlows: {
              remote: ['nextId']
            }
          }
        })

        spyOn(helpers, 'uuidv4').and.returnValue('nextId')
        spyOn(connect, 'getStore').and.returnValue(store)

        let mockResponse = rsp.visitSuccess()
        mockResponse.headers['x-response-url'] = '/foo'
        fetchMock.mock('/foo?__=0', mockResponse)

        const expectedActions = [
          { type: 'BREEZY_BEFORE_REMOTE'},
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          {
            type: 'BREEZY_SAVE_RESPONSE',
            pathQuery: '/foo',
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
})

