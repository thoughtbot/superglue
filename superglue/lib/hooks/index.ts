import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, SuperglueState, FlashState } from '../types'
import {
  flash as flashAction,
  clearFlash as clearFlashAction,
} from '../actions'
export { useContent, unproxy } from './useContent'
export { useFragment, toFragmentRef } from './useFragment'
export { useUpdateFragment } from './useUpdateFragment'
export { useUpdateContent } from './useUpdateContent'
export { useStreamSource } from './useStreamSource'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}

/**
 * A hook that returns the current flash state from the store.
 * Flash is cleared automatically on every visit.
 *
 * Pass a type parameter to narrow the flash shape:
 *
 * ```ts
 * const flash = useFlash<{ notice?: string; alert?: string }>()
 * ```
 */
export function useFlash<T = FlashState>(): T {
  return useSelector<RootState, T>((state) => state.flash as T)
}

/**
 * A hook that returns functions to set and clear flash messages
 * on the client side.
 *
 * ```ts
 * const { setFlash, clearFlash } = useSetFlash()
 *
 * setFlash({ notice: 'Saved!' })
 * clearFlash('notice')
 * clearFlash() // clears all
 * ```
 */
export function useSetFlash() {
  const dispatch = useDispatch()

  const setFlash = useCallback(
    (flash: FlashState) => {
      dispatch(flashAction({ flash }))
    },
    [dispatch]
  )

  const clearFlash = useCallback(
    (key?: string) => {
      dispatch(clearFlashAction({ key }))
    },
    [dispatch]
  )

  return { setFlash, clearFlash }
}
