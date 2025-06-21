import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { useUpdateFragment, createFragment } from '../../lib/hooks/useUpdateFragment'

// Comprehensive reducer for testing
const testReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return action.state
    case 'superglue/saveFragment':
      return {
        ...state,
        fragments: {
          ...state.fragments,
          [action.payload.fragmentKey]: action.payload.fragment
        }
      }
    default:
      return state
  }
}

describe('useUpdateFragment', () => {
  let store

  const createInitialState = () => ({
    fragments: {
      user_123: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        profile: { __id: 'profile_456' },
        posts: [
          { __id: 'post_789' },
          { title: 'Regular Post', views: 100 }
        ]
      },
      profile_456: {
        avatar: 'avatar.jpg',
        bio: 'Software engineer',
        preferences: { __id: 'preferences_999' }
      },
      preferences_999: {
        theme: 'dark',
        notifications: true
      },
      post_789: {
        id: 789,
        title: 'Hello World',
        content: 'This is my first post',
        author: { __id: 'user_123' }
      }
    }
  })

  beforeEach(() => {
    store = createStore(testReducer)
    store.dispatch({
      type: 'SET_INITIAL_STATE',
      state: createInitialState()
    })
  })

  const renderWithProvider = (component) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    )
  }

  describe('basic fragment updates', () => {
    it('updates simple fragment properties', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragment } = useUpdateFragment()
        capturedUpdate = updateFragment
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', draft => {
          draft.name = 'Jane Smith'
          draft.email = 'jane@example.com'
        })
      })

      const updatedUser = store.getState().fragments.user_123
      expect(updatedUser.name).toBe('Jane Smith')
      expect(updatedUser.email).toBe('jane@example.com')
      expect(updatedUser.id).toBe(123) // Other properties preserved
    })

    it('throws error for non-existent fragment', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragment } = useUpdateFragment()
        capturedUpdate = updateFragment
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      expect(() => {
        capturedUpdate('non_existent', draft => {
          draft.name = 'Test'
        })
      }).toThrow('Fragment with id "non_existent" not found')
    })
  })

  describe('updateFragmentWithProxy - entering fragments', () => {
    it('allows "entering" fragment references through callable API', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          // Direct property updates
          proxiedDraft.name = 'Updated Name'
          
          // "Enter" fragment reference
          proxiedDraft.profile(profileDraft => {
            profileDraft.avatar = 'new-avatar.jpg'
            profileDraft.bio = 'Updated bio'
          })
        })
      })

      // Check main fragment was updated
      const updatedUser = store.getState().fragments.user_123
      expect(updatedUser.name).toBe('Updated Name')

      // Check referenced fragment was updated
      const updatedProfile = store.getState().fragments.profile_456
      expect(updatedProfile.avatar).toBe('new-avatar.jpg')
      expect(updatedProfile.bio).toBe('Updated bio')
    })

    it('handles nested fragment references', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          // Navigate through nested fragments
          proxiedDraft.profile(profileDraft => {
            profileDraft.preferences(preferencesDraft => {
              preferencesDraft.theme = 'light'
              preferencesDraft.notifications = false
            })
          })
        })
      })

      // Check deeply nested fragment was updated
      const updatedPreferences = store.getState().fragments.preferences_999
      expect(updatedPreferences.theme).toBe('light')
      expect(updatedPreferences.notifications).toBe(false)
    })

    it('handles fragment references in array indices', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          // "Enter" first post fragment through array index
          proxiedDraft.posts[0](postDraft => {
            postDraft.title = 'Updated Post Title'
            postDraft.content = 'Updated content'
          })
        })
      })

      // Check array fragment was updated
      const updatedPost = store.getState().fragments.post_789
      expect(updatedPost.title).toBe('Updated Post Title')
      expect(updatedPost.content).toBe('Updated content')
    })

    it('handles mixed arrays with fragment refs and regular objects', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          // Update fragment reference in array
          proxiedDraft.posts[0](postDraft => {
            postDraft.title = 'Fragment Post Updated'
          })
          
          // Update regular object in array
          proxiedDraft.posts[1].views = 200
        })
      })

      // Check fragment was updated in separate store location
      const updatedPost = store.getState().fragments.post_789
      expect(updatedPost.title).toBe('Fragment Post Updated')

      // Check regular object was updated in parent fragment
      const updatedUser = store.getState().fragments.user_123
      expect(updatedUser.posts[1].views).toBe(200)
    })

    it('allows chaining through multiple fragment references', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('post_789', proxiedDraft => {
          // Navigate: post -> author (fragment chain)
          proxiedDraft.author(authorDraft => {
            authorDraft.name = 'Updated Author Name'
          })
        })
      })

      // Check that the final target fragment was updated
      const updatedUser = store.getState().fragments.user_123
      expect(updatedUser.name).toBe('Updated Author Name')
    })
  })

  describe('createFragment functionality', () => {
    it('creates new fragments and adds references to arrays', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          proxiedDraft.posts.push(createFragment('post_999', {
            title: 'New Post',
            content: 'Brand new content',
            author: { __id: 'user_123' }
          }))
        })
      })

      // Check new fragment was created
      const newPost = store.getState().fragments.post_999
      expect(newPost.title).toBe('New Post')
      expect(newPost.content).toBe('Brand new content')

      // Check reference was added to array
      const updatedUser = store.getState().fragments.user_123
      expect(updatedUser.posts).toHaveLength(3)
      expect(updatedUser.posts[2]).toEqual({ __id: 'post_999' })
    })

    it('handles multiple createFragment calls in single push', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          proxiedDraft.posts.push(
            createFragment('post_111', { title: 'Post 1' }),
            createFragment('post_222', { title: 'Post 2' }),
            { title: 'Regular object' }
          )
        })
      })

      // Check new fragments were created
      expect(store.getState().fragments.post_111.title).toBe('Post 1')
      expect(store.getState().fragments.post_222.title).toBe('Post 2')

      // Check all items were added to array
      const updatedUser = store.getState().fragments.user_123
      expect(updatedUser.posts).toHaveLength(5)
      expect(updatedUser.posts[2]).toEqual({ __id: 'post_111' })
      expect(updatedUser.posts[3]).toEqual({ __id: 'post_222' })
      expect(updatedUser.posts[4]).toEqual({ title: 'Regular object' })
    })

    it('throws error when trying to enter non-existent fragment', () => {
      let capturedUpdate

      // Create state with broken fragment reference
      store.dispatch({
        type: 'SET_INITIAL_STATE',
        state: {
          fragments: {
            user_123: {
              profile: { __id: 'missing_profile' }
            }
          }
        }
      })

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      expect(() => {
        act(() => {
          capturedUpdate('user_123', proxiedDraft => {
            proxiedDraft.profile(profileDraft => {
              profileDraft.avatar = 'this should fail'
            })
          })
        })
      }).toThrow('Fragment with id "missing_profile" not found')
    })
  })

  describe('integration and edge cases', () => {
    it('preserves fragment immutability', () => {
      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      const originalUser = store.getState().fragments.user_123
      const originalProfile = store.getState().fragments.profile_456

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          proxiedDraft.name = 'New Name'
          proxiedDraft.profile(profileDraft => {
            profileDraft.avatar = 'new-avatar.jpg'
          })
        })
      })

      const updatedUser = store.getState().fragments.user_123
      const updatedProfile = store.getState().fragments.profile_456

      // Should be different objects (immutability)
      expect(updatedUser).not.toBe(originalUser)
      expect(updatedProfile).not.toBe(originalProfile)
      
      // Check values updated correctly
      expect(updatedUser.name).toBe('New Name')
      expect(updatedProfile.avatar).toBe('new-avatar.jpg')
      
      // Original objects unchanged
      expect(originalUser.name).toBe('John Doe')
      expect(originalProfile.avatar).toBe('avatar.jpg')
    })

    it('dispatches correct Redux actions', () => {
      const mockDispatch = vi.fn()
      store.dispatch = mockDispatch

      let capturedUpdate

      const TestComponent = () => {
        const { updateFragmentWithProxy } = useUpdateFragment()
        capturedUpdate = updateFragmentWithProxy
        return <div>Test</div>
      }

      renderWithProvider(<TestComponent />)

      act(() => {
        capturedUpdate('user_123', proxiedDraft => {
          proxiedDraft.name = 'Action Test'
          proxiedDraft.profile(profileDraft => {
            profileDraft.avatar = 'action-avatar.jpg'
          })
        })
      })

      // Should dispatch actions for both fragments
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'superglue/saveFragment',
        payload: {
          fragmentKey: 'profile_456',
          fragment: expect.objectContaining({
            avatar: 'action-avatar.jpg'
          })
        }
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'superglue/saveFragment',
        payload: {
          fragmentKey: 'user_123',
          fragment: expect.objectContaining({
            name: 'Action Test'
          })
        }
      })
    })
  })
})