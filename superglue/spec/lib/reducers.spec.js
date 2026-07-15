import { describe, expect, it, vi } from 'vitest'
import { pageReducer, superglueReducer, flashReducer } from '../../lib/reducers'

describe('reducers', () => {
  describe('superglue reducer', () => {
    describe('SUPERGLUE_HISTORY_CHANGE', () => {
      it('sets the currentPageKey', () => {
        const prevState = { foo: 'bar' }
        const action = {
          type: '@@superglue/HISTORY_CHANGE',
          payload: {
            pageKey: '/some_url?foo=123',
          },
        }
        const nextState = superglueReducer(prevState, action)

        expect(nextState).toEqual({
          foo: 'bar',
          search: { foo: '123' },
          currentPageKey: '/some_url?foo=123',
        })
      })
    })

    describe('SUPERGLUE_SAVE_RESPONSE', () => {
      it('saves the response csrfToken', () => {
        const prevState = { foo: 'bar' }
        const action = {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            page: {
              csrfToken: 'some_token',
              assets: ['abc123.js'],
            },
          },
        }
        const nextState = superglueReducer(prevState, action)

        expect(nextState).toEqual({
          foo: 'bar',
          csrfToken: 'some_token',
          assets: ['abc123.js'],
        })
      })
    })

    describe('SUPERGLUE_SET_CSRF_TOKEN', () => {
      it('sets the initial CSRF token', () => {
        const prevState = { foo: 'bar' }
        const action = {
          type: '@@superglue/SET_CSRF_TOKEN',
          payload: {
            csrfToken: 'some_token',
          },
        }
        const nextState = superglueReducer(prevState, action)

        expect(nextState).toEqual({
          foo: 'bar',
          csrfToken: 'some_token',
        })
      })
    })

    describe('SUPERGLUE_BEFORE_VISIT', () => {
      it('sets isVisiting to true', () => {
        const prevState = { isVisiting: false, currentPageKey: '/foo' }
        const action = {
          type: '@@superglue/BEFORE_VISIT',
          payload: {
            currentPageKey: '/foo',
            fetchArgs: [{}, {}],
          },
        }
        const nextState = superglueReducer(prevState, action)

        expect(nextState).toEqual({
          isVisiting: true,
          currentPageKey: '/foo',
        })
      })
    })

    describe('SUPERGLUE_VISIT_END', () => {
      it('sets isVisiting to false', () => {
        const prevState = { isVisiting: true, currentPageKey: '/foo' }
        const action = {
          type: '@@superglue/VISIT_END',
          payload: {
            fetchArgs: [{}, {}],
          },
        }
        const nextState = superglueReducer(prevState, action)

        expect(nextState).toEqual({
          isVisiting: false,
          currentPageKey: '/foo',
        })
      })
    })
  })

  describe('page reducer', () => {
    describe('SUPERGLUE_HANDLE_GRAFT', () => {
      describe('when receiving a page with fragments to append', () => {
        it('pushes new fragments into the current pages empty fragment', () => {
          const prevState = {
            '/foo': {
              data: {
                a: { b: { c: {} } },
              },
              fragments: [],
            },
          }

          const receivedPage = {
            data: {},
            path: 'data.a.b.c',
            fragments: [
              {
                type: 'header',
                partial: 'header',
                path: 'data.a.b.c',
              },
            ],
          }

          const nextState = pageReducer(prevState, {
            type: '@@superglue/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              page: receivedPage,
            },
          })

          expect(nextState).toEqual({
            '/foo': {
              data: {
                a: { b: { c: {} } },
              },
              fragments: [
                {
                  type: 'header',
                  partial: 'header',
                  path: 'data.a.b.c',
                },
              ],
            },
          })
        })

        it('ignore duplicates when pushing a new fragment', () => {
          const prevState = {
            '/foo': {
              data: {
                a: { b: { c: {} } },
              },
              fragments: [
                {
                  type: 'header',
                  partial: 'header',
                  path: 'data.a.b.c',
                },
              ],
            },
          }
          const receivedPage = {
            data: {},
            path: 'data.a.b.c',
            fragments: [
              {
                type: 'header',
                partial: 'header',
                path: 'data.a.b.c',
              },
            ],
          }

          const nextState = pageReducer(prevState, {
            type: '@@superglue/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              page: receivedPage,
            },
          })

          expect(nextState).toEqual({
            '/foo': {
              data: {
                a: { b: { c: {} } },
              },
              fragments: [
                {
                  type: 'header',
                  partial: 'header',
                  path: 'data.a.b.c',
                },
              ],
            },
          })
        })
      })

      describe('Updating fragments on the current page with the same name as the received page', () => {
        it('does no additional update if there is no fragments in the current page', () => {
          const prevState = {
            '/foo': {
              data: {
                a: { b: { c: {} } },
                d: { e: { f: {} } },
              },
              fragments: [],
            },
          }

          const receivedPage = {
            data: {},
            path: 'data.d.e.f',
            fragments: [
              {
                type: 'header',
                partial: 'header',
                path: 'data.d.e.f',
              },
            ],
          }

          const nextState = pageReducer(prevState, {
            type: '@@superglue/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              page: receivedPage,
            },
          })

          expect(nextState).toEqual({
            '/foo': {
              data: {
                a: { b: { c: {} } },
                d: { e: { f: {} } },
              },
              fragments: [
                {
                  type: 'header',
                  partial: 'header',
                  path: 'data.d.e.f',
                },
              ],
            },
          })
        })

        it('updates no fragment when there is no new fragment in the received graft', () => {
          const prevState = {
            '/foo': {
              data: {
                a: { b: { c: {} } },
                d: { e: { f: {} } },
              },
              fragments: [
                {
                  type: 'header',
                  partial: 'header',
                  path: 'data.d.e.f',
                },
              ],
            },
          }

          const receivedPage = {
            data: {},
            path: 'data.a.b.c',
            fragments: [],
          }

          const nextState = pageReducer(prevState, {
            type: '@@superglue/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              page: receivedPage,
            },
          })

          expect(nextState).toEqual(nextState)
        })
      })

      describe('grafting a received node onto the page', () => {
        it('returns the state when pathToNode is empty', () => {
          const prevState = {
            '/foo': {
              data: { a: { b: { c: {} } } },
              fragments: [],
            },
          }
          const receivedPage = {
            data: { foo: 1 },
            fragments: [],
          }
          const pageKey = '/foo'

          const nextState = pageReducer(prevState, {
            type: '@@superglue/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              page: receivedPage,
            },
          })
          expect(nextState).toEqual(prevState)
        })

        it('grafts a received node onto the current page', () => {
          const pageKey = '/foo'
          const prevState = {
            '/foo': {
              data: { a: { b: { c: {} } } },
              fragments: [],
            },
          }

          const receivedPage = {
            data: { foo: 1 },
            path: 'data.a.b.c',
            fragments: [],
          }

          const nextState = pageReducer(prevState, {
            type: '@@superglue/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              page: receivedPage,
            },
          })

          expect(nextState).toEqual({
            '/foo': {
              data: { a: { b: { c: { foo: 1 } } } },
              fragments: [],
            },
          })
        })

        it('throws cant find page if the page does not exist for grafting', () => {
          const prevState = {}

          const receivedPage = {
            data: { foo: 1 },
            path: 'data.a.b.c',
          }

          expect(() => {
            pageReducer(prevState, {
              type: '@@superglue/HANDLE_GRAFT',
              payload: {
                pageKey: '/foo',
                page: receivedPage,
              },
            })
          }).toThrow(
            new Error(
              'Superglue was looking for /foo in your state, but could not find it in your mapping. Did you forget to pass in a valid pageKey to this.props.remote or this.props.visit?'
            )
          )
        })

        it('does not mutate the state when search results are empty', () => {
          vi.spyOn(console, 'warn')

          const prevState = {
            '/foo': {
              data: { a: { b: { c: {} } } },
              fragments: [],
            },
          }

          const receivedPage = {
            path: 'data.a.b.c',
          }

          const nextState = pageReducer(prevState, {
            type: '@@superglue/HANDLE_GRAFT',
            payload: {
              pageKey: '/foo',
              page: receivedPage,
            },
          })

          expect(console.warn).toHaveBeenCalledWith(
            'There was no node returned in the response. Do you have the correct key path in your props_at?'
          )
          expect(nextState).toEqual(prevState)
        })
      })
    })

    describe('SUPERGLUE_SAVE_RESPONSE', () => {
      it('saves page', () => {
        const prevState = {}
        const nextState = pageReducer(prevState, {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: {
              data: {},
              csrfToken: 'token',
              assets: ['application-123.js'],
              fragments: [],
            },
          },
        })

        expect(nextState['/foo']).toEqual(
          expect.objectContaining({
            data: {},
            csrfToken: 'token',
            assets: ['application-123.js'],
            fragments: [],
            savedAt: expect.any(Number),
          })
        )
      })

      it('does nothing when there are no prev fragments to use as placeholder', () => {
        const prevState = {
          '/bar': {
            data: {
              foo: {
                bar: {
                  greetings: 'hello world',
                },
              },
            },
            defers: [
              { url: '/bar?props_at=data.foo.bar', path: 'data.foo.bar' },
            ],
            fragments: [],
          },
        }

        const receivedPage = {
          data: {
            foo: {
              bar: {},
            },
          },
          defers: [{ url: '/foo?props_at=data.foo.bar', path: 'data.foo.bar' }],
          fragments: [{ type: 'info', partial: 'info', path: 'data.foo.bar' }],
        }

        const nextState = pageReducer(prevState, {
          type: '@@superglue/SAVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            page: receivedPage,
          },
        })

        expect(nextState['/foo']).toEqual({
          data: {
            foo: {
              bar: {},
            },
          },
          defers: [{ url: '/foo?props_at=data.foo.bar', path: 'data.foo.bar' }],
          fragments: [{ type: 'info', partial: 'info', path: 'data.foo.bar' }],
          savedAt: expect.any(Number),
        })
      })
    })
  })

  describe('flash reducer', () => {
    describe('RESET', () => {
      it('resets to empty', () => {
        const prevState = { notice: 'hello' }
        const nextState = flashReducer(prevState, {
          type: '@@superglue/RESET',
        })
        expect(nextState).toEqual({})
      })
    })

    describe('BEFORE_VISIT', () => {
      it('clears flash on visit', () => {
        const prevState = { notice: 'hello', alert: 'danger' }
        const nextState = flashReducer(prevState, {
          type: '@@superglue/BEFORE_VISIT',
          payload: {
            currentPageKey: '/foo',
            fetchArgs: ['/foo', {}],
          },
        })
        expect(nextState).toEqual({})
      })
    })

    describe('CLEAR_FLASH', () => {
      it('clears all flash when no key provided', () => {
        const prevState = { notice: 'hello', alert: 'danger' }
        const nextState = flashReducer(prevState, {
          type: '@@superglue/CLEAR_FLASH',
          payload: {},
        })
        expect(nextState).toEqual({})
      })

      it('clears a specific key', () => {
        const prevState = { notice: 'hello', alert: 'danger' }
        const nextState = flashReducer(prevState, {
          type: '@@superglue/CLEAR_FLASH',
          payload: { key: 'notice' },
        })
        expect(nextState).toEqual({ alert: 'danger' })
      })
    })

    describe('FLASH', () => {
      it('merges flash data', () => {
        const prevState = { notice: 'hello' }
        const nextState = flashReducer(prevState, {
          type: '@@superglue/FLASH',
          payload: { flash: { alert: 'danger' } },
        })
        expect(nextState).toEqual({ notice: 'hello', alert: 'danger' })
      })

      it('overwrites existing keys', () => {
        const prevState = { notice: 'hello' }
        const nextState = flashReducer(prevState, {
          type: '@@superglue/FLASH',
          payload: { flash: { notice: 'updated' } },
        })
        expect(nextState).toEqual({ notice: 'updated' })
      })
    })

    describe('RECEIVE_RESPONSE', () => {
      it('merges flash from response', () => {
        const prevState = {}
        const nextState = flashReducer(prevState, {
          type: '@@superglue/RECEIVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            response: {
              flash: { notice: 'Success!' },
            },
          },
        })
        expect(nextState).toEqual({ notice: 'Success!' })
      })

      it('returns state when response has no flash', () => {
        const prevState = { notice: 'existing' }
        const nextState = flashReducer(prevState, {
          type: '@@superglue/RECEIVE_RESPONSE',
          payload: {
            pageKey: '/foo',
            response: {},
          },
        })
        expect(nextState).toEqual({ notice: 'existing' })
      })
    })
  })
})
