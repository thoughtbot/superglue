import { useSelector } from 'react-redux'
import {
  JSONMappable,
  Page,
  RootState,
  SuperglueState,
  AllFragments,
} from '../types'
export { useFragment } from './useFragment'
export { useContentV4, unproxy } from './useContentV4'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}

/**
 * A lightweight hook that grabs the current page's content from the store.
 */
export function useContent<T = JSONMappable>() {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  return useSelector<RootState<T>, Page<T>>(
    (state) => state.pages[currentPageKey]
  ).data
}

type ContentSelector<T, R> = (content: T) => R
type ProxiedContent<T> = T & {
  [K in keyof T]: T[K] extends { __id: string }
    ? T[K] & (() => any)
    : T[K] extends (infer U)[]
    ? ProxiedContent<U>[]
    : T[K] extends object
    ? ProxiedContent<T[K]>
    : T[K]
}

function validateResult(
  value: any,
  getProxyTarget: (proxy: any) => any,
  getFragmentRef: (id: string) => any,
  isResolvedFragment: (obj: any) => boolean
): any {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value !== 'object' && typeof value !== 'function') {
    return value // primitives are allowed
  }

  // Handle callable fragment references
  if (typeof value === 'function' && value.__id) {
    return getFragmentRef(value.__id)
  }

  if (value.__isContentProxy === true) {
    return getProxyTarget(value) // my proxy - unwrap it
  }

  // Allow resolved fragment data
  if (isResolvedFragment(value)) {
    return value // resolved fragment data - allow it
  }

  throw new Error(
    'useContentV2 selector must return primitives or proxy objects from the page. ' +
      'Avoid creating plain objects/arrays like {...obj}, arr.map(), or new Proxy()'
  )
}

function createContentProxy<T extends JSONMappable>(
  content: T,
  fragments: AllFragments,
  proxyTargets: WeakMap<object, any>,
  fragmentTargets: Record<string, any>,
  resolvedFragments: WeakSet<object>
): ProxiedContent<T> {
  const proxy = new Proxy(content as any, {
    get(target: any, prop: string | symbol) {
      if (prop === '__isContentProxy') {
        return true
      }

      const value = target[prop]

      if (value && typeof value === 'object') {
        if (value.__id && typeof value.__id === 'string') {
          const fragmentRef = { ...value }
          fragmentTargets[value.__id] = value
          const callable = () => {
            const fragmentData = fragments[value.__id]
            // Track resolved fragment data to distinguish from user-created objects
            if (fragmentData && typeof fragmentData === 'object') {
              resolvedFragments.add(fragmentData)
            }
            return fragmentData
          }
          Object.setPrototypeOf(callable, fragmentRef)
          Object.assign(callable, fragmentRef)
          return callable
        }

        if (Array.isArray(value)) {
          const arrayProxy = new Proxy(value, {
            get(target, prop) {
              if (prop === '__isContentProxy') {
                return true
              }

              const item = target[prop]

              if (item && typeof item === 'object') {
                if (item.__id && typeof item.__id === 'string') {
                  const fragmentRef = { ...item }
                  fragmentTargets[item.__id] = item
                  const callable = () => {
                    const fragmentData = fragments[item.__id]
                    // Track resolved fragment data to distinguish from user-created objects
                    if (fragmentData && typeof fragmentData === 'object') {
                      resolvedFragments.add(fragmentData)
                    }
                    return fragmentData
                  }
                  Object.setPrototypeOf(callable, fragmentRef)
                  Object.assign(callable, fragmentRef)
                  return callable
                }

                return createContentProxy(
                  item,
                  fragments,
                  proxyTargets,
                  fragmentTargets,
                  resolvedFragments
                )
              }

              return item
            },
          })

          proxyTargets.set(arrayProxy, value)
          return arrayProxy
        }

        return createContentProxy(
          value,
          fragments,
          proxyTargets,
          fragmentTargets,
          resolvedFragments
        )
      }

      return value
    },
  })

  proxyTargets.set(proxy, content)
  return proxy
}
