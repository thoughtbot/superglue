import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import fetchMock from 'fetch-mock'
import { describe, expect, afterEach, it } from 'vitest'
import { saveAndProcessPage } from '../../lib/action_creators'

const buildStore = (preloadedState) => {
  let resultsReducer = (state = [], action) => {
    return state.concat([action])
  }

  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
      results: resultsReducer,
    },
  })
}

const initialState = () => {
  return {
    superglue: {
      currentPageKey: '/bar',
      csrfToken: 'token',
    },
    fragments: {},
  }
}

fetchMock.mock()

const buildPage = (attrs) => {
  const body = {
    data: {
      foo: 'barb',
    },
    csrfToken: 'token',
    assets: [],
    fragments: [],
    ...attrs,
  }
  return body
}

describe('fragments', () => {
  describe('saveResponse', () => {
    afterEach(() => {
      fetchMock.reset()
      fetchMock.restore()
    })

    it('denormalizes fragments on a page and stores them under the fragments slice', async () => {
      const page = buildPage({
        data: {
          header: {
            avatar: {
              name: 'John Smith',
            },
          },
        },
        fragments: [
          { id: 'header', path: 'data.header' },
          { id: 'user', path: 'data.header.avatar' },
        ],
      })
      const store = buildStore(initialState())

      await store.dispatch(saveAndProcessPage('/foo', page))
      const state = store.getState()

      expect(state.pages['/foo']).toEqual(
        expect.objectContaining({
          data: {
            header: {
              __id: 'header',
            },
          },
        })
      )

      expect(state.fragments).toEqual({
        user: {
          name: 'John Smith',
        },
        header: {
          avatar: { __id: 'user' },
        },
      })
    })

    it('replaces all sibling fragments with __id stubs', async () => {
      const page = buildPage({
        data: {
          header: {
            title: 'Welcome',
          },
          sidebar: {
            links: ['home', 'about'],
          },
        },
        fragments: [
          { id: 'header_fragment', path: 'data.header' },
          { id: 'sidebar_fragment', path: 'data.sidebar' },
        ],
      })

      const store = buildStore(initialState())
      await store.dispatch(saveAndProcessPage('/foo', page))
      const state = store.getState()

      expect(state.pages['/foo'].data.header).toEqual({
        __id: 'header_fragment',
      })
      expect(state.pages['/foo'].data.sidebar).toEqual({
        __id: 'sidebar_fragment',
      })

      expect(state.fragments.header_fragment).toEqual({ title: 'Welcome' })
      expect(state.fragments.sidebar_fragment).toEqual({
        links: ['home', 'about'],
      })
    })

    it('preserves earlier fragment replacements when processing multiple fragments', async () => {
      const page = buildPage({
        data: {
          a: { value: 1 },
          b: { value: 2 },
          c: { value: 3 },
        },
        fragments: [
          { id: 'frag_a', path: 'data.a' },
          { id: 'frag_b', path: 'data.b' },
          { id: 'frag_c', path: 'data.c' },
        ],
      })

      const store = buildStore(initialState())
      await store.dispatch(saveAndProcessPage('/foo', page))
      const state = store.getState()

      expect(state.pages['/foo'].data.a).toEqual({ __id: 'frag_a' })
      expect(state.pages['/foo'].data.b).toEqual({ __id: 'frag_b' })
      expect(state.pages['/foo'].data.c).toEqual({ __id: 'frag_c' })
    })

    describe('grafting', () => {
      it('grafts based on the fragment context the data is in.', async () => {
        const page = buildPage({
          action: 'graft',
          fragments: [],
          data: {
            name: 'John Smith',
          },
          fragmentContext: 'header',
          path: 'avatar',
        })

        const store = buildStore({
          ...initialState(),
          pages: {
            '/foo': buildPage({
              data: {
                header: {
                  __id: 'header',
                },
              },
              fragments: [{ id: 'header', path: 'data.header' }],
            }),
          },
          fragments: {
            header: {
              avatar: { name: 'loading....' },
            },
          },
        })

        await store.dispatch(saveAndProcessPage('/foo', page))
        const state = store.getState()

        expect(state.pages['/foo']).toEqual(
          expect.objectContaining({
            data: {
              header: {
                __id: 'header',
              },
            },
          })
        )

        expect(state.fragments).toEqual({
          header: {
            avatar: { name: 'John Smith' },
          },
        })
      })

      it('denormalizes new fragments found in the received graft response', async () => {
        const page = buildPage({
          action: 'graft',
          fragments: [{ id: 'personDetails', path: 'data.contactDetails' }],
          data: {
            name: 'John Smith',
            contactDetails: {
              address: {
                zip: 10001,
              },
            },
          },
          fragmentContext: 'header',
          path: 'avatar',
        })

        const store = buildStore({
          ...initialState(),
          pages: {
            '/foo': buildPage({
              data: {
                header: {
                  __id: 'header',
                },
              },
              fragments: [{ id: 'header', path: 'data.header' }],
            }),
          },
          fragments: {
            header: {
              avatar: { name: 'loading....' },
            },
          },
        })

        await store.dispatch(saveAndProcessPage('/foo', page))
        const state = store.getState()

        expect(state.pages['/foo']).toEqual(
          expect.objectContaining({
            data: {
              header: {
                __id: 'header',
              },
            },
          })
        )

        expect(state.fragments).toEqual({
          header: {
            avatar: {
              name: 'John Smith',
              contactDetails: { __id: 'personDetails' },
            },
          },
          personDetails: {
            address: {
              zip: 10001,
            },
          },
        })
      })
    })
  })
})
