import { useSelector } from 'react-redux'
import { useMemo, useRef } from 'react'
import { JSONMappable, AllFragments, RootState } from '../types'
import { useSuperglue } from './index'
import { createProxy, unproxy as unproxyUtil } from '../utils/proxy'

type ProxiedContent<T> = T & {
  readonly [K in keyof T]: T[K] extends { __id: string }
    ? any // Fragment references resolve to actual fragment data
    : T[K] extends (infer U)[]
    ? ProxiedContent<U>[]
    : T[K] extends object
    ? ProxiedContent<T[K]>
    : T[K]
}

/**
 * Returns a reactive proxy for the current page with automatic fragment resolution.
 *
 * Key improvements over useContentV3:
 * - No callable syntax: user.profile directly returns resolved data (not user.profile())
 * - Better testing ergonomics: proxy structure matches expected response shape
 * - Per-hook dependency tracking: each hook instance tracks only what it accesses
 * - Global proxy caching: same underlying objects return same proxy instances
 * - Automatic fragment resolution: {__id: 'user_123'} becomes actual user data
 *
 * @example
 * ```tsx
 * const page = useContentV4()
 *
 * // Direct access - no callable syntax needed
 * const userName = page.user.name
 * const userAvatar = page.user.profile.avatar
 *
 * // Array methods work seamlessly
 * const postTitles = page.posts.map(post => post.title)
 *
 * // Reference equality via unproxy when needed
 * const isSameUser = unproxy(page.user) === unproxy(otherPage.user)
 * ```
 */
export function useContentV4<T = JSONMappable>(): ProxiedContent<T> {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  // Each hook instance maintains its own dependency tracking and proxy cache
  const dependenciesRef = useRef<Set<string>>(new Set())
  const hookProxyCache = useRef<WeakMap<object, any>>(new WeakMap())

  // Get current page data
  const pageData = useSelector(
    (state: RootState) => state.pages[currentPageKey].data
  )

  // Get fragments with optimized equality check
  const fragments = useSelector(
    (state: RootState) => state.fragments,
    (oldFragments, newFragments) => {
      if (oldFragments === newFragments) {
        return true
      }

      // Only re-render if fragments this hook actually depends on have changed
      return Array.from(dependenciesRef.current).every((id: string) => {
        const prevVal = oldFragments[id]
        const nextVal = newFragments[id]
        return prevVal === nextVal
      })
    }
  )

  // Create proxy with per-hook dependency tracking and caching
  const proxy = useMemo(() => {
    return createProxy(
      pageData,
      fragments,
      dependenciesRef,
      hookProxyCache.current
    )
  }, [pageData, fragments])

  return proxy as ProxiedContent<T>
}

/**
 * Returns the original underlying value from a proxy for reference equality checks.
 *
 * This enables reference equality comparisons across different hook instances:
 *
 * @example
 * ```tsx
 * // Hook A
 * const pageA = useContentV4()
 * const userA = pageA.user
 *
 * // Hook B
 * const pageB = useContentV4()
 * const userB = pageB.user
 *
 * // Different proxies, but same underlying data
 * userA === userB                    // ❌ false (different proxy instances)
 * unproxy(userA) === unproxy(userB)  // ✅ true (same underlying fragment data)
 *
 * // Use for memoization across components
 * const memoizedComponent = useMemo(() =>
 *   <UserCard user={unproxy(user)} />,
 *   [unproxy(user)]
 * )
 * ```
 *
 * @param proxy - The proxy object to unwrap
 * @returns The original underlying value, or the input if not a proxy
 */
export function unproxy<T>(proxy: T): T {
  return unproxyUtil(proxy)
}
