import { useSelector } from 'react-redux'
import {
  JSONMappable,
  Page,
  RootState,
  SuperglueState,
  AllFragments,
} from '../types'
export { useFragment } from './useFragment'

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
  getFragmentRef: (id: string) => any
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

  throw new Error(
    'useContentV2 selector must return primitives or proxy objects from the page. ' +
      'Avoid creating plain objects/arrays like {...obj}, arr.map(), or new Proxy()'
  )
}

function createContentProxy<T extends JSONMappable>(
  content: T,
  fragments: AllFragments,
  proxyTargets: WeakMap<object, any>,
  fragmentTargets: WeakMap<string, any>
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
          fragmentTargets.set(value.__id, value)
          const callable = () => fragments[value.__id]
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
                  fragmentTargets.set(item.__id, item)
                  const callable = () => fragments[item.__id]
                  Object.setPrototypeOf(callable, fragmentRef)
                  Object.assign(callable, fragmentRef)
                  return callable
                }

                return createContentProxy(item, fragments, proxyTargets, fragmentTargets)
              }

              return item
            },
          })

          proxyTargets.set(arrayProxy, value)
          return arrayProxy
        }

        return createContentProxy(value, fragments, proxyTargets, fragmentTargets)
      }

      return value
    },
  })

  proxyTargets.set(proxy, content)
  return proxy
}

/**
 * Enhanced version of useContent with proxy support for fragment resolution.
 * Can be used with or without a selector function.
 */
export function useContentV2<T = JSONMappable>(): T
export function useContentV2<T = JSONMappable, R = any>(
  selector: ContentSelector<ProxiedContent<T>, R>
): R
export function useContentV2<T = JSONMappable, R = any>(
  selector?: ContentSelector<ProxiedContent<T>, R>
) {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  if (!selector) {
    return useSelector<RootState<T>, T>(
      (state) => state.pages[currentPageKey].data
    )
  }

  return useSelector<RootState<T>, R>((state) => {
    const pageData = state.pages[currentPageKey].data
    const fragments = state.fragments

    // Create WeakMaps to track targets - scoped to this selector execution
    const proxyTargets = new WeakMap<object, any>()      // proxy → original target
    const fragmentTargets = new WeakMap<string, any>()   // fragment ID → original reference

    // Helper functions for lookup
    const getProxyTarget = (proxy: any) => proxyTargets.get(proxy)
    const getFragmentRef = (id: string) => fragmentTargets.get(id)

    const proxiedContent = createContentProxy(pageData, fragments, proxyTargets, fragmentTargets)
    const result = selector(proxiedContent)
    return validateResult(result, getProxyTarget, getFragmentRef)
  })
}
