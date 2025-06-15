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
    // Test state matching V2 style
    const state = {
      superglue: {
        currentPageKey: '/dashboard',
      },
      pages: {
        '/dashboard': {
          data: {
            title: 'Dashboard',
            count: 25,
            user: { __id: 'user_456' },
            posts: [
              { __id: 'post_10' },
              { __id: 'post_20' },
              { title: 'Plain post' }
            ],
            settings: {
              theme: 'dark',
              profile: { __id: 'user_456' }
            }
          }
        }
      },
      fragments: {
        user_456: {
          name: 'Jane',
          role: 'editor'
        },
        post_10: {
          title: 'V3 Post',
          views: 200
        },
        post_20: {
          title: 'Another V3 Post',
          views: 75
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

    describe('stable proxy behavior', () => {
      it('returns stable proxy reference', () => {
        const { result: result1, rerender } = renderHook(() => useContentV3(), { wrapper })
        const { result: result2 } = renderHook(() => useContentV3(), { wrapper })
        
        // Should return stable proxy objects
        expect(result1.current).toBeDefined()
        expect(result2.current).toBeDefined()
        
        // Proxies should have content proxy marker
        expect(result1.current.__isContentProxy).toBe(true)
        expect(result2.current.__isContentProxy).toBe(true)
      })

      it('allows property navigation without tracking', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        const proxy = result.current
        
        // Navigate without calling - should not track dependencies
        const userRef = proxy.user
        const postsArray = proxy.posts
        const firstPostRef = proxy.posts[0]
        
        expect(userRef.__id).toBe('user_456')
        expect(Array.isArray(postsArray)).toBe(true)
        expect(firstPostRef.__id).toBe('post_10')
      })
    })

    describe('fragment resolution', () => {
      it('resolves fragments with () calls', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return proxy.user()
        }, { wrapper })
        
        expect(result.current).toEqual({
          name: 'Jane',
          role: 'editor'
        })
      })

      it('resolves array fragments', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return proxy.posts[0]()
        }, { wrapper })
        
        expect(result.current).toEqual({
          title: 'V3 Post',
          views: 200
        })
      })

      it('allows chaining after resolution', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return proxy.user().name
        }, { wrapper })
        
        expect(result.current).toBe('Jane')
      })
    })

    describe('read-only enforcement', () => {
      it('prevents direct property mutation', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        const proxy = result.current
        
        expect(() => {
          proxy.title = 'New Title'
        }).toThrow('Cannot mutate page proxy')
      })

      it('prevents property deletion', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        const proxy = result.current
        
        expect(() => {
          delete proxy.title
        }).toThrow('Cannot delete properties on page proxy')
      })

      it('prevents defining new properties', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        const proxy = result.current
        
        expect(() => {
          Object.defineProperty(proxy, 'newProp', { value: 'test' })
        }).toThrow('Cannot define properties on page proxy')
      })

      it('prevents array mutation', () => {
        const { result } = renderHook(() => useContentV3(), { wrapper })
        const proxy = result.current
        
        expect(() => {
          proxy.posts[0] = { title: 'hacked' }
        }).toThrow('Cannot mutate proxy array')
      })
    })

    describe('primitive access', () => {
      it('returns primitives unchanged', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return {
            title: proxy.title,
            count: proxy.count
          }
        }, { wrapper })
        
        expect(result.current.title).toBe('Dashboard')
        expect(result.current.count).toBe(25)
      })
    })

    describe('nested object navigation', () => {
      it('handles nested object access', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return {
            theme: proxy.settings.theme,
            profileRef: proxy.settings.profile
          }
        }, { wrapper })
        
        expect(result.current.theme).toBe('dark')
        expect(typeof result.current.profileRef).toBe('function')
        expect(result.current.profileRef.__id).toBe('user_456')
      })

      it('resolves nested fragments', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return proxy.settings.profile()
        }, { wrapper })
        
        expect(result.current).toEqual({
          name: 'Jane',
          role: 'editor'
        })
      })
    })

    describe('complex expressions', () => {
      it('handles arithmetic with resolved fragments', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return proxy.posts[0]().views + proxy.posts[1]().views
        }, { wrapper })
        
        expect(result.current).toBe(275) // 200 + 75
      })

      it('handles string operations', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return `Hello ${proxy.user().name}`
        }, { wrapper })
        
        expect(result.current).toBe('Hello Jane')
      })

      it('handles mixed access patterns', () => {
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          return {
            title: proxy.title,                    // primitive
            userRef: proxy.user,                   // fragment reference (callable)
            userData: proxy.user(),                // resolved fragment
            firstPostTitle: proxy.posts[0]().title // resolved array fragment
          }
        }, { wrapper })
        
        expect(result.current.title).toBe('Dashboard')
        expect(typeof result.current.userRef).toBe('function')
        expect(result.current.userRef.__id).toBe('user_456')
        expect(result.current.userData).toEqual({ name: 'Jane', role: 'editor' })
        expect(result.current.firstPostTitle).toBe('V3 Post')
      })
    })

    describe('proxy escape behavior', () => {
      it('allows proxy to be stored and used later', () => {
        let savedProxy
        
        const { result } = renderHook(() => {
          const proxy = useContentV3()
          savedProxy = proxy  // Proxy "escapes" the hook
          return proxy.title
        }, { wrapper })
        
        expect(result.current).toBe('Dashboard')
        
        // Use saved proxy outside of hook
        expect(savedProxy.title).toBe('Dashboard')
        expect(typeof savedProxy.user).toBe('function')
        expect(savedProxy.user.__id).toBe('user_456')
        expect(savedProxy.user().name).toBe('Jane')
      })
    })
  })
})
