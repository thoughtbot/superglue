import { useDispatch, useSelector } from 'react-redux'
import { produce, Draft } from 'immer'
import { saveFragment } from '../actions'
import { RootState, Fragment, FragmentRef } from '../types'

type Unpack<T> = T extends Fragment<infer U> ? U : never

type FragmentData<T> = T extends Fragment<unknown>
  ? FragmentRef
  : T extends (infer Item)[]
  ? FragmentData<Item>[]
  : T extends object
  ? { [K in keyof T]: FragmentData<T[K]> }
  : T

export function useSetFragment() {
  const dispatch = useDispatch()
  const fragments = useSelector((state: RootState) => state.fragments)

  function setter<T extends Fragment<unknown>>(
    fragmentRef: T,
    updater: (draft: Draft<FragmentData<Unpack<T>>>) => void
  ): void
  function setter<T = unknown>(
    fragmentId: string,
    updater: (draft: Draft<T>) => void
  ): void
  function setter(
    fragmentRefOrId: Fragment<unknown> | string,
    updater: (draft: Draft<unknown>) => void
  ): void {
    const fragmentId =
      typeof fragmentRefOrId === 'string'
        ? fragmentRefOrId
        : fragmentRefOrId.__id

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

  return setter
}
