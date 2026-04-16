import { renderHook, act } from '@testing-library/react'
import { useUpdateContent } from '../../lib/hooks/useUpdateContent'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'

const buildStore = (preloadedState) => {
  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
    },
  })
}

describe('useUpdateContent', () => {
  it('should update page data', () => {
    const store = buildStore({
      superglue: { currentPageKey: '/page' },
      pages: {
        '/page': {
          data: { title: 'Hello', flash: 'Success' },
        },
      },
      fragments: {},
    })

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useUpdateContent(), { wrapper })

    act(() => {
      result.current('/page', (draft) => {
        draft.flash = null
      })
    })

    const updatedState = store.getState()
    expect(updatedState.pages['/page'].data).toEqual({
      title: 'Hello',
      flash: null,
    })
  })

  it('should handle nested updates', () => {
    const store = buildStore({
      superglue: { currentPageKey: '/page' },
      pages: {
        '/page': {
          data: {
            filters: { category: 'all', sort: 'date' },
          },
        },
      },
      fragments: {},
    })

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useUpdateContent(), { wrapper })

    act(() => {
      result.current('/page', (draft) => {
        draft.filters.category = 'electronics'
      })
    })

    const updatedState = store.getState()
    expect(updatedState.pages['/page'].data.filters).toEqual({
      category: 'electronics',
      sort: 'date',
    })
  })

  it('should update a different page than current', () => {
    const store = buildStore({
      superglue: { currentPageKey: '/page' },
      pages: {
        '/page': { data: { title: 'Current' } },
        '/other': { data: { title: 'Other', count: 0 } },
      },
      fragments: {},
    })

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useUpdateContent(), { wrapper })

    act(() => {
      result.current('/other', (draft) => {
        draft.count = 5
      })
    })

    expect(store.getState().pages['/other'].data.count).toBe(5)
    expect(store.getState().pages['/page'].data.title).toBe('Current')
  })

  it('should throw for non-existent page', () => {
    const store = buildStore({
      superglue: { currentPageKey: '/page' },
      pages: {},
      fragments: {},
    })

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useUpdateContent(), { wrapper })

    expect(() => {
      act(() => {
        result.current('/missing', (draft) => {})
      })
    }).toThrow('Page with key "/missing" not found')
  })

  it('should dispatch updateContent action', () => {
    const store = buildStore({
      superglue: { currentPageKey: '/page' },
      pages: {
        '/page': { data: { name: 'John' } },
      },
      fragments: {},
    })
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useUpdateContent(), { wrapper })

    act(() => {
      result.current('/page', (draft) => {
        draft.name = 'Jane'
      })
    })

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: '@@superglue/UPDATE_CONTENT',
      payload: {
        pageKey: '/page',
        data: { name: 'Jane' },
      },
    })
  })
})
