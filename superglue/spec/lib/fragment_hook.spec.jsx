import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useFragment } from '../../lib'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { fragmentReducer } from '../../lib/reducers'

describe('hooks', () => {
  describe('useFragment', () => {
    it('returns fragment data and setter function', () => {
      const preloadedState = {
        fragments: {
          'post-1': {
            title: 'My First Blog Post',
          }
        }
      }

      const store = configureStore({
        preloadedState,
        reducer: {fragments: fragmentReducer},
      })

      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useFragment('post-1'), { wrapper })

      expect(result.current[0]).toEqual({
        title: 'My First Blog Post'
      })
      expect(typeof result.current[1]).toBe('function')
    })

    it('returns undefined for non-existent fragment', () => {
      const preloadedState = {
        fragments: {}
      }

      const store = configureStore({
        preloadedState,
        reducer: {fragments: fragmentReducer},
      })

      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useFragment('user-profile-999'), { wrapper })

      expect(result.current[0]).toBeUndefined()
      expect(typeof result.current[1]).toBe('function')
    })

    it('accepts object reference with __id property', () => {
      const preloadedState = {
        fragments: {
          'post-1': {
            title: 'This is a great article!',
          }
        }
      }

      const store = configureStore({
        preloadedState,
        reducer: {fragments: fragmentReducer},
      })

      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )

      const fragmentRef = { __id: 'post-1' }
      const { result } = renderHook(() => useFragment(fragmentRef), { wrapper })
      expect(result.current[0]).toEqual({
        title: 'This is a great article!',
      })
    })

    it('updates fragment using draft mutation', () => {
      const preloadedState = {
        fragments: {
          'shopping-cart': {
            items: [
              { id: 1, name: 'Laptop', price: 10 },
            ],
            discounts: {
              total: 10
            }
          }
        }
      }

      const store = configureStore({
        preloadedState,
        reducer: {fragments: fragmentReducer},
      })

      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useFragment('shopping-cart'), { wrapper })

      act(() => {
        const [, setFragment] = result.current
        setFragment((draft) => {
          draft.items.push({ id: 2, name: 'Keyboard', price: 5 })
        })
      })

      const cart = store.getState().fragments['shopping-cart']
      expect(cart).toEqual({
        items: [
          { id: 1, name: 'Laptop', price: 10},
          { id: 2, name: 'Keyboard', price: 5}
        ],
        discounts: {
          total: 10
        }
      })
      expect(cart.discounts).toBe(preloadedState.fragments['shopping-cart'].discounts)
    })

    it('updates fragment by returning new draft', () => {
      const preloadedState = {
        fragments: {
          'user': {
            name: 'John Smith',
            language: 'en',
            address: {
              zip: "11222"
            }
          }
        }
      }

      const store = configureStore({
        preloadedState,
        reducer: {fragments: fragmentReducer},
      })

      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useFragment('user'), { wrapper })

      act(() => {
        const [, setFragment] = result.current
        setFragment(() => {
          return { 
            name: 'Jimmy Smith', 
            language: 'es', 
            address: {
              zip: "11222"
            }
          }
        })
      })
      const user = store.getState().fragments['user']

      expect(user).toEqual({
        name: 'Jimmy Smith', 
        language: 'es', 
        address: {
          zip: "11222"
        }
      })

      expect(user.address).not.toBe(preloadedState.fragments.user.address)
    })

    it('warns and does not dispatch when fragment is undefined', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const preloadedState = {
        fragments: {}
      }

      const store = configureStore({
        preloadedState,
        reducer: {fragments: fragmentReducer},
      })

      const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useFragment('does-not-exist'), { wrapper })

      act(() => {
        const [, setFragment] = result.current
        setFragment((draft) => {
          draft.title = 'New Draft Title'
          draft.published = false
        })
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        "Fragment 'does-not-exist' is undefined. Cannot apply update."
      )
      expect(store.getState().fragments).toEqual({})
    })
  })
})