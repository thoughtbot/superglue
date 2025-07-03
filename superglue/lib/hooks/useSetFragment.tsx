import { useDispatch, useSelector } from 'react-redux'
import { produce } from 'immer'
import { saveFragment } from '../actions'
import { RootState } from '../types'

export function useSetFragment() {
  const dispatch = useDispatch()
  const fragments = useSelector((state: RootState) => state.fragments)

  return function setter(
    fragmentRef: { __id: string } | string,
    updater: (draft: unknown) => void
  ): void {
    const fragmentId =
      typeof fragmentRef === 'string' ? fragmentRef : fragmentRef.__id

    const currentFragment = fragments[fragmentId]

    if (currentFragment === undefined) {
      throw new Error(`Fragment with id "${fragmentId}" not found`)
    }

    const updatedFragment = produce(currentFragment, updater)

    dispatch(
      saveFragment({
        fragmentId: fragmentId,
        data: updatedFragment,
      })
    )
  }
}
