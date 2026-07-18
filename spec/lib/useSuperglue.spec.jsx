import { renderHook } from '@testing-library/react'
import { useSuperglue } from '../../lib'
import { describe, it } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

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
