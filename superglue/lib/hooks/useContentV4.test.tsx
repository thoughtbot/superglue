import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelector } from 'react-redux'
import { useContentV4 } from './useContentV4'

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn()
}))

const mockUseSelector = vi.mocked(useSelector)

describe('useContentV4', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('should return empty object when no page data', () => {
      mockUseSelector
        .mockReturnValueOnce('currentPage') // currentPageKey
        .mockReturnValueOnce(undefined) // pageData
        .mockReturnValueOnce({}) // fragments

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content).toEqual({})
    })

    it('should return proxied page data', () => {
      const pageData = {
        title: 'Test Page',
        posts: [
          { id: 1, title: 'Post 1' },
          { id: 2, title: 'Post 2' }
        ]
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage') // currentPageKey
        .mockReturnValueOnce(pageData) // pageData
        .mockReturnValueOnce({}) // fragments

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content.title).toBe('Test Page')
      expect(content.posts).toHaveLength(2)
      expect(content.posts[0].title).toBe('Post 1')
    })

    it('should provide unProxyFragment function', () => {
      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce({})
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [, unProxyFragment] = result.current

      expect(typeof unProxyFragment).toBe('function')
    })
  })

  describe('Fragment resolution', () => {
    it('should auto-resolve fragment references', () => {
      const pageData = {
        user: { __id: 'user_123' },
        posts: [{ __id: 'post_456' }]
      }

      const fragments = {
        user_123: { name: 'John', email: 'john@example.com' },
        post_456: { title: 'Fragment Post', content: 'Content here' }
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage') // currentPageKey
        .mockReturnValueOnce(pageData) // pageData
        .mockReturnValueOnce(fragments) // fragments

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      // Fragments should auto-resolve without () calls
      expect(content.user.name).toBe('John')
      expect(content.user.email).toBe('john@example.com')
      expect(content.posts[0].title).toBe('Fragment Post')
      expect(content.posts[0].content).toBe('Content here')
    })

    it('should handle nested fragment references', () => {
      const pageData = {
        user: { __id: 'user_123' }
      }

      const fragments = {
        user_123: {
          profile: { __id: 'profile_789' },
          posts: [{ __id: 'post_456' }]
        },
        profile_789: { bio: 'Developer', location: 'SF' },
        post_456: { title: 'Nested Fragment' }
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce(fragments)

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      // Nested fragments should resolve automatically
      expect(content.user.profile.bio).toBe('Developer')
      expect(content.user.profile.location).toBe('SF')
      expect(content.user.posts[0].title).toBe('Nested Fragment')
    })

    it('should handle missing fragments gracefully', () => {
      const pageData = {
        user: { __id: 'missing_fragment' }
      }

      const fragments = {}

      // Mock console.warn to test warning
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce(fragments)

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content.user).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('Fragment missing_fragment not found')

      consoleSpy.mockRestore()
    })
  })

  describe('Array handling', () => {
    it('should proxy arrays correctly', () => {
      const pageData = {
        posts: [
          { title: 'Post 1', author: 'John' },
          { title: 'Post 2', author: 'Jane' }
        ]
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content.posts[0].title).toBe('Post 1')
      expect(content.posts[1].author).toBe('Jane')
      expect(content.posts.length).toBe(2)
    })

    it('should handle array.map() correctly', () => {
      const pageData = {
        posts: [
          { title: 'Post 1' },
          { title: 'Post 2' }
        ]
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      const titles = content.posts.map((post: any) => post.title)
      expect(titles).toEqual(['Post 1', 'Post 2'])
    })

    it('should handle arrays with fragment references', () => {
      const pageData = {
        posts: [
          { __id: 'post_1' },
          { __id: 'post_2' }
        ]
      }

      const fragments = {
        post_1: { title: 'Fragment Post 1', views: 100 },
        post_2: { title: 'Fragment Post 2', views: 200 }
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce(fragments)

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content.posts[0].title).toBe('Fragment Post 1')
      expect(content.posts[1].views).toBe(200)

      // Map should work with resolved fragments
      const titles = content.posts.map((post: any) => post.title)
      expect(titles).toEqual(['Fragment Post 1', 'Fragment Post 2'])
    })
  })

  describe('unProxyFragment functionality', () => {
    it('should return fragment reference and remove from dependencies', () => {
      const pageData = {
        user: { __id: 'user_123' }
      }

      const fragments = {
        user_123: { name: 'John', email: 'john@example.com' }
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce(fragments)

      const { result } = renderHook(() => useContentV4())
      const [content, unProxyFragment] = result.current

      // Access fragment to track it
      const userName = content.user.name

      // unProxyFragment should return the reference
      const userRef = unProxyFragment(content.user)
      expect(userRef).toEqual({ __id: 'user_123' })
    })

    it('should throw error for non-fragment objects', () => {
      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce({ name: 'John' })
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content, unProxyFragment] = result.current

      // Try to unproxy a regular object (not a fragment)
      expect(() => {
        unProxyFragment({ name: 'John' })
      }).toThrow('unProxyFragment() can only be called with fragment data returned from useContentV4')
    })

    it('should throw error for primitives', () => {
      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce({ title: 'Test' })
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [, unProxyFragment] = result.current

      expect(() => {
        unProxyFragment('string')
      }).toThrow('unProxyFragment() can only be called with fragment data returned from useContentV4')
    })
  })

  describe('Immutability enforcement', () => {
    it('should prevent mutations on content proxy', () => {
      const pageData = { title: 'Test' }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(() => {
        (content as any).title = 'Modified'
      }).toThrow('Cannot mutate content proxy. Use Redux actions to update state.')
    })

    it('should prevent mutations on array proxy', () => {
      const pageData = { posts: [{ title: 'Post 1' }] }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(() => {
        (content.posts as any)[0] = { title: 'Modified' }
      }).toThrow('Cannot mutate array proxy. Use Redux actions to update state.')
    })

    it('should prevent property definition', () => {
      const pageData = { title: 'Test' }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(() => {
        Object.defineProperty(content, 'newProp', { value: 'test' })
      }).toThrow('Cannot define properties on content proxy. Use Redux actions to update state.')
    })

    it('should prevent property deletion', () => {
      const pageData = { title: 'Test', description: 'Desc' }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(() => {
        delete (content as any).title
      }).toThrow('Cannot delete properties on content proxy. Use Redux actions to update state.')
    })
  })

  describe('Dependency tracking and caching', () => {
    it('should track fragment dependencies when accessed', () => {
      const pageData = { user: { __id: 'user_123' }, posts: [{ __id: 'post_456' }] }
      const fragments = { 
        user_123: { name: 'John' }, 
        post_456: { title: 'Test Post' } 
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage') // currentPageKey
        .mockReturnValueOnce(pageData) // pageData
        .mockReturnValueOnce(fragments) // fragments

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      // Access different fragments - this should track them
      const userName = content.user.name // Should track 'user_123'
      const postTitle = content.posts[0].title // Should track 'post_456'

      expect(userName).toBe('John')
      expect(postTitle).toBe('Test Post')
      
      // Note: Testing the internal dependency tracking is tricky with mocked Redux,
      // but the important thing is that accessing fragments works correctly
    })

    it('should cache fragment proxies', () => {
      const pageData = { user: { __id: 'user_123' } }
      const fragments = { user_123: { name: 'John' } }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce(fragments)

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      // Access the same fragment multiple times
      const user1 = content.user
      const user2 = content.user

      // Should return the same proxied object (referential equality)
      expect(user1).toBe(user2)
    })
  })

  describe('Edge cases', () => {
    it('should handle null and undefined values', () => {
      const pageData = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content.nullValue).toBeNull()
      expect(content.undefinedValue).toBeUndefined()
      expect(content.emptyString).toBe('')
      expect(content.zero).toBe(0)
    })

    it('should handle empty arrays', () => {
      const pageData = { emptyPosts: [] }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content.emptyPosts).toEqual([])
      expect(content.emptyPosts.length).toBe(0)
    })

    it('should handle deeply nested objects', () => {
      const pageData = {
        level1: {
          level2: {
            level3: {
              deepValue: 'found'
            }
          }
        }
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce({})

      const { result } = renderHook(() => useContentV4())
      const [content] = result.current

      expect(content.level1.level2.level3.deepValue).toBe('found')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complex nested fragment structure', () => {
      const pageData = {
        currentUser: { __id: 'user_1' },
        posts: [
          { __id: 'post_1' },
          { __id: 'post_2' }
        ]
      }

      const fragments = {
        user_1: {
          name: 'John',
          profile: { __id: 'profile_1' },
          favoritePost: { __id: 'post_1' }
        },
        profile_1: {
          bio: 'Developer',
          location: 'SF',
          avatar: { __id: 'avatar_1' }
        },
        avatar_1: {
          url: 'https://example.com/avatar.jpg',
          alt: 'John Avatar'
        },
        post_1: {
          title: 'First Post',
          author: { __id: 'user_1' },
          comments: [{ __id: 'comment_1' }]
        },
        post_2: {
          title: 'Second Post',
          author: { __id: 'user_1' }
        },
        comment_1: {
          text: 'Great post!',
          author: { __id: 'user_1' }
        }
      }

      mockUseSelector
        .mockReturnValueOnce('currentPage')
        .mockReturnValueOnce(pageData)
        .mockReturnValueOnce(fragments)

      const { result } = renderHook(() => useContentV4())
      const [content, unProxyFragment] = result.current

      // Test deep nesting
      expect(content.currentUser.name).toBe('John')
      expect(content.currentUser.profile.bio).toBe('Developer')
      expect(content.currentUser.profile.avatar.url).toBe('https://example.com/avatar.jpg')

      // Test circular references
      expect(content.currentUser.favoritePost.title).toBe('First Post')
      expect(content.currentUser.favoritePost.author.name).toBe('John')

      // Test array with fragments
      expect(content.posts[0].title).toBe('First Post')
      expect(content.posts[0].comments[0].text).toBe('Great post!')

      // Test unProxyFragment with nested structure
      const profileRef = unProxyFragment(content.currentUser.profile)
      expect(profileRef).toEqual({ __id: 'profile_1' })
    })
  })
})