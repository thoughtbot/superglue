import { useSelector, useStore } from 'react-redux'
import { useMemo, useRef } from 'react'
import {
  JSONMappable,
  RootState,
  Unproxy,
  FragmentRef,
  ReceiveType,
} from '../types'
import { useSuperglue } from './index'
import { createProxy, unproxy as unproxyUtil } from '../utils/proxy'

export type FragmentProxy = { __fragment: true }

/**
 * Union type for fragment references, accepting either FragmentRef objects or string IDs
 * @public
 */
export type FragmentRefOrId = FragmentRef | string

/**
 * Returns a proxy for accessing your page's content e.g, `index.json.props`,
 * `show.json.props`, etc.
 *
 * For advanced scenarios where you are using Fragments.
 *
 * ```js
 * {
 *   data: {
 *     body: {
 *       cart: {__id: 'user_cart'}
 *     },
 *    footer: {title: "welcome"}},
 *   },
 *   fragments: {user_cart: {total: 100}}
 * }
 * ```
 *
 * The proxy will lazily and automatically resolve any {@link FragmentRef}s making it
 * as easy as
 *
 * ```
 * const data = useContent()
 * const total = data.body.cart.total
 * ```
 *
 * The hook will also automatically tracks fragment dependencies and triggers
 * re-renders only when accessed fragments change.
 *
 * @template T - The data type being accessed (defaults to JSONMappable)
 * @returns Reactive proxy to page data or fragment data, undefined if fragment not found
 *
 * @example
 * ```tsx
 * // Access current page data
 * const page = useContent()
 *
 * // Access specific fragment by reference
 * const user = useContent({__id: 'user_123'})
 *
 * // Access specific fragment by ID string
 * const cart = useContent('userCart')
 * ```
 */
export function useContent<T = JSONMappable>(): T

/**
 * Passing in a fragment to useContent allows us to scope the tracking of
 * fragments to that hook usage. Its useful in performance scenarios where you
 * want a child component to update, but not the parent.
 *
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
 *   const cart = useContent(cartRef)
 * }
 * ```
 *
 * SlidingCart will update only if the fragment referenced by `cartRef` updates.
 *
 * @param fragmentRef Optional fragment reference for scoped access
 */
export function useContent<T = JSONMappable>(fragmentRef: FragmentRefOrId): T
export function useContent<T = JSONMappable>(
  fragmentRef?: FragmentRefOrId,
  __type?: ReceiveType<T>
): T | undefined {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  const dependencies = useRef<Set<string>>(new Set())
  // const fragmentsHookRef = useRef<RootState['fragments']>({})

  const fragmentId =
    typeof fragmentRef === 'string' ? fragmentRef : fragmentRef?.__id
  const sourceData = useSelector((state: RootState) => {
    if (fragmentId) {
      return state.fragments[fragmentId]
    } else {
      return state.pages[currentPageKey].data
    }
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

  // Update the ref BEFORE the useMemo so proxy creation sees current fragments
  // fragmentsHookRef.current = fragments

  const store = useStore<RootState>()

  const proxy = useMemo(() => {
    const proxyCache = new WeakMap()

    if (fragmentId && !sourceData) {
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
              `[Superglue] Content validation failed for ${
                fragmentId || 'page'
              }:`,
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

/**
 * Extracts the underlying state from an {@link useContent} proxy
 *
 */
export function unproxy<T>(proxy: T): Unproxy<T> {
  return unproxyUtil(proxy)
}
