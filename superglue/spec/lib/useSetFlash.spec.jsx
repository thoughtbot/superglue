import { renderHook, act } from '@testing-library/react'
import { useSetFlash } from '../../lib'
import { flashReducer } from '../../lib/reducers'
import { describe, it } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

describe('useSetFlash', () => {
  function createStoreAndWrapper(initialFlash = {}) {
    const store = configureStore({
      preloadedState: { flash: initialFlash },
      reducer: { flash: flashReducer },
    })
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
    return { store, wrapper }
  }

  it('sets flash messages', () => {
    const { store, wrapper } = createStoreAndWrapper()
    const { result } = renderHook(() => useSetFlash(), { wrapper })

    act(() => {
      result.current.setFlash({ notice: 'Saved!' })
    })

    expect(store.getState().flash).toEqual({ notice: 'Saved!' })
  })

  it('merges flash messages', () => {
    const { store, wrapper } = createStoreAndWrapper({ notice: 'Existing' })
    const { result } = renderHook(() => useSetFlash(), { wrapper })

    act(() => {
      result.current.setFlash({ alert: 'Error!' })
    })

    expect(store.getState().flash).toEqual({
      notice: 'Existing',
      alert: 'Error!',
    })
  })

  it('clears a specific flash key', () => {
    const { store, wrapper } = createStoreAndWrapper({
      notice: 'Hello',
      alert: 'Danger',
    })
    const { result } = renderHook(() => useSetFlash(), { wrapper })

    act(() => {
      result.current.clearFlash('notice')
    })

    expect(store.getState().flash).toEqual({ alert: 'Danger' })
  })

  it('clears all flash when no key is given', () => {
    const { store, wrapper } = createStoreAndWrapper({
      notice: 'Hello',
      alert: 'Danger',
    })
    const { result } = renderHook(() => useSetFlash(), { wrapper })

    act(() => {
      result.current.clearFlash()
    })

    expect(store.getState().flash).toEqual({})
  })
})
