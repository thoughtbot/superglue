import { describe, it, expect, beforeEach } from 'vitest'
import { createProxy, unproxy, toRef } from '../../lib/utils/proxy'

describe('proxy utilities', () => {
  let dependencies
  let proxyCache
  let fragments

  beforeEach(() => {
    dependencies = new Set()
    proxyCache = new WeakMap()
    fragments = {
      user_123: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        profile: {
          avatar: 'avatar.jpg',
          bio: 'Software engineer',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        posts: [
          { title: 'First Post', views: 100 },
          { title: 'Second Post', views: 50 }
        ]
      },
      post_456: {
        id: 456,
        title: 'Hello World',
        content: 'This is a test post',
        views: 150,
        author: { __id: 'user_123' },
        tags: ['javascript', 'react'],
        comments: [
          { __id: 'comment_789' },
          { text: 'Great post!', author: 'Alice' }
        ]
      },
      post_789: {
        id: 789,
        title: 'Another Post',
        content: 'Second test post',
        views: 150,
        author: { __id: 'user_456' },
        tags: ['testing', 'demo']
      },
      comment_789: {
        id: 789,
        text: 'Nice work!',
        author: { __id: 'user_123' },
        likes: 5
      },
      user_456: {
        id: 456,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'editor'
      },
      category_101: {
        id: 101,
        name: 'Technology',
        posts: [
          { __id: 'post_456' },
          { title: 'Another Tech Post', views: 200 }
        ]
      }
    }
  })

  describe('createProxy - primitives and basic objects', () => {
    it('returns primitives unchanged', () => {
      expect(createProxy('hello', fragments, dependencies, proxyCache)).toBe('hello')
      expect(createProxy(42, fragments, dependencies, proxyCache)).toBe(42)
      expect(createProxy(true, fragments, dependencies, proxyCache)).toBe(true)
      expect(createProxy(false, fragments, dependencies, proxyCache)).toBe(false)
      expect(createProxy(null, fragments, dependencies, proxyCache)).toBe(null)
      expect(createProxy(undefined, fragments, dependencies, proxyCache)).toBe(undefined)
      expect(dependencies.size).toBe(0)
    })

    it('proxies simple objects without fragments', () => {
      const data = { title: 'Page Title', count: 42, active: true }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.title).toBe('Page Title')
      expect(proxy.count).toBe(42)
      expect(proxy.active).toBe(true)
      expect(dependencies.size).toBe(0)
    })

    it('proxies nested objects without fragments', () => {
      const data = {
        user: {
          name: 'Jane',
          settings: {
            theme: 'light',
            notifications: false
          }
        }
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.user.name).toBe('Jane')
      expect(proxy.user.settings.theme).toBe('light')
      expect(proxy.user.settings.notifications).toBe(false)
      expect(dependencies.size).toBe(0)
    })
  })

  describe('createProxy - arrays', () => {
    it('proxies simple arrays', () => {
      const data = ['apple', 'banana', 'cherry']
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy[0]).toBe('apple')
      expect(proxy[1]).toBe('banana')
      expect(proxy[2]).toBe('cherry')
      expect(proxy.length).toBe(3)
      expect(dependencies.size).toBe(0)
    })

    it('proxies arrays with objects', () => {
      const data = [
        { name: 'Item 1', value: 10 },
        { name: 'Item 2', value: 20 }
      ]
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy[0].name).toBe('Item 1')
      expect(proxy[0].value).toBe(10)
      expect(proxy[1].name).toBe('Item 2')
      expect(proxy[1].value).toBe(20)
      expect(proxy.length).toBe(2)
      expect(dependencies.size).toBe(0)
    })

    it('proxies arrays with mixed data types', () => {
      const data = [
        'string',
        42,
        { name: 'object' },
        ['nested', 'array'],
        null,
        true
      ]
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy[0]).toBe('string')
      expect(proxy[1]).toBe(42)
      expect(proxy[2].name).toBe('object')
      expect(proxy[3][0]).toBe('nested')
      expect(proxy[3][1]).toBe('array')
      expect(proxy[4]).toBe(null)
      expect(proxy[5]).toBe(true)
      expect(proxy.length).toBe(6)
    })
  })

  describe('fragment resolution', () => {
    it('resolves simple fragment references', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.user.name).toBe('John Doe')
      expect(proxy.user.email).toBe('john@example.com')
      expect(dependencies.has('user_123')).toBe(true)
      expect(dependencies.size).toBe(1)
    })

    it('resolves nested properties in fragments', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.user.profile.avatar).toBe('avatar.jpg')
      expect(proxy.user.profile.bio).toBe('Software engineer')
      expect(proxy.user.profile.preferences.theme).toBe('dark')
      expect(proxy.user.profile.preferences.notifications).toBe(true)
      expect(dependencies.has('user_123')).toBe(true)
    })

    it('resolves fragment arrays', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.user.posts[0].title).toBe('First Post')
      expect(proxy.user.posts[0].views).toBe(100)
      expect(proxy.user.posts[1].title).toBe('Second Post')
      expect(proxy.user.posts[1].views).toBe(50)
      expect(proxy.user.posts.length).toBe(2)
    })

    it('resolves fragments within arrays', () => {
      const data = {
        items: [
          { __id: 'user_123' },
          { __id: 'post_456' }
        ]
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.items[0].name).toBe('John Doe')
      expect(proxy.items[1].title).toBe('Hello World')
      expect(dependencies.has('user_123')).toBe(true)
      expect(dependencies.has('post_456')).toBe(true)
      expect(dependencies.size).toBe(2)
    })

    it('resolves chained fragment references', () => {
      const data = { post: { __id: 'post_456' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // post_456 has author: { __id: 'user_123' }
      expect(proxy.post.title).toBe('Hello World')
      expect(proxy.post.author.name).toBe('John Doe')
      expect(proxy.post.author.email).toBe('john@example.com')
      expect(dependencies.has('post_456')).toBe(true)
      expect(dependencies.has('user_123')).toBe(true)
      expect(dependencies.size).toBe(2)
    })

    it('resolves complex nested fragment chains', () => {
      const data = { post: { __id: 'post_456' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Access: post.comments[0].author (comment_789 -> user_123)
      expect(proxy.post.comments[0].text).toBe('Nice work!')
      expect(proxy.post.comments[0].author.name).toBe('John Doe')
      expect(proxy.post.comments[0].author.profile.bio).toBe('Software engineer')
      
      expect(dependencies.has('post_456')).toBe(true)
      expect(dependencies.has('comment_789')).toBe(true)
      expect(dependencies.has('user_123')).toBe(true)
      expect(dependencies.size).toBe(3)
    })

    it('handles mixed fragment and non-fragment arrays', () => {
      const data = { post: { __id: 'post_456' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // post_456.comments has both fragment ref and regular object
      expect(proxy.post.comments[0].text).toBe('Nice work!') // Fragment
      expect(proxy.post.comments[1].text).toBe('Great post!') // Regular object
      expect(proxy.post.comments[1].author).toBe('Alice')
      
      expect(dependencies.has('post_456')).toBe(true)
      expect(dependencies.has('comment_789')).toBe(true)
      expect(dependencies.size).toBe(2)
    })

    it('throws error for missing fragments', () => {
      const data = { user: { __id: 'missing_user' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(() => proxy.user).toThrow('Fragment with id "missing_user" not found')
    })
  })

  describe('array methods', () => {
    it('supports array getter methods with primitives', () => {
      const data = ['apple', 'banana', 'cherry', 'date']
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.map(item => item.toUpperCase())).toEqual(['APPLE', 'BANANA', 'CHERRY', 'DATE'])
      expect(proxy.filter(item => item.includes('a'))).toEqual(['apple', 'banana', 'date'])
      expect(proxy.find(item => item === 'cherry')).toBe('cherry')
      expect(proxy.findIndex(item => item === 'banana')).toBe(1)
      expect(proxy.some(item => item.startsWith('c'))).toBe(true)
      expect(proxy.every(item => typeof item === 'string')).toBe(true)
      expect(proxy.includes('apple')).toBe(true)
      expect(proxy.indexOf('banana')).toBe(1)
      expect(proxy.slice(1, 3)).toEqual(['banana', 'cherry'])
      expect(proxy.join(', ')).toBe('apple, banana, cherry, date')
    })

    it('supports array methods with objects', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
      ]
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      const names = proxy.map(person => person.name)
      expect(names).toEqual(['Alice', 'Bob', 'Charlie'])
      
      const adults = proxy.filter(person => person.age >= 30)
      expect(adults).toHaveLength(2)
      expect(adults[0].name).toBe('Alice')
      expect(adults[1].name).toBe('Charlie')
      
      const bob = proxy.find(person => person.name === 'Bob')
      expect(bob.age).toBe(25)
      
      const totalAge = proxy.reduce((sum, person) => sum + person.age, 0)
      expect(totalAge).toBe(90)
    })

    it('supports array methods with fragment references', () => {
      const data = {
        posts: [
          { __id: 'post_456' },
          { title: 'Regular Post', views: 75 }
        ]
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      const titles = proxy.posts.map(post => post.title)
      expect(titles).toEqual(['Hello World', 'Regular Post'])
      
      const highViewPosts = proxy.posts.filter(post => post.views > 50)
      expect(highViewPosts).toHaveLength(2)
      expect(highViewPosts[0].title).toBe('Hello World')
      
      const firstPost = proxy.posts.find(post => post.title === 'Hello World')
      expect(firstPost.content).toBe('This is a test post')
      expect(firstPost.author.name).toBe('John Doe')
      
      // Verify dependencies were tracked
      expect(dependencies.has('post_456')).toBe(true)
      expect(dependencies.has('user_123')).toBe(true)
    })

    it('returns proxied arrays from array methods', () => {
      const data = {
        category: { __id: 'category_101' }
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // category_101.posts contains fragment references
      const posts = proxy.category.posts.filter(post => post.views > 100)
      expect(posts).toHaveLength(2) // post_456 (via fragment) + regular post
      
      // Access fragment data from filtered result
      expect(posts[0].title).toBe('Hello World')
      expect(posts[0].author.name).toBe('John Doe')
      expect(posts[1].title).toBe('Another Tech Post')
    })

    it('supports iterator methods', () => {
      const data = ['a', 'b', 'c']
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      const result = []
      for (const item of proxy) {
        result.push(item)
      }
      expect(result).toEqual(['a', 'b', 'c'])
      
      expect(Array.from(proxy.keys())).toEqual([0, 1, 2])
      expect(Array.from(proxy.values())).toEqual(['a', 'b', 'c'])
      expect(Array.from(proxy.entries())).toEqual([[0, 'a'], [1, 'b'], [2, 'c']])
    })
  })

  describe('mutation prevention', () => {
    it('prevents object property mutations', () => {
      const data = { title: 'Page Title', count: 42 }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(() => proxy.title = 'New Title').toThrow('Cannot mutate proxy object. Use Redux actions to update state.')
      expect(() => delete proxy.count).toThrow('Cannot delete properties on proxy object. Use Redux actions to update state.')
      expect(() => Object.defineProperty(proxy, 'newProp', { value: 'test' }))
        .toThrow('Cannot define properties on proxy object. Use Redux actions to update state.')
    })

    it('prevents array direct mutations', () => {
      const data = ['item1', 'item2']
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(() => proxy[0] = 'new item').toThrow('Cannot mutate proxy array. Use Redux actions to update state.')
      expect(() => delete proxy[0]).toThrow('Cannot delete properties on proxy array. Use Redux actions to update state.')
      expect(() => Object.defineProperty(proxy, '2', { value: 'test' }))
        .toThrow('Cannot define properties on proxy array. Use Redux actions to update state.')
    })

    it('prevents array method mutations', () => {
      const data = ['item1', 'item2']
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(() => proxy.push('new item')).toThrow('Cannot mutate proxy array. Use Redux actions to update state.')
      expect(() => proxy.pop()).toThrow('Cannot mutate proxy array. Use Redux actions to update state.')
      expect(() => proxy.unshift('first')).toThrow('Cannot mutate proxy array. Use Redux actions to update state.')
      expect(() => proxy.shift()).toThrow('Cannot mutate proxy array. Use Redux actions to update state.')
      expect(() => proxy.splice(0, 1)).toThrow('Cannot mutate proxy array. Use Redux actions to update state.')
      expect(() => proxy.sort()).toThrow('Cannot mutate proxy array. Use Redux actions to update state.')
    })

    it('prevents mutations on nested objects', () => {
      const data = {
        user: {
          name: 'John',
          settings: { theme: 'dark' }
        }
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(() => proxy.user.name = 'Jane').toThrow('Cannot mutate proxy object')
      expect(() => proxy.user.settings.theme = 'light').toThrow('Cannot mutate proxy object')
      expect(() => delete proxy.user.settings).toThrow('Cannot delete properties on proxy object')
    })

    it('prevents mutations on resolved fragments', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(() => proxy.user.name = 'Jane').toThrow('Cannot mutate proxy object')
      expect(() => proxy.user.profile.bio = 'New bio').toThrow('Cannot mutate proxy object')
      expect(() => delete proxy.user.email).toThrow('Cannot delete properties on proxy object')
    })
  })

  describe('proxy caching', () => {
    it('returns same proxy instance for same object', () => {
      const data = { title: 'Page Title' }
      
      const proxy1 = createProxy(data, fragments, dependencies, proxyCache)
      const proxy2 = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy1).toBe(proxy2)
    })

    it('returns same proxy for nested objects', () => {
      const data = {
        user: { name: 'John' },
        meta: { user: { name: 'John' } } // Same nested object
      }
      
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // If they reference the same object, proxies should be the same
      if (data.user === data.meta.user) {
        expect(proxy.user).toBe(proxy.meta.user)
      }
    })

    it('caches array proxies', () => {
      const sharedArray = ['item1', 'item2']
      const data = {
        list1: sharedArray,
        list2: sharedArray
      }
      
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.list1).toBe(proxy.list2)
    })

    it('uses provided proxyCache instance', () => {
      const customCache = new WeakMap()
      const data = { title: 'Test' }
      
      const proxy1 = createProxy(data, fragments, dependencies, customCache)
      const proxy2 = createProxy(data, fragments, dependencies, customCache)
      
      expect(proxy1).toBe(proxy2)
      expect(customCache.has(data)).toBe(true)
    })
  })

  describe('unproxy functionality', () => {
    it('returns original data for proxied objects', () => {
      const originalData = { title: 'Page Title', count: 42 }
      const proxy = createProxy(originalData, fragments, dependencies, proxyCache)
      
      const unproxied = unproxy(proxy)
      expect(unproxied).toBe(originalData)
      expect(unproxied.title).toBe('Page Title')
      expect(unproxied.count).toBe(42)
    })

    it('returns original data for proxied arrays', () => {
      const originalArray = ['item1', 'item2', 'item3']
      const proxy = createProxy(originalArray, fragments, dependencies, proxyCache)
      
      const unproxied = unproxy(proxy)
      expect(unproxied).toBe(originalArray)
      expect(unproxied).toEqual(['item1', 'item2', 'item3'])
    })

    it('returns original data for nested proxied objects', () => {
      const originalData = {
        user: { name: 'John', age: 30 },
        posts: [{ title: 'Post 1' }, { title: 'Post 2' }]
      }
      const proxy = createProxy(originalData, fragments, dependencies, proxyCache)
      
      // Unproxy nested objects
      const unproxiedUser = unproxy(proxy.user)
      const unproxiedPosts = unproxy(proxy.posts)
      
      expect(unproxiedUser).toBe(originalData.user)
      expect(unproxiedPosts).toBe(originalData.posts)
    })

    it('returns value unchanged if not a proxy', () => {
      const regularObject = { name: 'John' }
      const primitiveValue = 'hello'
      
      expect(unproxy(regularObject)).toBe(regularObject)
      expect(unproxy(primitiveValue)).toBe(primitiveValue)
      expect(unproxy(null)).toBe(null)
      expect(unproxy(undefined)).toBe(undefined)
    })

    it('works with fragment data', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Access the fragment to create its proxy
      const userProxy = proxy.user
      expect(userProxy.name).toBe('John Doe')
      
      // Unproxy should return the original fragment data
      const unproxiedUser = unproxy(userProxy)
      expect(unproxiedUser).toBe(fragments.user_123)
    })
  })

  describe('toRef functionality', () => {
    it('returns fragment reference for resolved fragment data', () => {
      const data = { user: { __id: 'user_123' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Access the fragment to resolve it
      const userProxy = proxy.user
      expect(userProxy.name).toBe('John Doe')
      
      // toRef should return the original fragment reference
      const userRef = toRef(userProxy)
      expect(userRef).toEqual({ __id: 'user_123' })
    })

    it('works with nested resolved fragments', () => {
      const data = { post: { __id: 'post_456' } }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Access nested fragment chain: post -> author
      const authorProxy = proxy.post.author
      expect(authorProxy.name).toBe('John Doe')
      
      // toRef should return the author fragment reference
      const authorRef = toRef(authorProxy)
      expect(authorRef).toEqual({ __id: 'user_123' })
    })

    it('works with fragments in arrays', () => {
      const data = {
        posts: [
          { __id: 'post_456' },
          { __id: 'post_789' }
        ]
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Access array fragment elements
      const firstPost = proxy.posts[0]
      const secondPost = proxy.posts[1]
      
      expect(firstPost.title).toBe('Hello World')
      expect(secondPost.title).toBe('Another Post')
      
      // toRef should return correct references
      const firstRef = toRef(firstPost)
      const secondRef = toRef(secondPost)
      
      expect(firstRef).toEqual({ __id: 'post_456' })
      expect(secondRef).toEqual({ __id: 'post_789' })
    })

    it('works with directly accessed fragments from arrays', () => {
      const data = {
        category: { __id: 'category_101' }
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Access fragments directly from array
      const allPosts = proxy.category.posts
      const firstPost = allPosts[0]  // This is a fragment (post_456)
      const secondPost = allPosts[1]  // This is a regular object
      
      expect(firstPost.title).toBe('Hello World')
      expect(secondPost.title).toBe('Another Tech Post')
      
      // toRef should work on fragments accessed directly
      const firstRef = toRef(firstPost)
      expect(firstRef).toEqual({ __id: 'post_456' })
      
      // toRef should throw for non-fragments
      expect(() => toRef(secondPost)).toThrow('Cannot convert to fragment reference')
    })

    it('throws error for non-fragment data', () => {
      const regularObject = { name: 'John', age: 30 }
      
      expect(() => toRef(regularObject)).toThrow('Cannot convert to fragment reference: data was not resolved from a fragment')
    })

    it('throws error for primitive values', () => {
      expect(() => toRef('string')).toThrow('Cannot convert to fragment reference: data was not resolved from a fragment')
      expect(() => toRef(42)).toThrow('Cannot convert to fragment reference: data was not resolved from a fragment')
      expect(() => toRef(null)).toThrow('Cannot convert to fragment reference: data was not resolved from a fragment')
    })

    it('round trip: fragment reference → resolved data → fragment reference', () => {
      const originalRef = { __id: 'user_123' }
      const data = { user: originalRef }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Resolve fragment
      const resolvedUser = proxy.user
      expect(resolvedUser.name).toBe('John Doe')
      
      // Convert back to reference
      const backToRef = toRef(resolvedUser)
      expect(backToRef).toEqual(originalRef)
      expect(backToRef).toBe(originalRef) // Should be same object reference
    })

    it('works with complex nested structures', () => {
      const data = {
        page: {
          author: { __id: 'user_123' },
          posts: [
            { __id: 'post_456' },
            { title: 'Regular Post', id: 999 }
          ]
        }
      }
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // Access various nested fragments
      const author = proxy.page.author
      const firstPost = proxy.page.posts[0]
      const secondPost = proxy.page.posts[1] // Regular object, not fragment
      
      // toRef should work for fragments
      expect(toRef(author)).toEqual({ __id: 'user_123' })
      expect(toRef(firstPost)).toEqual({ __id: 'post_456' })
      
      // toRef should throw for non-fragments
      expect(() => toRef(secondPost)).toThrow('Cannot convert to fragment reference')
    })
  })

  describe('dependency tracking isolation', () => {
    it('tracks dependencies independently per dependency set', () => {
      const data1 = { user: { __id: 'user_123' } }
      const data2 = { post: { __id: 'post_456' } }
      
      const deps1 = new Set()
      const deps2 = new Set()
      const cache1 = new WeakMap()
      const cache2 = new WeakMap()
      
      const proxy1 = createProxy(data1, fragments, deps1, cache1)
      const proxy2 = createProxy(data2, fragments, deps2, cache2)
      
      // Access different fragments
      proxy1.user.name    // Should track user_123 in deps1
      proxy2.post.title   // Should track post_456 in deps2
      
      expect(deps1.has('user_123')).toBe(true)
      expect(deps1.has('post_456')).toBe(false)
      
      expect(deps2.has('post_456')).toBe(true)
      expect(deps2.has('user_123')).toBe(false)
    })

    it('tracks chained dependencies correctly', () => {
      const data = { post: { __id: 'post_456' } }
      const deps = new Set()
      const cache = new WeakMap()
      
      const proxy = createProxy(data, fragments, deps, cache)
      
      // Access chained fragments: post -> author -> profile
      const authorBio = proxy.post.author.profile.bio
      expect(authorBio).toBe('Software engineer')
      
      // Should track both fragments in the chain
      expect(deps.has('post_456')).toBe(true)
      expect(deps.has('user_123')).toBe(true)
      expect(deps.size).toBe(2)
    })
  })

  describe('complex real-world scenarios', () => {
    it('handles deeply nested mixed data structures', () => {
      const complexData = {
        page: {
          title: 'Dashboard',
          user: { __id: 'user_123' },
          sections: [
            {
              name: 'Posts',
              items: [
                { __id: 'post_456' },
                { title: 'Draft Post', status: 'draft' }
              ]
            },
            {
              name: 'Categories',
              items: [
                { __id: 'category_101' }
              ]
            }
          ],
          metadata: {
            created: '2023-01-01',
            lastModified: '2023-12-01',
            author: { __id: 'user_123' }
          }
        }
      }
      
      const proxy = createProxy(complexData, fragments, dependencies, proxyCache)
      
      // Test various access paths
      expect(proxy.page.title).toBe('Dashboard')
      expect(proxy.page.user.name).toBe('John Doe')
      expect(proxy.page.sections[0].items[0].title).toBe('Hello World')
      expect(proxy.page.sections[0].items[0].author.email).toBe('john@example.com')
      expect(proxy.page.sections[0].items[1].title).toBe('Draft Post')
      expect(proxy.page.sections[1].items[0].name).toBe('Technology')
      expect(proxy.page.metadata.author.profile.bio).toBe('Software engineer')
      
      // Verify all fragments were tracked
      expect(dependencies.has('user_123')).toBe(true)
      expect(dependencies.has('post_456')).toBe(true)
      expect(dependencies.has('category_101')).toBe(true)
    })

    it('handles circular fragment references gracefully', () => {
      const circularFragments = {
        user_a: {
          name: 'Alice',
          friend: { __id: 'user_b' }
        },
        user_b: {
          name: 'Bob',
          friend: { __id: 'user_a' }
        }
      }
      
      const data = { user: { __id: 'user_a' } }
      const proxy = createProxy(data, circularFragments, dependencies, proxyCache)
      
      expect(proxy.user.name).toBe('Alice')
      expect(proxy.user.friend.name).toBe('Bob')
      expect(proxy.user.friend.friend.name).toBe('Alice')
      
      expect(dependencies.has('user_a')).toBe(true)
      expect(dependencies.has('user_b')).toBe(true)
    })

    it('handles arrays with mixed fragment types', () => {
      const data = {
        feed: [
          { __id: 'user_123' },
          { __id: 'post_456' },
          { __id: 'comment_789' },
          { type: 'ad', content: 'Buy our product!' },
          42,
          'string item'
        ]
      }
      
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.feed[0].name).toBe('John Doe')
      expect(proxy.feed[1].title).toBe('Hello World')
      expect(proxy.feed[2].text).toBe('Nice work!')
      expect(proxy.feed[3].content).toBe('Buy our product!')
      expect(proxy.feed[4]).toBe(42)
      expect(proxy.feed[5]).toBe('string item')
      
      expect(dependencies.has('user_123')).toBe(true)
      expect(dependencies.has('post_456')).toBe(true)
      expect(dependencies.has('comment_789')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles empty objects and arrays', () => {
      const data = {
        emptyObj: {},
        emptyArray: [],
        nested: {
          emptyObj: {},
          emptyArray: []
        }
      }
      
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.emptyObj).toEqual({})
      expect(proxy.emptyArray).toEqual([])
      expect(proxy.emptyArray.length).toBe(0)
      expect(proxy.nested.emptyObj).toEqual({})
      expect(proxy.nested.emptyArray).toEqual([])
    })

    it('handles null and undefined values in objects', () => {
      const data = {
        nullValue: null,
        undefinedValue: undefined,
        nested: {
          alsoNull: null,
          alsoUndefined: undefined
        }
      }
      
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.nullValue).toBe(null)
      expect(proxy.undefinedValue).toBe(undefined)
      expect(proxy.nested.alsoNull).toBe(null)
      expect(proxy.nested.alsoUndefined).toBe(undefined)
    })

    it('handles fragment references with invalid __id types', () => {
      const data = {
        invalidRef1: { __id: null },
        invalidRef2: { __id: 123 },
        invalidRef3: { __id: true }
      }
      
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      // These should be treated as regular objects, not fragment references
      expect(proxy.invalidRef1.__id).toBe(null)
      expect(proxy.invalidRef2.__id).toBe(123)
      expect(proxy.invalidRef3.__id).toBe(true)
      expect(dependencies.size).toBe(0)
    })

    it('handles very large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item${i}` }))
      const data = { items: largeArray }
      
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy.items.length).toBe(1000)
      expect(proxy.items[0].value).toBe('item0')
      expect(proxy.items[999].value).toBe('item999')
      
      // Test array methods on large arrays
      const filtered = proxy.items.filter(item => item.id % 100 === 0)
      expect(filtered).toHaveLength(10)
      expect(filtered[0].id).toBe(0)
      expect(filtered[9].id).toBe(900)
    })

    it('preserves array bounds checking', () => {
      const data = ['a', 'b', 'c']
      const proxy = createProxy(data, fragments, dependencies, proxyCache)
      
      expect(proxy[0]).toBe('a')
      expect(proxy[2]).toBe('c')
      expect(proxy[3]).toBe(undefined)
      expect(proxy[-1]).toBe(undefined)
      expect(proxy[100]).toBe(undefined)
    })
  })
})