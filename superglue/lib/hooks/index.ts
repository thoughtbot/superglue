import { useSelector } from 'react-redux'
import { Page, RootState, SuperglueState } from '../types'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}

/**
 * A lightweight hook that grabs the current page from the store.
 */
export function usePage() {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  return useSelector<RootState, Page>((state) => state.pages[currentPageKey])
}
