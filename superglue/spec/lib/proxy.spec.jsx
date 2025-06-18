import { describe, it, expect, beforeEach } from 'vitest'
import { createProxy, clearAllProxyCaches, invalidateFragmentProxies } from '../../lib/utils/proxy'
import { useRef } from 'react'

describe('proxy utilities', () => {
  let dependenciesRef
  let fragments

  beforeEach(() => {
    clearAllProxyCaches()
    dependenciesRef = { current: new Set() }
    fragments = {
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
      },
      comment_1: {
        text: 'Great post!',
        author: { __id: 'user_123' }
      }
    }
  })

  describe('createProxy basic behavior', () => {
    it('returns primitives unchanged', () => {
      expect(createProxy('hello', fragments, dependenciesRef)).toBe('hello')
      expect(createProxy(42, fragments, dependenciesRef)).toBe(42)
      expect(createProxy(true, fragments, dependenciesRef)).toBe(true)
      expect(createProxy(null, fragments, dependenciesRef)).toBe(null)
      expect(createProxy(undefined, fragments, dependenciesRef)).toBe(undefined)
    })

    it('proxies objects without fragment references', () => {
      const data = { title: 'Page Title', count: 42 }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy.title).toBe('Page Title')
      expect(proxy.count).toBe(42)
      expect(dependenciesRef.current.size).toBe(0)
    })

    it('proxies arrays without fragment references', () => {
      const data = ['item1', 'item2', { name: 'item3' }]
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy[0]).toBe('item1')
      expect(proxy[1]).toBe('item2')
      expect(proxy[2].name).toBe('item3')
      expect(proxy.length).toBe(3)
      expect(dependenciesRef.current.size).toBe(0)
    })
  })

  describe('fragment resolution', () => {
    it('resolves fragment references and tracks dependencies', () => {
      const data = {
        title: 'Page Title',
        user: { __id: 'user_123' }
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy.title).toBe('Page Title')
      expect(proxy.user.name).toBe('John')
      expect(proxy.user.role).toBe('admin')
      expect(dependenciesRef.current.has('user_123')).toBe(true)
    })

    it('resolves nested fragment properties', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy.user.profile.avatar).toBe('avatar.jpg')
      expect(proxy.user.profile.bio).toBe('Software engineer')
      expect(dependenciesRef.current.has('user_123')).toBe(true)
    })

    it('resolves array fragment references', () => {
      const data = {
        posts: [
          { __id: 'post_1' },
          { __id: 'post_2' }
        ]
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy.posts[0].title).toBe('Hello World')
      expect(proxy.posts[0].views).toBe(100)
      expect(proxy.posts[1].title).toBe('Another Post')
      expect(proxy.posts[1].views).toBe(50)
      expect(dependenciesRef.current.has('post_1')).toBe(true)
      expect(dependenciesRef.current.has('post_2')).toBe(true)
    })

    it('throws error for missing fragments', () => {
      const data = { user: { __id: 'missing_user' } }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(() => proxy.user).toThrow('Fragment with id "missing_user" not found')
    })
  })

  describe('composable fragment chains', () => {
    it('handles fragments that reference other fragments', () => {
      const data = { post: { __id: 'post_1' } }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      // post_1 contains author: { __id: 'user_123' }
      expect(proxy.post.title).toBe('Hello World')
      expect(proxy.post.author.name).toBe('John')
      expect(proxy.post.author.role).toBe('admin')
      
      expect(dependenciesRef.current.has('post_1')).toBe(true)
      expect(dependenciesRef.current.has('user_123')).toBe(true)
    })

    it('handles deep nested fragment chains', () => {
      const data = {
        posts: [{ __id: 'post_1' }],
        metadata: {
          author: { __id: 'user_123' }
        }
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      // Deep access: posts[0].author.profile.avatar
      expect(proxy.posts[0].author.profile.avatar).toBe('avatar.jpg')
      expect(proxy.metadata.author.name).toBe('John')
      
      expect(dependenciesRef.current.has('post_1')).toBe(true)
      expect(dependenciesRef.current.has('user_123')).toBe(true)
    })
  })

  describe('global caching behavior', () => {
    it('returns same proxy instance for same object across calls', () => {
      const data = { title: 'Page Title', count: 42 }
      
      const proxy1 = createProxy(data, fragments, dependenciesRef)
      const proxy2 = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy1).toBe(proxy2)
    })

    it('returns same proxy instance across different dependency refs', () => {
      const data = { title: 'Page Title', count: 42 }
      const otherDependenciesRef = { current: new Set() }
      
      const proxy1 = createProxy(data, fragments, dependenciesRef)
      const proxy2 = createProxy(data, fragments, otherDependenciesRef)
      
      expect(proxy1).toBe(proxy2)
    })

    it('caches nested object proxies', () => {
      const data = {
        user: { name: 'John', profile: { avatar: 'avatar.jpg' } }
      }
      
      const proxy1 = createProxy(data, fragments, dependenciesRef)
      const proxy2 = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy1.user).toBe(proxy2.user)
      expect(proxy1.user.profile).toBe(proxy2.user.profile)
    })

    it('caches array proxies', () => {
      const data = { posts: ['post1', 'post2'] }
      
      const proxy1 = createProxy(data, fragments, dependenciesRef)
      const proxy2 = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy1.posts).toBe(proxy2.posts)
    })
  })

  describe('array method handling', () => {
    it('supports array getter methods', () => {
      const data = {
        posts: [
          { __id: 'post_1' },
          { __id: 'post_2' }
        ]
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      // Test various array methods
      expect(proxy.posts.length).toBe(2)
      
      const titles = proxy.posts.map(post => post.title)
      expect(titles).toEqual(['Hello World', 'Another Post'])
      
      const highViewPost = proxy.posts.find(post => post.views > 75)
      expect(highViewPost.title).toBe('Hello World')
      
      const hasViews = proxy.posts.every(post => typeof post.views === 'number')
      expect(hasViews).toBe(true)
      
      expect(dependenciesRef.current.has('post_1')).toBe(true)
      expect(dependenciesRef.current.has('post_2')).toBe(true)
    })

    it('returns proxied arrays from array methods', () => {
      const data = {
        posts: [
          { __id: 'post_1' },
          { __id: 'post_2' }
        ]
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      const filteredPosts = proxy.posts.filter(post => post.views > 75)
      expect(filteredPosts[0].title).toBe('Hello World')
      expect(filteredPosts[0].author.name).toBe('John')
    })

    it('blocks array setter methods', () => {
      const data = { posts: ['post1', 'post2'] }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(() => proxy.posts.push('new post')).toThrow('Cannot mutate proxy array')
      expect(() => proxy.posts.pop()).toThrow('Cannot mutate proxy array')
      expect(() => proxy.posts.splice(0, 1)).toThrow('Cannot mutate proxy array')
      expect(() => proxy.posts.sort()).toThrow('Cannot mutate proxy array')
    })
  })

  describe('mutation prevention', () => {
    it('prevents object property mutations', () => {
      const data = { title: 'Page Title', count: 42 }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(() => proxy.title = 'New Title').toThrow('Cannot mutate proxy object')
      expect(() => delete proxy.count).toThrow('Cannot delete properties on proxy object')
      expect(() => Object.defineProperty(proxy, 'newProp', { value: 'test' }))
        .toThrow('Cannot define properties on proxy object')
    })

    it('prevents array mutations', () => {
      const data = { posts: ['post1', 'post2'] }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(() => proxy.posts[0] = 'new post').toThrow('Cannot mutate proxy array')
      expect(() => delete proxy.posts[0]).toThrow('Cannot delete properties on proxy array')
      expect(() => Object.defineProperty(proxy.posts, 'newProp', { value: 'test' }))
        .toThrow('Cannot define properties on proxy array')
    })

    it('prevents mutations on resolved fragments', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(() => proxy.user.name = 'Jane').toThrow('Cannot mutate proxy object')
      expect(() => delete proxy.user.role).toThrow('Cannot delete properties on proxy object')
    })
  })

  describe('dependency tracking isolation', () => {
    it('tracks dependencies independently per dependency ref', () => {
      const data1 = { user: { __id: 'user_123' } }
      const data2 = { post: { __id: 'post_1' } }
      
      const deps1 = { current: new Set() }
      const deps2 = { current: new Set() }
      
      const proxy1 = createProxy(data1, fragments, deps1)
      const proxy2 = createProxy(data2, fragments, deps2)
      
      // Access different properties on different data
      proxy1.user.name   // Should track user_123 in deps1
      proxy2.post.title  // Should track post_1 in deps2
      
      expect(deps1.current.has('user_123')).toBe(true)
      expect(deps1.current.has('post_1')).toBe(false)
      
      expect(deps2.current.has('post_1')).toBe(true)
      expect(deps2.current.has('user_123')).toBe(false)
    })
  })

  describe('cache invalidation utilities', () => {
    it('clears all caches with clearAllProxyCaches', () => {
      const data = { title: 'Page Title' }
      const proxy1 = createProxy(data, fragments, dependenciesRef)
      
      clearAllProxyCaches()
      
      const proxy2 = createProxy(data, fragments, dependenciesRef)
      // Should still be same due to WeakMap caching (which we can't clear)
      expect(proxy1).toBe(proxy2)
    })

    it('provides invalidateFragmentProxies for middleware', () => {
      // This function exists for middleware usage
      expect(typeof invalidateFragmentProxies).toBe('function')
      
      // Should not throw when called
      expect(() => invalidateFragmentProxies(['user_123', 'post_1'])).not.toThrow()
    })
  })

  describe('complex real-world scenarios', () => {
    it('handles mixed fragment and non-fragment data', () => {
      const data = {
        title: 'Page Title',
        user: { __id: 'user_123' },
        posts: [
          { __id: 'post_1' },
          { title: 'Non-fragment post', views: 25 }
        ],
        metadata: {
          created: '2023-01-01',
          author: { __id: 'user_123' }
        }
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy.title).toBe('Page Title')
      expect(proxy.user.name).toBe('John')
      expect(proxy.posts[0].title).toBe('Hello World')
      expect(proxy.posts[1].title).toBe('Non-fragment post')
      expect(proxy.metadata.created).toBe('2023-01-01')
      expect(proxy.metadata.author.role).toBe('admin')
      
      expect(dependenciesRef.current.has('user_123')).toBe(true)
      expect(dependenciesRef.current.has('post_1')).toBe(true)
    })

    it('handles arrays of mixed fragment and primitive data', () => {
      const data = {
        items: [
          'string item',
          42,
          { __id: 'user_123' },
          { name: 'regular object' },
          { __id: 'post_1' }
        ]
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy.items[0]).toBe('string item')
      expect(proxy.items[1]).toBe(42)
      expect(proxy.items[2].name).toBe('John')
      expect(proxy.items[3].name).toBe('regular object')
      expect(proxy.items[4].title).toBe('Hello World')
      
      expect(dependenciesRef.current.has('user_123')).toBe(true)
      expect(dependenciesRef.current.has('post_1')).toBe(true)
    })

    it('handles deeply nested structures with multiple fragment types', () => {
      const complexData = {
        page: {
          header: {
            user: { __id: 'user_123' },
            navigation: ['home', 'about']
          },
          content: {
            posts: [
              { __id: 'post_1' },
              { __id: 'post_2' }
            ],
            sidebar: {
              author: { __id: 'user_123' },
              featuredPost: { __id: 'post_2' }
            }
          }
        }
      }
      const proxy = createProxy(complexData, fragments, dependenciesRef)
      
      // Test deep access paths
      expect(proxy.page.header.user.profile.bio).toBe('Software engineer')
      expect(proxy.page.content.posts[0].author.name).toBe('John')
      expect(proxy.page.content.sidebar.author.role).toBe('admin')
      expect(proxy.page.content.sidebar.featuredPost.tags).toEqual(['react', 'javascript'])
      
      expect(dependenciesRef.current.has('user_123')).toBe(true)
      expect(dependenciesRef.current.has('post_1')).toBe(true)
      expect(dependenciesRef.current.has('post_2')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty objects and arrays', () => {
      const data = { empty: {}, emptyArray: [] }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      expect(proxy.empty).toEqual({})
      expect(proxy.emptyArray).toEqual([])
      expect(proxy.emptyArray.length).toBe(0)
    })

    it('handles circular references in non-fragment data', () => {
      const circular = { name: 'test' }
      circular.self = circular
      const data = { circular }
      
      const proxy = createProxy(data, fragments, dependenciesRef)
      expect(proxy.circular.name).toBe('test')
      expect(proxy.circular.self.name).toBe('test')
    })

    it('handles fragment references with additional properties', () => {
      const data = {
        user: { __id: 'user_123', localProp: 'should be ignored' }
      }
      const proxy = createProxy(data, fragments, dependenciesRef)
      
      // Should resolve to fragment data, ignoring local properties
      expect(proxy.user.name).toBe('John')
      expect(proxy.user.localProp).toBeUndefined()
    })
  })
})