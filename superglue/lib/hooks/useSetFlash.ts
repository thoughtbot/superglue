import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { FlashState } from '../types'
import {
  flash as flashAction,
  clearFlash as clearFlashAction,
} from '../actions'

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
