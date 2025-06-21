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
})
