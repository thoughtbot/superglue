import { fragmentReducer } from '../../lib/reducers'
import {
  saveFragment,
  appendToFragment,
  prependToFragment,
  handleFragmentGraft,
} from '../../lib/actions'

describe('reducers', () => {
  describe('fragments reducer', () => {
    describe('SAVE_FRAGMENT', () => {
      it('saves a fragment with the given key', () => {
        const prevState = {}
        const action = saveFragment({
          data: { title: 'Welcome Message' },
          fragmentId: 'greeting',
        })
        
        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          greeting: { title: 'Welcome Message' },
        })
      })

      it('preserves existing fragments when saving a new one', () => {
        const prevState = {
          posts: [{ content: "Hello" }],
        }
        const action = saveFragment({
          data: { title: 'Getting Started' },
          fragmentId: 'tutorial',
        })
        
        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ content: "Hello" }],
          tutorial: { title: 'Getting Started' },
        })
      })
    })

    describe('SAVE_FRAGMENT replaces existing fragments', () => {
      it('replaces a fragment with new data', () => {
        const prevState = {
          posts: [{ title: 'First Post' }],
          greeting: { title: 'Welcome' },
        }
        const action = saveFragment({
          fragmentId: 'posts',
          data: [{ title: 'Updated Post' }],
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ title: 'Updated Post' }],
          greeting: { title: 'Welcome' },
        })
      })

      it('creates a new fragment if target does not exist', () => {
        const prevState = {}
        const action = saveFragment({
          fragmentId: 'footer',
          data: { title: 'Brand New Content' },
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          footer: { title: 'Brand New Content' },
        })
      })
    })

    describe('APPEND_TO_FRAGMENT', () => {
      it('appends data to an array fragment', () => {
        const prevState = {
          posts: [{ title: 'First Post' }],
        }

        const action = appendToFragment({
          data: { title: 'Second Post' },
          fragmentId: 'posts',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ title: 'First Post' }, { title: 'Second Post' }],
        })
      })

      it('does not modify non-array fragments', () => {
        const prevState = {
          greeting: { title: 'Welcome Message' },
        }

        const action = appendToFragment({
          data: { title: 'Another Message' },
          fragmentId: 'greeting',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          greeting: { title: 'Welcome Message' },
        })
      })

      it('returns original state if target fragment does not exist', () => {
        const prevState = {
          posts: [{ title: 'Existing Post' }],
        }

        const action = appendToFragment({
          data: { title: 'New Post' },
          fragmentId: 'nonexistent',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toBe(prevState)
      })
    })

    describe('PREPEND_TO_FRAGMENT', () => {
      it('prepends data to an array fragment', () => {
        const prevState = {
          posts: [{ title: 'Existing Post' }],
        }

        const action = prependToFragment({
          data: { title: 'New First Post' },
          fragmentId: 'posts',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          posts: [{ title: 'New First Post' }, { title: 'Existing Post' }],
        })
      })


      it('does not modify non-array fragments', () => {
        const prevState = {
          greeting: { title: 'Welcome Message' },
        }

        const action = prependToFragment({
          data: { title: 'Another Message' },
          fragmentId: 'greeting',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          greeting: { title: 'Welcome Message' },
        })
      })

      it('returns original state if target fragment does not exist', () => {
        const prevState = {
          posts: [{ title: 'Existing Post' }],
        }

        const action = prependToFragment({
          data: { title: 'New Post' },
          fragmentId: 'nonexistent',
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toBe(prevState)
      })
    })

    describe('HANDLE_FRAGMENT_GRAFT', () => {
      it('grafts data onto a fragment at the specified path', () => {
        const prevState = {
          userProfile: {
            name: 'John',
            settings: {
              title: 'Dark Theme Preferences',
            },
          },
        }

        const action = handleFragmentGraft({
          fragmentId: 'userProfile',
          response: {
            data: 'Light Theme Preferences',
            path: 'settings.title',
          },
        })

        const nextState = fragmentReducer(prevState, action)

        expect(nextState).toEqual({
          userProfile: {
            name: 'John',
            settings: {
              title: 'Light Theme Preferences',
            },
          },
        })
      })

      it('throws an error if fragment key does not exist', () => {
        const prevState = {
          posts: [{ id: 1 }],
        }

        const action = handleFragmentGraft({
          fragmentId: 'nonexistent',
          response: {
            data: 'Updated Title',
            path: 'title',
          },
        })

        expect(() => fragmentReducer(prevState, action)).toThrow(
          'Superglue was looking for nonexistent in your fragments, but could not find it.'
        )
      })
    })

    describe('default case', () => {
      it('returns the current state for unknown actions', () => {
        const prevState = {
          posts: [{ title: 'My First Post' }],
        }

        const unknownAction = { type: 'UNKNOWN_ACTION' }

        const nextState = fragmentReducer(prevState, unknownAction)

        expect(nextState).toBe(prevState)
      })

      it('returns empty object for undefined state with unknown action', () => {
        const unknownAction = { type: 'UNKNOWN_ACTION' }

        const nextState = fragmentReducer(undefined, unknownAction)

        expect(nextState).toEqual({})
      })
    })
  })
})