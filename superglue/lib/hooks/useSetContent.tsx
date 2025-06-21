import { useDispatch, useSelector } from 'react-redux'
import { produce } from 'immer'
import { saveFragment } from '../actions'
import { RootState } from '../types'

export function useSetContent() {
  const dispatch = useDispatch()
  const fragments = useSelector((state: RootState) => state.fragments)

  return function setter(
    fragmentRef: { __id: string },
    updater: (draft: unknown) => void
  ): void {
    if (!fragmentRef || typeof fragmentRef.__id !== 'string') {
      throw new Error(
        'Invalid fragment reference: must have __id string property'
      )
    }

    // Get current fragment data from Redux store
    const currentFragment = fragments[fragmentRef.__id]

    if (currentFragment === undefined) {
      throw new Error(`Fragment with id "${fragmentRef.__id}" not found`)
    }

    // Create new state with Immer
    const updatedFragment = produce(currentFragment, updater)

    // Dispatch Redux action to update fragment
    dispatch(
      saveFragment({
        fragmentKey: fragmentRef.__id,
        fragment: updatedFragment,
      })
    )
  }
}
