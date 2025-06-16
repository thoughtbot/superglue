import { renderHook } from '@testing-library/react'
import { useContent, useSuperglue, useContentV2, useContentV3 } from '../../lib'
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

  describe('useContentV3', () => {
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
      it('returns page data as proxy', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(result.current.__isContentProxy).toBe(true)
        expect(result.current.title).toBe('Page Title')
        expect(result.current.count).toBe(42)
      })

      it('returns callable fragment references', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(typeof result.current.user).toBe('function')
        expect(result.current.user.__id).toBe('user_123')
      })

      it('handles array fragment references', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(typeof result.current.posts[0]).toBe('function')
        expect(result.current.posts[0].__id).toBe('post_1')
      })
    })

    describe('fragment references', () => {
      it('maintains stable fragment reference within same hook', () => {
        const { result, rerender } = renderHook(() => useContentV3(), { wrapper })
        
        const userRef1 = result.current.user
        rerender()
        const userRef2 = result.current.user
        
        // Should return same callable function for stable reference equality within same hook
        expect(userRef1).toBe(userRef2)
        expect(userRef1.__id).toBe('user_123')
      })

      it('handles nested fragment references', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(typeof result.current.meta.author).toBe('function')
        expect(result.current.meta.author.__id).toBe('user_123')
      })

      it('handles array fragment references', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(typeof result.current.posts[0]).toBe('function')
        expect(result.current.posts[0].__id).toBe('post_1')
      })
    })

    describe('fragment resolution', () => {
      it('resolves fragments with ()', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(result.current.user()).toEqual({ name: 'John', role: 'admin' })
      })

      it('resolves array fragments', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(result.current.posts[0]()).toEqual({ title: 'Hello World', views: 100 })
      })

      it('allows chaining after resolution', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(result.current.user().name).toBe('John')
      })
    })

    describe('proxy escape behavior', () => {
      it('allows proxy to escape hook scope', () => {
        let escapedProxy
        
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          escapedProxy = proxy
          return proxy.title
        }, { wrapper })
        
        expect(result.current).toBe('Page Title')
        
        // Use escaped proxy outside hook
        expect(escapedProxy.title).toBe('Page Title')
        expect(typeof escapedProxy.user).toBe('function')
        expect(escapedProxy.user().name).toBe('John')
      })
    })

    describe('read-only enforcement', () => {
      it('prevents page proxy mutations', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(() => {
          result.current.title = 'New Title'
        }).toThrow('Cannot mutate page proxy')
      })

      it('prevents array proxy mutations', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        
        expect(() => {
          result.current.posts[0] = { title: 'hacked' }
        }).toThrow('Cannot mutate proxy array')
      })
    })

    describe('cache behavior', () => {
      it('maintains stable references within same hook instance', () => {
        const { result, rerender } = renderHook(() => useContentV3(), { wrapper })
        
        const userRef1 = result.current.user
        const postRef1 = result.current.posts[0]
        
        rerender()
        
        const userRef2 = result.current.user
        const postRef2 = result.current.posts[0]
        
        // Fragment references should be identical (cached) within same hook
        expect(userRef1).toBe(userRef2)
        expect(postRef1).toBe(postRef2)
      })
    })

    describe('complex expressions', () => {
      it('handles arithmetic with resolved fragments', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return proxy.posts[0]().views + proxy.posts[1]().views
        }, { wrapper })
        
        expect(result.current).toBe(150) // 100 + 50
      })

      it('handles string operations', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return `Hello ${proxy.user().name}`
        }, { wrapper })
        
        expect(result.current).toBe('Hello John')
      })
    })
  })
})
