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
      .mock('/foo', {
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
          'content-disposition': 'inline'
        }
      })


    const expectedActions = [
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: jasmine.any(Object)},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      { type: 'BREEZY_PAGE_CHANGE'},
      {
        url: '/foo',
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
      const requestheaders = fetchMock.lastCall('/foo')[1].headers
      expect(requestheaders).toEqual({
        accept: "text/javascript, application/x-javascript, application/javascript",
        'x-xhr-referer': '/bar',
        'x-requested-with': "XMLHttpRequest",
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

    fetchMock.mock('/foo', {status: 500})

    const expectedActions = [
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: jasmine.any(Object)},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      { type: 'BREEZY_PAGE_CHANGE' },
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
    fetchMock.mock('/foo', {status: 200, headers: {
      'content-type': 'text/bad'
    }})

    const expectedActions = [
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: jasmine.any(Object)},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      { type: 'BREEZY_PAGE_CHANGE' },
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
      .mock('/foo', {
        body: ``,
        headers: {
          'content-type': 'application/javascript',
          'content-disposition': 'inline'
        }
      })

    const expectedActions = [
      { type: 'BREEZY_BEFORE_FETCH', fetchArgs: jasmine.any(Object)},
      { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
      { type: 'BREEZY_PAGE_CHANGE' },
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
      .mock('/foo', {
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
          'content-disposition': 'inline'
        }
      })

    fetchMock
      .mock('/some_defered_request', {
        body: `(function() {
          var defers=[];
          return {
            data: { heading: 'Seconds heading baz' },
            title: 'title 2',
            csrf_token: 'token',
            assets: ['application-123.js', 'application-123.js'],
            defers: defers
          };
        })();`,
        headers: {
          'content-type': 'application/javascript',
          'content-disposition': 'inline'
        }
      })


    store.subscribe(() => {
      const state = store.getState()
      const actions = store.getActions()
      const lastAction = actions[actions.length - 1]
      const {type, url} = lastAction;

      if(type === 'BREEZY_SAVE_RESPONSE' && url === '/some_defered_request') {
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
      it('will only allow one visit at a time, nooping any earlier requests', (done) => {
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

        fetchMock.mock('/first', delay(500).then(rsp.visitSuccess))
        fetchMock.mock('/second', delay(2000).then(rsp.visitSuccess))

        const spy = spyOn(helpers, 'uuidv4')
        spy.and.returnValue('firstId')
        store.dispatch(visit('/first'))

        spy.and.returnValue('secondId')
        initialState.breezy.controlFlows.visit = 'secondId'

        const expectedActions = [
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: 'firstId' },
          { type: 'BREEZY_PAGE_CHANGE' },
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: 'secondId' },
          { type: 'BREEZY_PAGE_CHANGE' },
          { type: 'BREEZY_NOOP' },
          { type: 'BREEZY_SAVE_RESPONSE',
            url: '/second',
            page: jasmine.any(Object)
          }
        ]

        store.dispatch(visit('/second')).then(() => {
          expect(store.getActions()).toEqual(expectedActions)
          done()
        })
      })
    })


    describe('remoteInOrder', () => {
      it('will fire everything but resolve in the order of call', (done) => {
        const initialState = {
          breezy: {
            assets:[],
            controlFlows: {
              remoteInOrder: [
                {seqId: 'firstId', done: false, action: {type: 'BREEZY_SAVE_RESPONSE'}},
                {seqId: 'secondId', done: false, action: {type: 'BREEZY_SAVE_RESPONSE'}}
              ]
            }
          }
        }

        const store = mockStore(initialState)
        spyOn(connect, 'getStore').and.returnValue(store)

        const expectedActions = [
          { type: 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM', seqId: 'firstId' },
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          { type: 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM', seqId: 'secondId' },
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          {
            type: 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM',
            action:{
              type: 'BREEZY_SAVE_RESPONSE',
              url: '/second',
              page: jasmine.any(Object)
            },
            seqId: 'secondId'
          },
          { type: 'BREEZY_ASYNC_IN_ORDER_DRAIN', index: 0 },
          {
            type: 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM',
            action: {
              type: 'BREEZY_SAVE_RESPONSE',
              url: '/first',
              page: jasmine.any(Object)
            },
            seqId: 'firstId'
          },
          { type: 'BREEZY_SAVE_RESPONSE' },
          { type: 'BREEZY_SAVE_RESPONSE' },
          { type: 'BREEZY_ASYNC_IN_ORDER_DRAIN', index: 2 }
        ]

        fetchMock.mock('/first', delay(500).then(() => {
          initialState.breezy.controlFlows.remoteInOrder[0].done = true
          initialState.breezy.controlFlows.remoteInOrder[1].done = true
          return rsp.visitSuccess
        }))
        fetchMock.mock('/second', delay(200).then(rsp.visitSuccess))

        const spy = spyOn(helpers, 'uuidv4')
        spy.and.returnValue('firstId')
        store.dispatch(remoteInOrder('/first')).then(() => {
          expect(store.getActions()).toEqual(expectedActions)
          done()
        })

        spy.and.returnValue('secondId')
        store.dispatch(remoteInOrder('/second'))
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

        fetchMock.mock('/foo', rsp.visitSuccess)
        const expectedActions = [
          { type: 'BREEZY_ASYNC_NO_ORDER_QUEUE_ITEM', seqId: 'nextId' },
          { type: 'BREEZY_BEFORE_FETCH' ,fetchArgs: jasmine.any(Object)},
          {
            type: 'BREEZY_SAVE_RESPONSE',
            url: '/foo',
            page: jasmine.any(Object)
          }
        ]
        const req = store.dispatch(remote('/foo'))
        req.then(() => {
          expect(store.getActions()).toEqual(expectedActions)
          done()
        })
      })
    })
  })
})

