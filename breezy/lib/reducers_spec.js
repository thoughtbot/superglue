import { pageReducer as reducer, controlFlowReducer } from '../lib/reducers'

describe('reducers', () => {
  describe('page reducer', () => {
    describe('BREEZY_HANDLE_GRAFT', () => {
      it('take a grafting response and grafts it', () => {
        const prevState = {
          '/foo': {
            data: {
              header: {
                cart: {
                  total: 30
                }
              }
            },
            csrf_token: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['header.cart']
            }
          }
        }

        const graftResponse = {
          data: { total: 100},
          action: 'graft',
          path: 'header.cart',
          title: 'foobar',
          csrf_token: 'token',
          assets: ['application-123.js']
        }

        const nextState = reducer(prevState, {
          type: 'BREEZY_HANDLE_GRAFT',
          url: '/foo',
          page: graftResponse
        })

        expect(nextState).toEqual({
          '/foo': {
            data: {
              header: {
                cart: {
                  total: 100
                }
              }
            },
            csrf_token: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['header.cart']
            }
          }
        })
      })
    })

    describe('BREEZY_SAVE_PAGE', () => {
      it('saves page', () => {
        const prevState = {}
        const nextState = reducer(prevState, {
          type: 'BREEZY_SAVE_PAGE',
          url: '/foo',
          page: {
            data: {},
            csrf_token: 'token',
            assets: ['application-123.js']
          }
        })

        expect(nextState['/foo']).toEqual(jasmine.objectContaining({
          data: {},
          csrf_token: 'token',
          cachedAt: jasmine.any(Number),
          assets: [ 'application-123.js' ],
          pathname: '/foo',
          joints: {}
        }))
      })

      it('grafts any joints', () => {
        const prevState = {
          '/foo': {
            data: {
              header: {
                cart: {
                  total: 30
                }
              }
            },
            csrf_token: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['header.cart']
            }
          }
        }

        const nextPage = {
          data: {
            profile: {
              header: {
                cart: {
                  total: 10
                }
              }
            }
          },
          csrf_token: 'token',
          assets: ['application-123.js'],
          joints: {
            info: ['profile.header.cart']
          }
        }

        const nextState = reducer(prevState, {
          type: 'BREEZY_SAVE_PAGE',
          url: '/bar',
          page: nextPage
        })

        const nextStateCartTotal = nextState['/foo'].data.header.cart.total;
        expect(nextStateCartTotal).toEqual(10)
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
})
