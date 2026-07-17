import { describe, expect, it, vi } from 'vitest'
import { pageReducer } from '../../lib/reducers'

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
          defers: [{ url: '/bar?props_at=data.foo.bar', path: 'data.foo.bar' }],
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
