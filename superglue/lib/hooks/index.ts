import { useSelector } from 'react-redux'
import { JSONMappable, Page, RootState, SuperglueState } from '../types'

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

/**
 * A lightweight hook that grabs a fragment
 */
export function useFragment<T>(fragmentRef: string | { __id: string }): T {
  let fragmentKey
  if (typeof fragmentRef === 'string') {
    fragmentKey = fragmentRef
  } else {
    fragmentKey = fragmentRef.__id
  }

  return useSelector<RootState<T>, T>(
    (state) => state.fragments[fragmentKey] as T
  )
}
