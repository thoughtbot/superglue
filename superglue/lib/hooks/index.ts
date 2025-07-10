import { useSelector } from 'react-redux'
import { RootState, SuperglueState } from '../types'
export { useFragment } from './useFragment'
export { useContent, unproxy } from './useContent'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}
