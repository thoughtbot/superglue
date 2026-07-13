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
export { useFlash } from './useFlash'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
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
