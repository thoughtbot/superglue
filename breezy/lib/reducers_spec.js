import { pageReducer as reducer, controlFlowReducer } from '../lib/reducers'

describe('reducers', () => {
  describe('page reducer', () => {
    describe('BREEZY_EXTEND_IN_JOINT', () => {
      it('merges a key at joint', () => {
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
              info: ['header']
            }
          }
        }

        const nextState = reducer(prevState, {
          type: 'BREEZY_EXTEND_IN_JOINT',
          name: 'info',
          keypath: 'cart',
          value: {foo: 'bar'}
        })

        expect(nextState).toEqual({
          '/foo': {
            data: {
              header: {
                cart: {
                  total: 30,
                  foo: 'bar'
                }
              }
            },
            csrf_token: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['header']
            }
          }
        })
      })
    })

    describe('BREEZY_DEL_IN_JOINT', () => {
      it('deletes a key at joint', () => {
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

        const nextState = reducer(prevState, {
          type: 'BREEZY_DEL_IN_JOINT',
          name: 'info',
          keypath: 'total'
        })

        expect(nextState).toEqual({
          '/foo': {
            data: {
              header: {
                cart: {}
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
    describe('BREEZY_SET_IN_JOINT', () => {
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

        const nextState = reducer(prevState, {
          type: 'BREEZY_SET_IN_JOINT',
          name: 'info',
          value: 300,
          keypath: 'total'
        })

        expect(nextState).toEqual({
          '/foo': {
            data: {
              header: {
                cart: {
                  total:300
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

    describe('BREEZY_EXTEND_IN_PAGE', () => {
      it('immutably merges in the page', () => {
        const cart = {total: 30}
        const prevState = {
          '/foo': {
            data: {
              header: {
                cart
              }
            },
            csrf_token: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['header.cart']
            }
          }
        }

        const nextState = reducer(prevState, {
          type: 'BREEZY_EXTEND_IN_PAGE',
          pageKey: '/foo',
          keypath: 'header',
          value: {sibling: 90}
        })

        const newHeader = nextState['/foo'].data.header
        expect(newHeader.cart).toBe(cart)
        expect(newHeader.sibling).toEqual(90)
      })
    })

    describe('BREEZY_DEL_IN_PAGE', () => {
      it('immutably deletes in the page', () => {
        const sibling = {cat: 10}
        const prevState = {
          '/foo': {
            data: {
              header: {
                sibling,
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

        const nextState = reducer(prevState, {
          type: 'BREEZY_DEL_IN_PAGE',
          pageKey: '/foo',
          keypath: 'header.cart',
        })

        const newHeader = nextState['/foo'].data.header
        expect(newHeader.cart).toEqual(undefined)
        expect(newHeader.sibling).toBe(sibling)
      })
    })

    describe('BREEZY_SET_IN_PAGE', () => {
      it('immutably sets in the page', () => {
        const sibling = {cat: 10}
        const prevState = {
          '/foo': {
            data: {
              header: {
                sibling,
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

        const nextState = reducer(prevState, {
          type: 'BREEZY_SET_IN_PAGE',
          pageKey: '/foo',
          keypath: 'header.cart',
          value: {foo: 3}
        })

        const newHeader = nextState['/foo'].data.header
        expect(newHeader.cart).toEqual({foo: 3})
        expect(newHeader.sibling).toBe(sibling)
      })
    })

    describe('BREEZY_HANDLE_GRAFT', () => {
      it('takes a grafting response and grafts it', () => {
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
          pageKey: '/foo',
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

      it('takes a grafting response with joints and grafts it across', () => {
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
              user_header: ['header']
            }
          },
          '/other': {
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
              user_header: ['header']
            }
          }
        }

        const graftResponse = {
          data: { total: 100},
          action: 'graft',
          path: 'header.cart',
          joints: {
            user_header: ['header']
          }
        }

        const nextState = reducer(prevState, {
          type: 'BREEZY_HANDLE_GRAFT',
          pageKey: '/foo',
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
              user_header: ['header']
            }
          },
          '/other': {
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
              user_header: ['header']
            }
          }
        })
      })
    })

    describe('BREEZY_SAVE_RESPONSE', () => {
      it('saves page', () => {
        const prevState = {}
        const nextState = reducer(prevState, {
          type: 'BREEZY_SAVE_RESPONSE',
          pageKey: '/foo',
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
          pageKey: '/foo',
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
          type: 'BREEZY_SAVE_RESPONSE',
          pageKey: '/bar',
          page: nextPage
        })

        const nextStateCartTotal = nextState['/foo'].data.header.cart.total;
        expect(nextStateCartTotal).toEqual(10)
      })
    })
  })
})
