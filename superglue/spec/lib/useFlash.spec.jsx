import { renderHook } from '@testing-library/react'
import { useFlash } from '../../lib'
import { describe, it } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

describe('useFlash', () => {
  it('returns the flash state', () => {
    const preloadedState = {
      flash: { notice: 'Hello' },
    }

    let store = configureStore({
      preloadedState,
      reducer: (state) => state,
    })
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useFlash(), { wrapper })

    expect(result.current).toEqual({ notice: 'Hello' })
  })
})
