import { useSelector, useStore } from 'react-redux'
import { useMemo, useRef } from 'react'
import { RootState, FragmentRef, ValidateOption } from '../types'
import { createProxy } from '../utils/proxy'

/**
 * Converts a string ID to a typed FragmentRef.
 *
 * @example
 * ```tsx
 * const author = useFragment(toFragmentRef<Author>("author_123"))
 * ```
 */
export function toFragmentRef<T, P extends boolean = false>(
  id: string
): FragmentRef<T, P> {
  return { __ref: true, __id: id }
}

/**
 * Returns a proxy for accessing a fragment's content from the store.
 *
 * Passing in a fragment reference scopes the tracking of
 * fragments to that hook usage. This is useful in performance scenarios where you
 * want a child component to update, but not the parent.
 *
 * ```js
 * import {unproxy} from '@thoughtbot/superglue'
 *
 * const content = useContent()
 * const rawContent = unproxy(content)
 *
 * <h1>{content.title}</h1>
 * <SlidingCart cartRef={rawContent.cart} />
 * ```
 *
 * then in SlidingCart
 *
 * ```js
 * const SlidingCart = (cartRef) => {
 *   const cart = useFragment(cartRef)
 * }
 * ```
 *
 * SlidingCart will update only if the fragment referenced by `cartRef` updates.
 *
 * @param fragmentRef - A typed fragment reference
 * @template T - The data type being accessed
 * @template P - Whether the fragment is guaranteed to be present
 * @returns Reactive proxy to fragment data. Returns `T` if present, `T | undefined` otherwise.
 *
 * @example
 * ```tsx
 * // Access fragment via unproxied ref
 * const rawContent = unproxy(content)
 * const user = useFragment(rawContent.user)
 *
 * // Access fragment via string ID
 * const cart = useFragment(toFragmentRef<Cart>("cart_123"))
 * ```
 */
export function useFragment<T, P extends boolean>(
  fragmentRef: FragmentRef<T, P>,
  options?: ValidateOption
): P extends true ? T : T | undefined {
  const dependencies = useRef<Set<string>>(new Set())

  const fragmentId = fragmentRef?.__id

  const sourceData = useSelector((state: RootState) => {
    return state.fragments[fragmentId]
  })

  const trackedFragments = useSelector(
    (state: RootState) => state.fragments,
    (oldFragments, newFragments) => {
      if (oldFragments === newFragments) {
        return true
      }

      return Array.from(dependencies.current).every((id: string) => {
        const prevVal = oldFragments[id]
        const nextVal = newFragments[id]
        return prevVal === nextVal
      })
    }
  )

  const store = useStore<RootState>()

  const proxy = useMemo(() => {
    const proxyCache = new WeakMap()

    if (!sourceData) {
      return undefined
    }

    const proxy = createProxy(
      sourceData,
      { current: store.getState().fragments },
      dependencies.current,
      proxyCache
    ) as T

    if (options?.validate) {
      const proxyForValidation = createProxy(
        sourceData,
        { current: store.getState().fragments },
        new Set(),
        new WeakMap()
      ) as T

      options.validate(proxyForValidation)
    }

    return proxy
  }, [sourceData, trackedFragments])

  return proxy as P extends true ? T : T | undefined
}
