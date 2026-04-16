import { useSelector, useStore } from 'react-redux'
import { useMemo, useRef } from 'react'
import {
  JSONMappable,
  RootState,
  FragmentRef,
  ReceiveType,
} from '../types'
import { createProxy } from '../utils/proxy'

export type FragmentProxy = { __fragment: true }

/**
 * Union type for fragment references, accepting either FragmentRef objects or string IDs
 * @public
 */
export type FragmentRefOrId = FragmentRef | string

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
 * @param fragmentRef - A fragment reference or string ID
 * @template T - The data type being accessed (defaults to JSONMappable)
 * @returns Reactive proxy to fragment data, undefined if fragment not found
 *
 * @example
 * ```tsx
 * // Access specific fragment by reference
 * const user = useFragment({__id: 'user_123'})
 *
 * // Access specific fragment by ID string
 * const cart = useFragment('userCart')
 * ```
 */
export function useFragment<T = JSONMappable>(
  fragmentRef: FragmentRefOrId,
  __type?: ReceiveType<T>
): T | undefined {
  const dependencies = useRef<Set<string>>(new Set())

  const fragmentId =
    typeof fragmentRef === 'string' ? fragmentRef : fragmentRef?.__id

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

    if (process.env.NODE_ENV !== 'production' && __type) {
      const proxyForValidation = createProxy(
        sourceData,
        { current: store.getState().fragments },
        new Set(),
        new WeakMap()
      ) as T

      import('@deepkit/type')
        .then(({ resolveReceiveType, validate }) => {
          // @ts-expect-error - ReceiveType<T> is transformed by Deepkit compiler
          const resolvedType = resolveReceiveType(__type)
          const errors = validate(proxyForValidation, resolvedType)

          if (errors.length > 0) {
            const formattedErrors = errors.map((e) => ({
              path: e.path,
              message: e.message,
              code: String(e.code),
            }))

            console.error(
              `[Superglue] Content validation failed for ${fragmentId}:`,
              formattedErrors
            )
          }
        })
        .catch(() => {
          // Deepkit not installed - silently skip validation
        })
    }

    return proxy
  }, [sourceData, trackedFragments])

  return proxy
}
