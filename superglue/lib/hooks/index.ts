import { useSelector } from 'react-redux'
import { RootState, SuperglueState } from '../types'
export { useContent, unproxy } from './useContent'
export { useSetFragment } from './useSetFragment'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}
