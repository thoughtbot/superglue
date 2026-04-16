import { useSelector } from 'react-redux'
import { RootState, SuperglueState, FlashState } from '../types'
export { useContent, unproxy } from './useContent'
export { useFragment } from './useFragment'
export { useSetFragment } from './useSetFragment'
export { useSetContent } from './useSetContent'
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
