import { useSelector } from 'react-redux'
import { JSONMappable, Page, RootState, SuperglueState } from '../types'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}

/**
 * A lightweight hook that grabs the current page from the store.
 */
export function usePage<T = JSONMappable>() {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  return useSelector<RootState<T>, Page<T>>(
    (state) => state.pages[currentPageKey]
  )
}

/**
 * A lightweight hook that grabs the current page from the store.
 */
export function useContent<T = JSONMappable>() {
  return usePage<T>().data
}
