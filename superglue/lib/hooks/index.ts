import { useSelector } from 'react-redux'
import { JSONMappable, Page, RootState, SuperglueState } from '../types'
export { useFragment } from './useFragment'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}

/**
 * A lightweight hook that grabs the current page's content from the store.
 */
export function useContent<T = JSONMappable>() {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  return useSelector<RootState<T>, Page<T>>(
    (state) => state.pages[currentPageKey]
  ).data
}
