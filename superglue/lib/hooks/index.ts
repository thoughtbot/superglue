import { useSelector } from 'react-redux'
import { RootState, SuperglueState } from '../types'
export { useContent, unproxy } from './useContent'
export { useFragment, toFragmentRef } from './useFragment'
export { useUpdateFragment } from './useUpdateFragment'
export { useUpdateContent } from './useUpdateContent'
export { useStreamSource } from './useStreamSource'
export { useFlash } from './useFlash'
export { useSetFlash } from './useSetFlash'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}
