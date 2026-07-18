import { useSelector } from 'react-redux'
import { RootState, FlashState } from '../types'

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
