import { renderHook } from '@testing-library/react'
import { useContent, useSuperglue, useContentV2 } from '../../lib'
import { describe, it } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

describe('hooks', () => {
  describe('useSuperglue', () => {
    it('returns the superglue state', () => {
      const preloadedState = {
        superglue: {
          currentPageKey: '/current?abc=123',
          pathname: '/current',
          search: '?abc=123',
          csrfToken: 'csrf123',
          assets: ['js-asset-123'],
        },
      }

      let store = configureStore({
        preloadedState,
        reducer: (state) => state,
      })
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useSuperglue(), { wrapper })

      expect(result.current).toEqual(preloadedState.superglue)
    })
  })

  describe('useContent', () => {
    it('returns the page content', () => {
      const preloadedState = {
        superglue: {
          currentPageKey: '/current?abc=123',
          pathname: '/current',
          search: '?abc=123',
          csrfToken: 'csrf123',
          assets: ['js-asset-123'],
        },
        pages: {
          '/current?abc=123': {
            data: {
              heading: 'selected',
            },
          },
          '/other': {
            data: {
              heading: 'not selected',
            },
          },
        },
      }

      let store = configureStore({
        preloadedState,
        reducer: (state) => state,
      })
      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
      const { result } = renderHook(() => useContent(), { wrapper })

      expect(result.current).toEqual({
        heading: 'selected',
      })
    })
  })

  describe('useContentV2', () => {
    const testState = {
      superglue: {
        currentPageKey: '/dashboard',
        pathname: '/dashboard',
        search: '',
        csrfToken: 'token123',
        assets: ['app.js'],
      },
      pages: {
        '/dashboard': {
          data: {
            title: 'Dashboard',
            user: { __id: 'user_1' },
            post: { __id: 'post_1' },
            posts: [
              { __id: 'post_1' },
              { __id: 'post_2' },
              { title: 'Plain post' }
            ],
            settings: {
              theme: 'dark',
              profile: { __id: 'user_1' }
            }
          }
        }
      },
      fragments: {
        user_1: {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com'
        },
        post_1: {
          id: 101,
          title: 'First Post',
          likes: 50
        },
        post_2: {
          id: 102,
          title: 'Second Post',
          likes: 25
        }
      }
    }

    const createWrapper = (state = testState) => {
      const store = configureStore({
        preloadedState: state,
        reducer: (state) => state,
      })
      return ({ children }) => <Provider store={store}>{children}</Provider>
    }

    describe('without selector', () => {
      it('returns whole page data', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => useContentV2(), { wrapper })
        
        expect(result.current).toEqual(testState.pages['/dashboard'].data)
      })
    })

    describe('primitives pass through', () => {
      it('returns strings unchanged', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.title), 
          { wrapper }
        )
        
        expect(result.current).toBe('Dashboard')
      })

      it('returns numbers unchanged', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.posts.length), 
          { wrapper }
        )
        
        expect(result.current).toBe(3)
      })
    })

    describe('fragment resolution', () => {
      it('resolves fragment with () call', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.user()), 
          { wrapper }
        )
        
        expect(result.current).toEqual({
          id: 1,
          name: 'Alice',
          email: 'alice@example.com'
        })
      })

      it('resolves nested fragment data', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.user().name), 
          { wrapper }
        )
        
        expect(result.current).toBe('Alice')
      })
    })

    describe('fragment references', () => {
      it('returns unwrapped fragment reference without ()', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.user), 
          { wrapper }
        )
        
        expect(result.current).toEqual({ __id: 'user_1' })
      })
    })

    describe('proxy unwrapping', () => {
      it('unwraps object proxy to store data', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.settings), 
          { wrapper }
        )
        
        expect(result.current).toEqual({
          theme: 'dark',
          profile: { __id: 'user_1' }
        })
      })

      it('unwraps array proxy to store data', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.posts), 
          { wrapper }
        )
        
        expect(result.current).toEqual([
          { __id: 'post_1' },
          { __id: 'post_2' },
          { title: 'Plain post' }
        ])
      })
    })

    describe('array access', () => {
      it('resolves array element fragment', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.posts[0]()), 
          { wrapper }
        )
        
        expect(result.current).toEqual({
          id: 101,
          title: 'First Post',
          likes: 50
        })
      })

      it('returns array element reference', () => {
        const wrapper = createWrapper()
        const { result } = renderHook(() => 
          useContentV2(page => page.posts[0]), 
          { wrapper }
        )
        
        expect(result.current).toEqual({ __id: 'post_1' })
      })
    })

    describe('validation errors', () => {
      it('rejects user-created objects', () => {
        const wrapper = createWrapper()
        
        expect(() => {
          renderHook(() => 
            useContentV2(page => ({ custom: page.title })), 
            { wrapper }
          )
        }).toThrow('useContentV2 selector must return primitives or proxy objects')
      })

      it('rejects user-created arrays', () => {
        const wrapper = createWrapper()
        
        expect(() => {
          renderHook(() => 
            useContentV2(page => [page.title]), 
            { wrapper }
          )
        }).toThrow('useContentV2 selector must return primitives or proxy objects')
      })

      it('rejects spread operations', () => {
        const wrapper = createWrapper()
        
        expect(() => {
          renderHook(() => 
            useContentV2(page => ({ ...page.user })), 
            { wrapper }
          )
        }).toThrow('useContentV2 selector must return primitives or proxy objects')
      })
    })
  })
})
