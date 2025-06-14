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
    const createTestState = () => ({
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
            heading: 'Dashboard',
            user: { __id: 'current_user' },
            bestPost: { __id: 'post_1' },
            worstPost: { __id: 'post_2' },
            posts: [
              { __id: 'post_1' },
              { __id: 'post_2' },
              { title: 'Regular post' }
            ],
            metadata: {
              theme: 'dark',
              nested: { __id: 'nested_fragment' }
            }
          },
        },
      },
      fragments: {
        current_user: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com'
        },
        post_1: {
          id: 1,
          title: 'Best Post',
          likes: 100,
          content: 'This is the best post'
        },
        post_2: {
          id: 2,
          title: 'Worst Post',
          likes: 5,
          content: 'This is the worst post'
        },
        nested_fragment: {
          value: 'nested data'
        }
      }
    })

    const createWrapper = (preloadedState) => {
      const store = configureStore({
        preloadedState,
        reducer: (state) => state,
      })
      return ({ children }) => <Provider store={store}>{children}</Provider>
    }

    it('returns the whole page when no selector is provided', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => useContentV2(), { wrapper })

      expect(result.current).toEqual(preloadedState.pages['/current?abc=123'].data)
    })

    it('resolves fragments when called with parentheses', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => 
        useContentV2(page => page.bestPost()), 
        { wrapper }
      )

      expect(result.current).toEqual({
        id: 1,
        title: 'Best Post',
        likes: 100,
        content: 'This is the best post'
      })
    })

    it('returns fragment reference when not called', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => 
        useContentV2(page => page.bestPost), 
        { wrapper }
      )

      expect(result.current.__id).toBe('post_1')
    })

    it('handles array access with fragments', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => 
        useContentV2(page => page.posts[0]()), 
        { wrapper }
      )

      expect(result.current).toEqual({
        id: 1,
        title: 'Best Post',
        likes: 100,
        content: 'This is the best post'
      })
    })

    it('handles complex expressions with multiple fragments', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => 
        useContentV2(page => page.bestPost().likes + page.worstPost().likes), 
        { wrapper }
      )

      expect(result.current).toBe(105) // 100 + 5
    })

    it('handles nested object access', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => 
        useContentV2(page => page.metadata.nested()), 
        { wrapper }
      )

      expect(result.current).toEqual({
        value: 'nested data'
      })
    })

    it('handles mixed fragment and non-fragment data', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => 
        useContentV2(page => ({
          title: page.heading,
          userName: page.user().name,
          postTitle: page.bestPost().title
        })), 
        { wrapper }
      )

      expect(result.current).toEqual({
        title: 'Dashboard',
        userName: 'John Doe',
        postTitle: 'Best Post'
      })
    })

    it('handles arrays with mixed fragment and non-fragment items', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      const { result } = renderHook(() => 
        useContentV2(page => [
          page.posts[0]().title,  // Fragment
          page.posts[2].title     // Non-fragment
        ]), 
        { wrapper }
      )

      expect(result.current).toEqual([
        'Best Post',
        'Regular post'
      ])
    })

    it('proxy scope is limited to selector function', () => {
      const preloadedState = createTestState()
      const wrapper = createWrapper(preloadedState)
      
      // This should work - proxy used within selector
      const { result: result1 } = renderHook(() => 
        useContentV2(page => page.bestPost), 
        { wrapper }
      )
      
      expect(result1.current.__id).toBe('post_1')
      
      // The returned result should not be callable
      expect(typeof result1.current).toBe('object')
      expect(typeof result1.current.call).toBe('undefined')
    })
  })
})
