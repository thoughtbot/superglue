import { renderHook } from '@testing-library/react'
import { useContentV4, unproxy } from '../../lib'
import { describe, it, expect, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { clearAllProxyCaches } from '../../lib/utils/proxy'

describe('useContentV4', () => {
  let store
  let wrapper

  beforeEach(() => {
    clearAllProxyCaches()
    
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
            title: 'Page Title',
            count: 42,
            user: { __id: 'user_123' },
            posts: [
              { __id: 'post_1' },
              { __id: 'post_2' },
              { title: 'Non-fragment post', views: 25 }
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
          role: 'admin',
          profile: {
            avatar: 'avatar.jpg',
            bio: 'Software engineer'
          }
        },
        post_1: {
          title: 'Hello World',
          views: 100,
          author: { __id: 'user_123' }
        },
        post_2: {
          title: 'Another Post',
          views: 50,
          tags: ['react', 'javascript']
        }
      }
    }

    store = configureStore({
      preloadedState,
      reducer: (state) => state,
    })

    wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
  })

  describe('basic functionality', () => {
    it('returns page data with direct fragment access', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })

      expect(result.current.title).toBe('Page Title')
      expect(result.current.count).toBe(42)
      
      // Direct fragment access - no callable syntax
      expect(result.current.user.name).toBe('John')
      expect(result.current.user.role).toBe('admin')
      expect(result.current.user.profile.avatar).toBe('avatar.jpg')
    })

    it('handles nested fragment resolution', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      // Deep fragment chain: page -> user -> profile
      expect(result.current.user.profile.bio).toBe('Software engineer')
      
      // Nested fragment references: page -> meta -> author
      expect(result.current.meta.author.name).toBe('John')
      expect(result.current.meta.author.role).toBe('admin')
    })

    it('handles array fragment references', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      expect(result.current.posts[0].title).toBe('Hello World')
      expect(result.current.posts[0].views).toBe(100)
      expect(result.current.posts[1].title).toBe('Another Post')
      expect(result.current.posts[1].tags).toEqual(['react', 'javascript'])
    })

    it('handles composable fragment chains', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      // post_1 -> author -> user_123 chain
      expect(result.current.posts[0].author.name).toBe('John')
      expect(result.current.posts[0].author.profile.avatar).toBe('avatar.jpg')
    })

    it('handles mixed fragment and non-fragment data', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      expect(result.current.posts[2].title).toBe('Non-fragment post')
      expect(result.current.posts[2].views).toBe(25)
      expect(result.current.meta.theme).toBe('light')
    })
  })

  describe('array method support', () => {
    it('supports array methods with fragment resolution', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      const titles = result.current.posts.map(post => post.title)
      expect(titles).toEqual(['Hello World', 'Another Post', 'Non-fragment post'])
      
      const highViewPost = result.current.posts.find(post => post.views > 75)
      expect(highViewPost.title).toBe('Hello World')
      
      const hasViews = result.current.posts.every(post => typeof post.views === 'number')
      expect(hasViews).toBe(true)
    })

    it('supports filtering and complex operations', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      const fragmentPosts = result.current.posts.filter(post => {
        // Check if this is a fragment reference before resolution
        return post.title === 'Hello World' || post.title === 'Another Post'
      })
      expect(fragmentPosts).toHaveLength(2)
      
      const totalViews = result.current.posts.reduce((sum, post) => sum + (post.views || 0), 0)
      expect(totalViews).toBe(175) // 100 + 50 + 25
    })

    it('returns proxied arrays from array methods', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      const filteredPosts = result.current.posts.filter(post => post.views > 50)
      expect(filteredPosts[0].title).toBe('Hello World')
      expect(filteredPosts[0].author.name).toBe('John') // Fragment chain still works
    })
  })

  describe('mutation prevention', () => {
    it('prevents object mutations', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      expect(() => {
        result.current.title = 'New Title'
      }).toThrow('Cannot mutate proxy object')
      
      expect(() => {
        result.current.user.name = 'Jane'
      }).toThrow('Cannot mutate proxy object')
    })

    it('prevents array mutations', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      expect(() => {
        result.current.posts.push({ title: 'New Post' })
      }).toThrow('Cannot mutate proxy array')
      
      expect(() => {
        result.current.posts[0] = { title: 'Hacked' }
      }).toThrow('Cannot mutate proxy array')
    })

    it('prevents property deletion', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      expect(() => {
        delete result.current.title
      }).toThrow('Cannot delete properties on proxy object')
      
      expect(() => {
        delete result.current.posts[0]
      }).toThrow('Cannot delete properties on proxy array')
    })
  })

  describe('per-hook dependency tracking', () => {
    it('tracks dependencies independently per hook instance', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      // Hook 1 accesses user
      result1.current.user.name
      
      // Hook 2 accesses posts  
      result2.current.posts[0].title
      
      // Each hook should work independently
      expect(result1.current.user.role).toBe('admin')
      expect(result2.current.posts[1].views).toBe(50)
    })

    it('provides reference stability within same hook', () => {
      const { result, rerender } = renderHook(() => useContentV4(), { wrapper })
      
      const user1 = result.current.user
      rerender()
      const user2 = result.current.user
      
      // Same hook instance should return same proxy
      expect(user1).toBe(user2)
    })

    it('creates different proxy instances across hooks', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      const user1 = result1.current.user
      const user2 = result2.current.user
      
      // Different hook instances create different proxies
      expect(user1).not.toBe(user2)
      
      // But access same underlying data
      expect(user1.name).toBe(user2.name)
      expect(user1.role).toBe(user2.role)
    })
  })

  describe('unproxy functionality', () => {
    it('returns underlying data for reference equality', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      const user1 = result1.current.user
      const user2 = result2.current.user
      
      // Different proxies
      expect(user1).not.toBe(user2)
      
      // Same underlying data via unproxy
      expect(unproxy(user1)).toBe(unproxy(user2))
    })

    it('works with nested fragments', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      const profile1 = result1.current.user.profile
      const profile2 = result2.current.user.profile
      
      expect(profile1).not.toBe(profile2)
      expect(unproxy(profile1)).toBe(unproxy(profile2))
    })

    it('works with array elements', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      const post1 = result1.current.posts[0]
      const post2 = result2.current.posts[0]
      
      expect(post1).not.toBe(post2)
      expect(unproxy(post1)).toBe(unproxy(post2))
    })

    it('returns input unchanged for non-proxy values', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      const title = result.current.title
      const count = result.current.count
      
      expect(unproxy(title)).toBe(title)
      expect(unproxy(count)).toBe(count)
      expect(unproxy('random string')).toBe('random string')
      expect(unproxy(null)).toBe(null)
    })
  })

  describe('error handling', () => {
    it('throws error for missing fragments', () => {
      // Add a reference to non-existent fragment
      store = configureStore({
        preloadedState: {
          ...store.getState(),
          pages: {
            '/current?abc=123': {
              data: {
                missingUser: { __id: 'missing_user' }
              }
            }
          }
        },
        reducer: (state) => state,
      })

      wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      expect(() => {
        result.current.missingUser.name
      }).toThrow('Fragment with id "missing_user" not found')
    })
  })

  describe('performance characteristics', () => {
    it('caches proxies globally for same underlying objects', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      // Access same fragment from both hooks
      const user1 = result1.current.user
      const user2 = result2.current.user
      
      // Should use global caching for underlying objects
      expect(unproxy(user1)).toBe(unproxy(user2))
    })

    it('maintains proxy stability within hook across re-renders', () => {
      const { result, rerender } = renderHook(() => useContentV4(), { wrapper })
      
      const proxy1 = result.current
      const user1 = result.current.user
      
      rerender()
      
      const proxy2 = result.current  
      const user2 = result.current.user
      
      // Proxy instances should be stable within same hook
      expect(proxy1).toBe(proxy2)
      expect(user1).toBe(user2)
    })
  })

  describe('complex real-world scenarios', () => {
    it('handles deeply nested fragment chains', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      // Complex chain: page -> posts[0] -> author -> profile -> avatar
      expect(result.current.posts[0].author.profile.avatar).toBe('avatar.jpg')
      
      // Multiple paths to same fragment
      expect(result.current.user.name).toBe('John')
      expect(result.current.meta.author.name).toBe('John')
      expect(result.current.posts[0].author.name).toBe('John')
    })

    it('works with array methods on fragment arrays', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      const authors = result.current.posts
        .filter(post => post.author)
        .map(post => post.author.name)
      
      expect(authors).toEqual(['John'])
    })

    it('supports complex data transformations', () => {
      const { result } = renderHook(() => useContentV4(), { wrapper })
      
      const postsByAuthor = result.current.posts
        .filter(post => post.author)
        .reduce((acc, post) => {
          const authorName = post.author.name
          acc[authorName] = acc[authorName] || []
          acc[authorName].push(post.title)
          return acc
        }, {})
      
      expect(postsByAuthor).toEqual({
        'John': ['Hello World']
      })
    })
  })

  describe('integration with memoization', () => {
    it('enables proper memoization with unproxy', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      const user1 = result1.current.user
      const user2 = result2.current.user
      
      // Simulate React.memo or useMemo dependency array
      const deps1 = [unproxy(user1)]
      const deps2 = [unproxy(user2)]
      
      // Should be considered equal for memoization
      expect(deps1[0]).toBe(deps2[0])
    })

    it('works with complex memoization scenarios', () => {
      const { result: result1 } = renderHook(() => useContentV4(), { wrapper })
      const { result: result2 } = renderHook(() => useContentV4(), { wrapper })
      
      // Simulate component prop comparison
      const props1 = {
        user: unproxy(result1.current.user),
        posts: unproxy(result1.current.posts)
      }
      
      const props2 = {
        user: unproxy(result2.current.user),
        posts: unproxy(result2.current.posts)
      }
      
      expect(props1.user).toBe(props2.user)
      expect(props1.posts).toBe(props2.posts)
    })
  })
})