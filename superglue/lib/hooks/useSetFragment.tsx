import { useDispatch, useSelector } from 'react-redux'
import { Immer } from 'immer'
import { saveFragment } from '../actions'
import { RootState, Fragment } from '../types'
import { Unproxy } from '../types'
import { FragmentProxy } from './useContent'

const immer = new Immer()
immer.setAutoFreeze(false)

/**
 * Utility type to extract the data type from a Fragment wrapper
 * @public
 */
export type Unpack<T> = T extends Fragment<infer U, unknown>
  ? U
  : T extends FragmentProxy
  ? T
  : never
/**
 * Hook for mutating fragments using Immer drafts.
 *
 * @example
 * ```tsx
 * const set = useSetFragment()
 *
 * // Update via fragment reference
 * set(userRef, draft => {
 *   draft.name = "Updated Name"
 *   draft.email = "new@email.com"
 * })
 *
 * // Update via fragment ID directly
 * set('user_123', draft => {
 *   draft.profile.bio = "Updated bio"
 * })
 * ```
 *
 */
export function useSetFragment() {
  const dispatch = useDispatch()
  const fragments = useSelector((state: RootState) => state.fragments)

  /**
   * Updates a fragment using a {@link FragmentRef} object.
   *
   * @param fragmentRef - Fragment reference object containing __id
   * @param updater - Immer draft function for mutating fragment data
   */
  function setter<T extends Fragment<unknown, unknown>>(
    fragmentRef: T,
    updater: (draft: Unproxy<Unpack<T>>) => void
  ): void

  /**
   * Updates a fragment using a fragment ID string.
   *
   * @param fragmentId - The fragment ID string
   * @param updater - Immer draft function for mutating fragment data
   */
  function setter<T = unknown>(
    fragmentId: string,
    updater: (draft: T) => void
  ): void

  function setter(
    fragmentRefOrId: Fragment<unknown, unknown> | string,
    updater: (draft: unknown) => void
  ): void {
    const fragmentId =
      typeof fragmentRefOrId === 'string'
        ? fragmentRefOrId
        : fragmentRefOrId.__id

    const currentFragment = fragments[fragmentId]

    if (currentFragment === undefined) {
      throw new Error(`Fragment with id "${fragmentId}" not found`)
    }

    const updatedFragment = immer.produce(currentFragment, updater)

    dispatch(
      saveFragment({
        fragmentId: fragmentId,
        data: updatedFragment,
      })
    )
  }

  return setter
}
