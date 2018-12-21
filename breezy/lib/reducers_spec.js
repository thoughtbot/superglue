import {
  pageReducer as reducer,
  metaReducer,
  controlFlowReducer
} from '../lib/reducers'

describe('reducers', () => {
  describe('meta reducer', () => {
    describe('BREEZY_HISTORY_CHANGE', () => {
      it('sets the currentUrl', () => {
        const prevState = {foo: 'bar'}
        const action = {
          type: '@@breezy/HISTORY_CHANGE',
          payload: {
            url: '/some_url'
          }
        }
        const nextState = metaReducer(prevState, action)

        expect(nextState).toEqual({
          foo: 'bar',
          currentUrl: '/some_url'
        })
      })
    })

    describe('BREEZY_SET_BASE_URL', () => {
      it('sets the base URL', () => {
        const prevState = {foo: 'bar'}
        const action = {
          type: '@@breezy/SET_BASE_URL',
          payload: {
            baseUrl: '/some_url'
          }
        }
        const nextState = metaReducer(prevState, action)

        expect(nextState).toEqual({
          foo: 'bar',
          baseUrl: '/some_url'
        })
      })
    })

    describe('BREEZY_SAVE_RESPONSE', () => {
      it('saves the response csrfToken', () => {
        const prevState = {foo: 'bar'}
        const action = {
          type: '@@breezy/SAVE_RESPONSE',
          payload: {
            page: {csrfToken: 'some_token'}
          }
        }
        const nextState = metaReducer(prevState, action)

        expect(nextState).toEqual({
          foo: 'bar',
          csrfToken: 'some_token'
        })
      })
    })

    describe('BREEZY_SET_CSRF_TOKEN', () => {
      it('sets the initial CSRF token', () => {
        const prevState = {foo: 'bar'}
        const action = {
          type: '@@breezy/SET_CSRF_TOKEN',
          payload: {
            csrfToken: 'some_token'
          }
        }
        const nextState = metaReducer(prevState, action)

        expect(nextState).toEqual({
          foo: 'bar',
          csrfToken: 'some_token'
        })
      })
    })
  })

  describe('page reducer', () => {
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
            csrfToken: 'token',
            assets: ['application-123.js'],
            joints: {}
          }
        }

        const graftResponse = {
          data: { total: 100},
          action: 'graft',
          path: 'header.cart',
          title: 'foobar',
          csrfToken: 'token',
          assets: ['application-123.js']
        }

        const nextState = reducer(prevState, {
          type: '@@breezy/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            node: graftResponse.data,
            pathToNode: graftResponse.path,
          }
        })

        expect(nextState).not.toBe(prevState)
        expect(nextState).toEqual({
          '/foo': {
            data: {
              header: {
                cart: {
                  total: 100
                }
              }
            },
            csrfToken: 'token',
            assets: ['application-123.js'],
            joints: {}
          }
        })
      })

      it('takes any new joints and merges them', () => {
        const prevState = {
          '/foo': {
            data: {
              header: {
                cart: {
                  total: 30
                }
              }
            },
            csrfToken: 'token',
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
          csrfToken: 'token',
          joints: {
            info: ['header.cart.cat', 'header.cart.cat'],
            footer: ['footer']
          },
          assets: ['application-123.js']
        }

        const nextState = reducer(prevState, {
          type: '@@breezy/HANDLE_GRAFT',
          payload: {
            pageKey: '/foo',
            node: graftResponse.data,
            pathToNode: graftResponse.path,
            joints: graftResponse.joints
          }
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
            csrfToken: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['header.cart.cat', 'header.cart'],
              footer: ['footer']
            }
          }
        })
      })

      fit('throws cant find page if the page does not exist for grafting', () => {
        const prevState = {
        }

        const graftResponse = {
          data: { total: 100},
          action: 'graft',
          path: 'header.cart',
          title: 'foobar',
          csrfToken: 'token',
          joints: {
            info: ['header.cart.cat', 'header.cart.cat'],
            footer: ['footer']
          },
          assets: ['application-123.js']
        }

        expect(() => {
          const nextState = reducer(prevState, {
            type: '@@breezy/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              node: graftResponse.data,
              pathToNode: graftResponse.path,
              joints: graftResponse.joints
            }
          })
        }).toThrow(new Error("Breezy was looking for /foo in your state, but could not find it in your mapping. Did you forget to pass in a valid pageKey to this.props.remote or this.props.visit?"))
      })
    })

    describe('BREEZY_SAVE_RESPONSE', () => {
      it('saves page', () => {
        const prevState = {}
        const nextState = reducer(prevState, {
          type: '@@breezy/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: {},
              csrfToken: 'token',
              assets: ['application-123.js']
            }
          }
        })

        expect(nextState['/foo']).toEqual(jasmine.objectContaining({
          data: {},
          csrfToken: 'token',
          cachedAt: jasmine.any(Number),
          assets: [ 'application-123.js' ],
          pageKey: '/foo',
          joints: {}
        }))
      })
    })

    describe('BREEZY_UPDATE_ALL_JOINTS', () => {
      it('updates all joints using the selected page as reference', () => {
        const prevState = {
          '/foo': {
            data: {
              header: {
                cart: {
                  total: 30
                }
              }
            },
            csrfToken: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['header.cart']
            }
          },
          '/bar': {
            data: {
              profile: {
                header: {
                  cart: {
                    total: 10
                  }
                }
              }
            },
            csrfToken: 'token',
            assets: ['application-123.js'],
            joints: {
              info: ['profile.header.cart']
            }
          }
        }

        const nextState = reducer(prevState, {
          type: '@@breezy/UPDATE_ALL_JOINTS',
          payload: {
            pageKey: '/bar',
          }
        })

        const nextStateCartTotal = nextState['/foo'].data.header.cart.total;
        expect(nextStateCartTotal).toEqual(10)
      })
    })

    describe('MATCH_JOINTS_IN_PAGE', () => {
      it('updates all joints in a page using the selected joint as reference', () => {
        const prevState = {
          '/foo': {
            data: {
              header: {
                cart: {
                  status: 'new'
                }
              },
              body : {
                menu: {
                  sideCart: {
                    status: 'old'
                  }
                },
                miniMenu: {
                  sideCart: {
                    status: 'old'
                  }
                }
              } 
            },
            csrfToken: 'token',
            assets: ['application-123.js'],
            joints: {
              info: [
                'header.cart',
                'body.menu.sideCart',
                'body.miniMenu.sideCart'
              ]
            }
          }
        }

        const nextState = reducer(prevState, {
          type: '@@breezy/MATCH_JOINTS_IN_PAGE',
          payload: {
            pageKey: '/foo',
            lastJointName: 'info',
            lastJointPath: 'header.cart'
          }
        })

        const page = nextState['/foo'].data
        expect(page.header.cart.status).toEqual('new')
        expect(page.body.menu.sideCart.status).toEqual('new')
        expect(page.body.miniMenu.sideCart.status).toEqual('new')

        expect(page.body.menu.sideCart).not.toBe(page.body.miniMenu.sideCart.status)
      })
    })
  })
})
