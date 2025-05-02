import { fragmentReducer } from '../../lib/reducers'
import {
  saveFragment,
  appendToFragment,
  prependToFragment,
} from '../../lib/actions'

describe('reducers', () => {
  describe('fragments reducer', () => {
    describe('SAVE_FRAGMENT', () => {
      it('sets the currentPageKey', () => {
        const prevState = {}
        const action = saveFragment({
          fragment: { hello: 'world' },
          fragmentKey: 'greeting',
        })
        console.log(action)
        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          greeting: { hello: 'world' },
        })
      })
    })

    describe('APPEND_FRAGMENT', () => {
      it.only('prepends data into a collection', () => {
        const prevState = {
          posts: [{ hello: 'John' }],
        }

        const action = appendToFragment({
          data: { hello: 'World' },
          target: 'posts',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ hello: 'World' }, { hello: 'John' }],
        })
      })

      it('appends the fragment into a collection', () => {
        const prevState = {
          posts: [{ __id: 'post-0' }],
        }
        const action = appendToFragment({
          data: { hello: 'world' },
          options: {
            fragment: 'post-1',
          },
          target: 'posts',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ __id: 'post-0' }, { __id: 'post-1' }],
          'post-1': { hello: 'world' },
        })
      })
    })

    describe('PREPEND_TO_FRAGMENT', () => {
      it('prepends data into a collection', () => {
        const prevState = {
          posts: [{ hello: 'John' }],
        }

        const action = prependToFragment({
          data: { hello: 'World' },
          target: 'posts',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ hello: 'John' }, { hello: 'World' }],
        })
      })

      it('prepends a fragment into a collection', () => {
        const prevState = {
          posts: [{ __id: 'post-0' }],
        }
        const action = prependToFragment({
          data: { hello: 'world' },
          options: {
            fragment: 'post-1',
          },
          target: 'posts',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ __id: 'post-1' }, { __id: 'post-0' }],
          'post-1': { hello: 'world' },
        })
      })
    })
  })
})
