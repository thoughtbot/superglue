import { renderHook, act } from '@testing-library/react'
import { useSetFragment } from '../../lib/hooks/useSetFragment'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib'

// Helper to build store with actual reducer
const buildStore = (preloadedState) => {
  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
    },
  })
}

describe('useSetFragment', () => {
  describe('basic functionality', () => {
    it('should update existing fragment with object reference', () => {
      const initialState = {
        superglue: {
          currentPageKey: '/page',
        },
        pages: {
          '/page': {
            data: {
              title: 'Page Title',
            },
          },
        },
        fragments: {
          user_123: {
            id: 123,
            name: 'John',
            email: 'john@example.com',
          },
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'user_123' }, (draft) => {
          draft.name = 'Jane'
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['user_123']).toEqual({
        id: 123,
        name: 'Jane',
        email: 'john@example.com',
      })

      expect(Object.isFrozen(updatedState.fragments['user_123'])).toBe(false)
    })

    it('should update existing fragment with string reference', () => {
      const initialState = {
        superglue: {
          currentPageKey: '/page',
        },
        pages: {},
        fragments: {
          user_123: {
            id: 123,
            name: 'John',
            email: 'john@example.com',
          },
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set('user_123', (draft) => {
          draft.name = 'Jane'
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['user_123']).toEqual({
        id: 123,
        name: 'Jane',
        email: 'john@example.com',
      })

      expect(Object.isFrozen(updatedState.fragments['user_123'])).toBe(false)
    })

    it('should handle nested object updates', () => {
      const initialState = {
        superglue: {
          currentPageKey: '/page',
        },
        pages: {},
        fragments: {
          user_123: {
            id: 123,
            name: 'John',
            profile: {
              avatar: '/old.jpg',
              bio: 'Old bio',
            },
          },
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'user_123' }, (draft) => {
          draft.profile.avatar = '/new.jpg'
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['user_123'].profile.avatar).toBe('/new.jpg')
      expect(updatedState.fragments['user_123'].profile.bio).toBe('Old bio')
    })

    it('should handle array updates with object reference', () => {
      const initialState = {
        superglue: {
          currentPageKey: '/page',
        },
        pages: {},
        fragments: {
          posts_collection: [{ title: 'Post 1' }, { title: 'Post 2' }],
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'posts_collection' }, (draft) => {
          draft.push({ title: 'Post 3' })
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['posts_collection']).toHaveLength(3)
      expect(updatedState.fragments['posts_collection'][2]).toEqual({
        title: 'Post 3',
      })
    })

    it('should handle array updates with string reference', () => {
      const initialState = {
        superglue: {
          currentPageKey: '/page',
        },
        pages: {},
        fragments: {
          posts_collection: [{ title: 'Post 1' }, { title: 'Post 2' }],
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set('posts_collection', (draft) => {
          draft.push({ title: 'Post 3' })
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['posts_collection']).toHaveLength(3)
      expect(updatedState.fragments['posts_collection'][2]).toEqual({
        title: 'Post 3',
      })
    })
  })

  describe('nested fragment mutations', () => {
    it('should handle nested set calls with fragment references', () => {
      const initialState = {
        superglue: {
          currentPageKey: '/page',
        },
        pages: {},
        fragments: {
          user_123: {
            id: 123,
            name: 'John',
            profile: { __id: 'profile_456' },
          },
          profile_456: {
            avatar: '/old.jpg',
            bio: 'Old bio',
          },
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'user_123' }, (userDraft) => {
          userDraft.name = 'Jane'

          set(userDraft.profile, (profileDraft) => {
            profileDraft.avatar = '/new.jpg'
          })
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['user_123'].name).toBe('Jane')
      expect(updatedState.fragments['profile_456'].avatar).toBe('/new.jpg')
    })

    it('should handle array of fragment references', () => {
      const initialState = {
        superglue: {
          currentPageKey: '/page',
        },
        pages: {},
        fragments: {
          posts_collection: [{ __id: 'post_1' }, { __id: 'post_2' }],
          post_1: { title: 'First Post', views: 100 },
          post_2: { title: 'Second Post', views: 200 },
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'posts_collection' }, (postsDraft) => {
          postsDraft.forEach((postRef) => {
            set(postRef, (postDraft) => {
              postDraft.views = postDraft.views + 10
            })
          })
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['post_1'].views).toBe(110)
      expect(updatedState.fragments['post_2'].views).toBe(210)
    })
  })

  describe('error handling', () => {
    it('should throw error for non-existent fragment with object reference', () => {
      const store = buildStore({
        superglue: { currentPageKey: '/page' },
        pages: {},
        fragments: {},
      })
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      expect(() => {
        act(() => {
          set({ __id: 'non_existent' }, (draft) => {})
        })
      }).toThrow('Fragment with id "non_existent" not found')
    })

    it('should throw error for non-existent fragment with string reference', () => {
      const store = buildStore({
        superglue: { currentPageKey: '/page' },
        pages: {},
        fragments: {},
      })
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      expect(() => {
        act(() => {
          set('non_existent', (draft) => {})
        })
      }).toThrow('Fragment with id "non_existent" not found')
    })
  })

  describe('immer draft behavior', () => {
    it('should allow direct mutation of draft properties', () => {
      const initialState = {
        superglue: { currentPageKey: '/page' },
        pages: {},
        fragments: {
          user_123: {
            name: 'John',
            age: 30,
            tags: ['admin', 'user'],
          },
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'user_123' }, (draft) => {
          draft.name = 'Jane'
          draft.age = 31
          draft.tags.push('moderator')
        })
      })

      const updatedState = store.getState()
      expect(updatedState.fragments['user_123']).toEqual({
        name: 'Jane',
        age: 31,
        tags: ['admin', 'user', 'moderator'],
      })
    })

    it('should handle complex nested mutations', () => {
      const initialState = {
        superglue: { currentPageKey: '/page' },
        pages: {},
        fragments: {
          complex_data: {
            user: {
              profile: {
                settings: {
                  theme: 'light',
                  notifications: true,
                },
              },
            },
            posts: [{ title: 'Post 1', metadata: { likes: 5 } }],
          },
        },
      }

      const store = buildStore(initialState)
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'complex_data' }, (draft) => {
          draft.user.profile.settings.theme = 'dark'
          draft.posts[0].metadata.likes = 10
          draft.posts.push({ title: 'Post 2', metadata: { likes: 0 } })
        })
      })

      const updatedState = store.getState()
      const fragment = updatedState.fragments['complex_data']
      expect(fragment.user.profile.settings.theme).toBe('dark')
      expect(fragment.posts[0].metadata.likes).toBe(10)
      expect(fragment.posts).toHaveLength(2)
      expect(fragment.posts[1].title).toBe('Post 2')
    })
  })

  describe('redux action dispatch', () => {
    it('should dispatch saveFragment action with correct payload', () => {
      const initialState = {
        superglue: { currentPageKey: '/page' },
        pages: {},
        fragments: {
          user_123: {
            name: 'John',
            role: 'admin',
          },
        },
      }

      const store = buildStore(initialState)
      const dispatchSpy = vi.spyOn(store, 'dispatch')

      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSetFragment(), { wrapper })
      const set = result.current

      act(() => {
        set({ __id: 'user_123' }, (draft) => {
          draft.name = 'Jane'
        })
      })

      expect(dispatchSpy).toHaveBeenCalledWith({
        type: '@@superglue/SAVE_FRAGMENT',
        payload: {
          fragmentId: 'user_123',
          data: {
            name: 'Jane',
            role: 'admin',
          },
        },
      })
    })
  })
})
