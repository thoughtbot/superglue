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
    // Simple, focused test state
    const state = {
      superglue: {
        currentPageKey: '/page',
      },
      pages: {
        '/page': {
          data: {
            title: 'Page Title',
            count: 42,
            user: { __id: 'user_123' },
            posts: [
              { __id: 'post_1' },
              { __id: 'post_2' },
              { title: 'Non-fragment post' }
            ],
            meta: {
              theme: 'light',
              author: { __id: 'user_123' }
            }
          }
        }
      },
      fragments: {
        user_123: {
          name: 'John',
          role: 'admin'
        },
        post_1: {
          title: 'Hello World',
          views: 100
        },
        post_2: {
          title: 'Another Post',
          views: 50
        }
      }
    }

    const wrapper = ({ children }) => {
      const store = configureStore({
        preloadedState: state,
        reducer: (state) => state,
      })
      return <Provider store={store}>{children}</Provider>
    }

    describe('basic behavior', () => {
      it('returns whole page without selector', () => {
        const { result } = renderHook(() => useContentV2(), { wrapper })
        expect(result.current).toBe(state.pages['/page'].data)
      })

      it('returns primitives unchanged', () => {
        const { result } = renderHook(() => useContentV2(page => page.title), { wrapper })
        expect(result.current).toBe('Page Title')
        
        const { result: count } = renderHook(() => useContentV2(page => page.count), { wrapper })
        expect(count.current).toBe(42)
      })
    })

    describe('fragment references', () => {
      it('returns stable fragment reference', () => {
        const { result: result1 } = renderHook(() => useContentV2(page => page.user), { wrapper })
        const { result: result2 } = renderHook(() => useContentV2(page => page.user), { wrapper })
        
        // Should return original store object for stable reference equality
        expect(result1.current).toBe(result2.current)
        expect(result1.current).toEqual({ __id: 'user_123' })
      })

      it('handles nested fragment references', () => {
        const { result } = renderHook(() => useContentV2(page => page.meta.author), { wrapper })
        expect(result.current).toEqual({ __id: 'user_123' })
      })

      it('handles array fragment references', () => {
        const { result } = renderHook(() => useContentV2(page => page.posts[0]), { wrapper })
        expect(result.current).toEqual({ __id: 'post_1' })
      })
    })

    describe('fragment resolution', () => {
      it('resolves fragments with ()', () => {
        const { result } = renderHook(() => useContentV2(page => page.user()), { wrapper })
        expect(result.current).toEqual({ name: 'John', role: 'admin' })
      })

      it('resolves array fragments', () => {
        const { result } = renderHook(() => useContentV2(page => page.posts[0]()), { wrapper })
        expect(result.current).toEqual({ title: 'Hello World', views: 100 })
      })

      it('allows chaining after resolution', () => {
        const { result } = renderHook(() => useContentV2(page => page.user().name), { wrapper })
        expect(result.current).toBe('John')
      })
    })

    describe('proxy unwrapping', () => {
      it('unwraps object proxies to stable references', () => {
        const { result: result1 } = renderHook(() => useContentV2(page => page.meta), { wrapper })
        const { result: result2 } = renderHook(() => useContentV2(page => page.meta), { wrapper })
        
        // Should return same reference for performance
        expect(result1.current).toBe(result2.current)
        expect(result1.current).toEqual({
          theme: 'light',
          author: { __id: 'user_123' }
        })
      })

      it('unwraps array proxies to stable references', () => {
        const { result: result1 } = renderHook(() => useContentV2(page => page.posts), { wrapper })
        const { result: result2 } = renderHook(() => useContentV2(page => page.posts), { wrapper })
        
        expect(result1.current).toBe(result2.current)
        expect(result1.current).toEqual([
          { __id: 'post_1' },
          { __id: 'post_2' },
          { title: 'Non-fragment post' }
        ])
      })
    })

    describe('validation', () => {
      it('rejects plain objects', () => {
        expect(() => {
          renderHook(() => useContentV2(page => ({ title: page.title })), { wrapper })
        }).toThrow('useContentV2 selector must return primitives or proxy objects')
      })

      it('rejects plain arrays', () => {
        expect(() => {
          renderHook(() => useContentV2(page => [page.title]), { wrapper })
        }).toThrow('useContentV2 selector must return primitives or proxy objects')
      })

      it('rejects spread syntax', () => {
        expect(() => {
          renderHook(() => useContentV2(page => ({ ...page.user })), { wrapper })
        }).toThrow('useContentV2 selector must return primitives or proxy objects')
      })

      it('rejects map operations', () => {
        expect(() => {
          renderHook(() => useContentV2(page => page.posts.map(p => p.title)), { wrapper })
        }).toThrow('useContentV2 selector must return primitives or proxy objects')
      })
    })

    describe('complex expressions', () => {
      it('handles arithmetic with resolved fragments', () => {
        const { result } = renderHook(() => 
          useContentV2(page => page.posts[0]().views + page.posts[1]().views), 
          { wrapper }
        )
        expect(result.current).toBe(150) // 100 + 50
      })

      it('handles string operations', () => {
        const { result } = renderHook(() => 
          useContentV2(page => `Hello ${page.user().name}`), 
          { wrapper }
        )
        expect(result.current).toBe('Hello John')
      })
    })
  })
})
