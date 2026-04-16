import { useSelector, useStore } from 'react-redux'
import { useMemo, useRef } from 'react'
import {
  JSONMappable,
  RootState,
  Unproxy,
  PageKey,
  ReceiveType,
} from '../types'
import { useSuperglue } from './index'
import { createProxy, unproxy as unproxyUtil } from '../utils/proxy'

/**
 * Returns a proxy for accessing your page's content e.g, `index.json.props`,
 * `show.json.props`, etc.
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
 * @param pageKey - Optional page key to access a specific page's data.
 *   When omitted, returns data for the current page.
 * @template T - The data type being accessed (defaults to JSONMappable)
 * @returns Reactive proxy to page data
 *
 * @example
 * ```tsx
 * // Access current page data
 * const page = useContent()
 *
 * // Access a specific page's data by key
 * const posts = useContent('/posts')
 * ```
 */
export function useContent<T = JSONMappable>(): T
export function useContent<T = JSONMappable>(pageKey?: PageKey): T | undefined
export function useContent<T = JSONMappable>(
  pageKey?: PageKey,
  __type?: ReceiveType<T>
): T | undefined {
  const superglueState = useSuperglue()
  const resolvedPageKey = pageKey || superglueState.currentPageKey

  const dependencies = useRef<Set<string>>(new Set())

  const sourceData = useSelector((state: RootState) => {
    return state.pages[resolvedPageKey]?.data
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
              `[Superglue] Content validation failed for ${resolvedPageKey}:`,
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
