import { shallowEqual, useSelector, useStore } from 'react-redux'
import { useMemo, useRef, MutableRefObject } from 'react'
import { JSONMappable, AllFragments, RootState } from '../types'
import { useSuperglue } from './index'

type ProxiedContent<T> = T & {
  readonly [K in keyof T]: T[K] extends { __id: string }
    ? T[K] & (() => any)
    : T[K] extends (infer U)[]
    ? ProxiedContent<U>[]
    : T[K] extends object
    ? ProxiedContent<T[K]>
    : T[K]
} & {
  readonly __isContentProxy: true
}

function createArrayProxy(
  arrayData: any[],
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  proxyCache: MutableRefObject<Map<string, () => JSONMappable>>
) {
  return new Proxy(arrayData, {
    get(target, prop) {
      if (prop === '__isContentProxy') return true

      const item = target[prop]

      if (item && typeof item === 'object') {
        if (item.__id && typeof item.__id === 'string') {
          // Check cache first!
          if (proxyCache.current.has(item.__id)) {
            return proxyCache.current.get(item.__id)
          }

          const fragmentRef = { ...item }
          const callable = () => {
            dependenciesRef.current.add(item.__id)
            return fragments[item.__id]
          }
          Object.setPrototypeOf(callable, fragmentRef)
          Object.assign(callable, fragmentRef)

          // Cache the new proxy
          proxyCache.current.set(item.__id, callable)
          return callable
        }

        return createContentProxy(item, fragments, dependenciesRef, proxyCache)
      }

      return item
    },

    set() {
      throw new Error(
        'Cannot mutate proxy array. Use Redux actions to update state.'
      )
    },

    deleteProperty() {
      throw new Error(
        'Cannot delete properties on proxy array. Use Redux actions to update state.'
      )
    },

    defineProperty() {
      throw new Error(
        'Cannot define properties on proxy array. Use Redux actions to update state.'
      )
    },
  })
}

function createContentProxy<T extends JSONMappable>(
  content: T,
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  proxyCache: MutableRefObject<Map<string, () => JSONMappable>>
): ProxiedContent<T> {
  return new Proxy(content as any, {
    get(target: any, prop: string | symbol) {
      if (prop === '__isContentProxy') return true

      const value = target[prop]

      if (value && typeof value === 'object') {
        if (value.__id && typeof value.__id === 'string') {
          // Check cache first!
          if (proxyCache.current.has(value.__id)) {
            return proxyCache.current.get(value.__id)
          }

          const fragmentRef = { ...value }
          const callable = () => {
            dependenciesRef.current.add(value.__id)
            return fragments[value.__id]
          }
          Object.setPrototypeOf(callable, fragmentRef)
          Object.assign(callable, fragmentRef)

          // Cache the new proxy
          proxyCache.current.set(value.__id, callable)
          return callable
        }

        if (Array.isArray(value)) {
          return createArrayProxy(value, fragments, dependenciesRef, proxyCache)
        }

        return createContentProxy(value, fragments, dependenciesRef, proxyCache)
      }

      return value
    },

    set() {
      throw new Error(
        'Cannot mutate page proxy. Use Redux actions to update state.'
      )
    },

    deleteProperty() {
      throw new Error(
        'Cannot delete properties on page proxy. Use Redux actions to update state.'
      )
    },

    defineProperty() {
      throw new Error(
        'Cannot define properties on page proxy. Use Redux actions to update state.'
      )
    },
  })
}

/**
 * Returns a stable proxy for the current page with dynamic dependency tracking.
 * The proxy can "escape" the hook and be used throughout the component.
 * Only re-renders when fragments accessed via () calls actually change.
 */
export function useContentV3<T = JSONMappable>(): ProxiedContent<T> {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey
  const dependenciesRef = useRef<Set<string>>(new Set())
  const proxyCache = useRef<Map<string, () => JSONMappable>>(new Map())

  const pageData = useSelector(
    (state: RootState) => state.pages[currentPageKey].data
  )

  const fragments = useSelector(
    (state: RootState) => state.fragments,
    (oldFragments, newFragments) => {
      if (oldFragments === newFragments) {
        return true
      }

      let isEqual = true

      dependenciesRef.current.forEach((id) => {
        const prevVal = oldFragments[id]
        const nextVal = newFragments[id]

        if (prevVal !== nextVal) {
          proxyCache.current.delete(id)
          isEqual = false
        }
      })

      return isEqual
    }
  )

  const proxy = useMemo(() => {
    return createContentProxy(pageData, fragments, dependenciesRef, proxyCache)
  }, [pageData])

  return proxy
}
