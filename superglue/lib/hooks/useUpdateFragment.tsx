import { useDispatch, useSelector } from 'react-redux'
import { Immer } from 'immer'
import { updateFragment } from '../actions'
import { RootState, Fragment, FragmentRef } from '../types'
import { Unproxy } from '../types'

const immer = new Immer()
immer.setAutoFreeze(false)

/**
 * Utility type to extract the data type from a Fragment wrapper
 * @public
 */
export type Unpack<T> = T extends Fragment<infer U, unknown> ? U : never

/**
 * Hook for mutating fragments using Immer drafts.
 *
 * @example
 * ```tsx
 * const update = useUpdateFragment()
 *
 * // Update via fragment reference
 * update(userRef, draft => {
 *   draft.name = "Updated Name"
 *   draft.email = "new@email.com"
 * })
 *
 * // Update via fragment ID directly
 * update('user_123', draft => {
 *   draft.profile.bio = "Updated bio"
 * })
 * ```
 *
 */
export function useUpdateFragment() {
  const dispatch = useDispatch()
  const fragments = useSelector((state: RootState) => state.fragments)

  /**
   * Updates a fragment using a {@link Fragment} object.
   *
   * @param fragment - Fragment object from proxied content
   * @param updater - Immer draft function for mutating fragment data
   */
  function setter<T extends Fragment<unknown, true>>(
    fragment: T,
    updater: (draft: Unproxy<Unpack<T>>) => void
  ): void

  /**
   * Updates a fragment using a {@link FragmentRef} object.
   *
   * @param fragmentRef - Fragment reference from unproxied content
   * @param updater - Immer draft function for mutating fragment data
   */
  function setter<T, P extends boolean>(
    fragmentRef: FragmentRef<T, P>,
    updater: (draft: Unproxy<T>) => void
  ): void

  function setter(
    fragmentRefOrId: Fragment<unknown, true> | FragmentRef<unknown, true>,
    updater: (draft: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  ): void {
    const fragmentId = fragmentRefOrId.__id

    const currentFragment = fragments[fragmentId]

    if (currentFragment === undefined) {
      throw new Error(`Fragment with id "${fragmentId}" not found`)
    }

    const updatedFragment = immer.produce(currentFragment, updater)

    dispatch(
      updateFragment({
        fragmentId: fragmentId,
        data: updatedFragment,
      })
    )
  }

  return setter
}
