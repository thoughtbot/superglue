import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib'
import fetchMock from 'fetch-mock'
import { describe, expect, afterEach, it } from 'vitest'
import {
  saveAndProcessPage,
} from '../../lib/action_creators'

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
