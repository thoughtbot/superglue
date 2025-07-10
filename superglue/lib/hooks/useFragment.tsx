import { useDispatch, useSelector } from 'react-redux'
import { produce, Draft } from 'immer'
import { JSONMappable, RootState } from '../types'
import { saveFragment } from '../actions'

type FragmentRef = string | { __id: string }

type FragmentUpdater<T> = (draft: Draft<T>) => void | Draft<T>

type FragmentSetter<T> = {
  (updater: FragmentUpdater<T>): void
}

/**
 * A lightweight hook that grabs a fragment from Redux store
 * Returns a tuple similar to useState: [fragment, setFragment]
 */
export function useFragment<T = unknown>(
  fragmentRef: FragmentRef
): [T | undefined, FragmentSetter<T>] {
  const fragmentId =
    typeof fragmentRef === 'string' ? fragmentRef : fragmentRef.__id

  const dispatch = useDispatch()

  const fragment = useSelector<RootState, T | undefined>(
    (state) => state.fragments[fragmentId] as T
  )

  const setFragment: FragmentSetter<T> = (updater: FragmentUpdater<T>) => {
    const currentFragment = fragment
    if (currentFragment === undefined) {
      console.warn(
        `Fragment '${fragmentId}' is undefined. Cannot apply update.`
      )
      return
    }

    const updatedFragment = produce(currentFragment, updater)

    dispatch(
      saveFragment({
        fragmentId,
        data: updatedFragment as JSONMappable,
      })
    )
  }

  return [fragment, setFragment]
}
