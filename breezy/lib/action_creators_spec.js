import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import {visit} from './action_creators.js'
import * as helpers from './utils/helpers'
import * as connect from './connector'
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('async actions', () => {
  beforeEach(() =>{
  })

  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('fires BREEZY_SAVE_PAGE when fetching', () => {
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
        type: 'BREEZY_SAVE_PAGE',
        page: {
          data: { heading: 'Some heading 2' },
          title: 'title 2',
          csrf_token: 'token',
          assets: ['application-123.js', 'application-123.js']
        }
      }
    ]

    return store.dispatch(visit({url: '/foo'})).then(() => {
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

//  it('refreshes the browser when there are new assets', () => {
//     const store = mockStore({
//       breezy: {
//         currentUrl: '/bar',
//         csrfToken: 'token',
//         flow: {
//           visit: 'fakeUUID'
//         }
//       }
//     })
//     spyOn(helpers, 'uuidv4').and.callFake(() => 'fakeUUID')
//     spyOn(helpers, 'refreshBrowser').and.callFake(() => 'fakeUUID')
//
//     fetchMock
//       .mock('/foo', {
//         body: `(function() {
//           return {
//             data: { heading: 'Some heading 2' },
//             title: 'title 2',
//             csrf_token: 'token',
//             assets: ['application-123.js', 'application-123.js']
//           };
//         })();`,
//         headers: {
//           'content-type': 'application/javascript',
//           'content-disposition': 'inline'
//         }
//       })
//
//
//     return store.dispatch(remote({url: '/foo'}))
//   })

  // it('fires noop when the reponse is 204', () => {
  //   const store = mockStore({
  //     breezy: {
  //       currentUrl: '/bar',
  //       csrfToken: 'token',
  //       controlFlows: {
  //         visit: 'fakeUUID'
  //       }
  //     }
  //   })
  //   spyOn(connect, 'getStore').and.returnValue(store)
  //
  //   fetchMock.mock('/foo', {
  //     headers: {
  //       'content-type': 'application/javascript',
  //       'content-disposition': 'inline'
  //     },
  //     status: 204
  //   })
  //
  //
  //   const expectedActions = [
  //     { type: 'BREEZY_BEFORE_FETCH' },
  //     { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: jasmine.any(String)},
  //     { type: 'BREEZY_PAGE_CHANGE'},
  //     { type: 'BREEZY_NOOP' }
  //   ]
  //
  //   return store.dispatch(remote({url: '/foo'})).then(() => {
  //     const requestheaders = fetchMock.lastCall('/foo')[1].headers
  //     expect(requestheaders).toEqual({
  //       accept: "text/javascript, application/x-javascript, application/javascript",
  //       'x-xhr-referer': '/bar',
  //       'x-requested-with': "XMLHttpRequest",
  //       'x-csrf-token': 'token'
  //     })
  //     expect(store.getActions()).toEqual((expectedActions))
  //   })
  // })


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

    return store.dispatch(visit({url: '/foo'})).catch((err) => {
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

    return store.dispatch(visit({url: '/foo'})).catch((err) => {
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

    return store.dispatch(visit({url: '/foo'})).catch((err) => {
      expect(err.message).toEqual('Could not parse Server Generated Javascript Response for Breezy')
      expect(err.response.status).toEqual(200)
      expect(store.getActions()).toEqual(jasmine.objectContaining(expectedActions))
    })
  })

  it('fires another BREEZY_SAVE_PAGE when the response has deferments', (done) => {
    const store = mockStore({
      breezy: {
        currentUrl: '/bar',
        csrfToken: 'token',
        controlFlows: {
          visit: 'fakeUUID',
          asyncNoOrder: ['fakeUUID']
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

      if(type === 'BREEZY_SAVE_PAGE' && url === '/some_defered_request') {
        done()
      }
    })

    store.dispatch(visit({url: '/foo'}))
  })
})

