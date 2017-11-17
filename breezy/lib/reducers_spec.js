import { pageReducer as reducer } from '../lib/reducers'

describe('reducer', () => {
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
