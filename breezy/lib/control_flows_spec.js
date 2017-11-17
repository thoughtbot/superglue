import {
  visit,
  asyncInOrder,
  asyncNoOrder
} from './control_flows'
import { pageReducer, breezyReducer, controlFlowReducer } from './reducers'
import * as helpers from './action_creators'
import * as rsp from '../spec/fixtures'
import fetchMock from 'fetch-mock'
import * as connect from './connector'
import configureMockStore from 'redux-mock-store'
import * as util_helpers from './utils/helpers'

const delay = (duration) => {
  return new Promise((res, rej) => setTimeout(res, duration))
}

describe('control flows', () => {
  beforeEach(() => {
    fetchMock.restore()
  })

  describe('visit', () => {
    it('will only allow one visit at a time, nooping any earlier requests', (done) => {
      const mockStore = configureMockStore()
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

      const spy = spyOn(util_helpers, 'uuidv4')
      spy.and.returnValue('firstId')
      visit(store.getState, store.dispatch, ['/first', {}], true)

      spy.and.returnValue('secondId')
      initialState.breezy.controlFlows.visit = 'secondId'

      const expectedActions = [
        { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: 'firstId' },
        { type: 'BREEZY_PAGE_CHANGE' },
        { type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId: 'secondId' },
        { type: 'BREEZY_PAGE_CHANGE' },
        { type: 'BREEZY_NOOP' },
        { type: 'BREEZY_SAVE_PAGE',
          url: '/second',
          page: jasmine.any(Object)
        }
      ]

      visit(store.getState, store.dispatch, ['/second', {}], true).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
        done()
      })
    })
  })

  describe('controlFlowReducer', () => {
    describe('BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM', () => {
      it('adds an item to the flow', () => {
        const state = {asyncInOrder: []}
        let nextState = controlFlowReducer(state, {
          type: 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM',
          seqId: 1
        })

        expect(nextState.asyncInOrder).toEqual([{
          seqId: 1,
          done: false,
          action: null
        }])
      })
    })

    describe('BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM', () => {
      it('updates the queued item with passed action', () => {
        const state = {asyncInOrder: [
          {
            seqId: 0,
            done: false,
            action: null
          },
          {
            seqId: 1,
            done: false,
            action: null
          }
        ]}

        let nextState = controlFlowReducer(state, {
          type: 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM',
          seqId: 1,
          action: {foo: 'bar'}
        })

        expect(nextState.asyncInOrder).toEqual([
          {
            seqId: 0,
            done: false,
            action: null
          },
          {
            seqId: 1,
            done: true,
            action:{foo: 'bar'}
          }
        ])
      })
    })

    describe('BREEZY_ASYNC_IN_ORDER_DRAIN', () => {
      it('drains the q', () => {
        const state = {asyncInOrder: [
          {a: 1}, {b: 2}, {c: 3}
        ]}

        let nextState = controlFlowReducer(state, {
          type: 'BREEZY_ASYNC_IN_ORDER_DRAIN',
          index: 2
        })

        expect(nextState.asyncInOrder).toEqual([
          {c: 3}
        ])
      })
    })
  })

  describe('asyncInOrder', () => {
    it('will fire everything but resolve in the order of call', (done) => {
      const mockStore = configureMockStore()
      const initialState = {
        breezy: {
          assets:[],
          controlFlows: {
            asyncInOrder: [
              {seqId: 'firstId', done: false, action: {type: 'BREEZY_SAVE_PAGE'}},
              {seqId: 'secondId', done: false, action: {type: 'BREEZY_SAVE_PAGE'}}
            ]
          }
        }
      }

      const store = mockStore(initialState)
      spyOn(connect, 'getStore').and.returnValue(store)

      const expectedActions = [
        { type: 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM', seqId: 'firstId' },
        { type: 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM', seqId: 'secondId' },
        {
          type: 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM',
          action:{
            type: 'BREEZY_SAVE_PAGE',
            url: '/second',
            page: jasmine.any(Object)
          },
          seqId: 'secondId'
        },
        { type: 'BREEZY_ASYNC_IN_ORDER_DRAIN', index: 0 },
        {
          type: 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM',
          action: {
            type: 'BREEZY_SAVE_PAGE',
            url: '/first',
            page: jasmine.any(Object)
          },
          seqId: 'firstId'
        },
        { type: 'BREEZY_SAVE_PAGE' },
        { type: 'BREEZY_SAVE_PAGE' },
        { type: 'BREEZY_ASYNC_IN_ORDER_DRAIN', index: 2 }
      ]

      fetchMock.mock('/first', delay(500).then(() => {
        initialState.breezy.controlFlows.asyncInOrder[0].done = true
        initialState.breezy.controlFlows.asyncInOrder[1].done = true
        return rsp.visitSuccess
      }))
      fetchMock.mock('/second', delay(200).then(rsp.visitSuccess))

      const spy = spyOn(util_helpers, 'uuidv4')
      spy.and.returnValue('firstId')
      asyncInOrder(store.getState, store.dispatch, ['/first', {}], false).then(() => {
        expect(store.getActions()).toEqual(expectedActions)
        done()
      })

      spy.and.returnValue('secondId')
      asyncInOrder(store.getState, store.dispatch, ['/second', {}], false)
    })
  })

  describe('asyncNoOrder', () => {
    it('will fire and resolve', (done) => {
      const mockStore = configureMockStore()
      const store = mockStore({
        breezy: {
          assets:[],
          controlFlows: {
            asyncNoOrder: ['nextId']
          }
        }
      })

      spyOn(util_helpers, 'uuidv4').and.returnValue('nextId')
      spyOn(connect, 'getStore').and.returnValue(store)

      fetchMock.mock('/foo', rsp.visitSuccess)
      const expectedActions = [
        { type: 'BREEZY_ASYNC_NO_ORDER_QUEUE_ITEM', seqId: 'nextId' },
        {
          type: 'BREEZY_SAVE_PAGE',
          url: '/foo',
          page: jasmine.any(Object)
        }
      ]
      const req = asyncNoOrder(store.getState, store.dispatch, ['/foo'], false)
      req.then(() => {
        expect(store.getActions()).toEqual(expectedActions)
        done()
      })
    })
  })
})
