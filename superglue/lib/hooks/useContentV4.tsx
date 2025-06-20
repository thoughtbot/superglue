import { useSelector } from 'react-redux'
import { useMemo, useRef } from 'react'
import { JSONMappable, RootState } from '../types'
import { useSuperglue } from './index'
import { createProxy, unproxy as unproxyUtil, popRef as popRefUtil } from '../utils/proxy'

type ProxiedContent<T> = T & {
  readonly [K in keyof T]: T[K] extends { __id: string }
    ? any // Fragment references resolve to actual fragment data
    : T[K] extends (infer U)[]
    ? ProxiedContent<U>[]
    : T[K] extends object
    ? ProxiedContent<T[K]>
    : T[K]
}

// Overloaded function signatures
export function useContentV4<T = JSONMappable>(): ProxiedContent<T>
export function useContentV4<T = JSONMappable>(fragmentRef: { __id: string }): ProxiedContent<T>
export function useContentV4<T = JSONMappable>(fragmentRef?: { __id: string }): ProxiedContent<T> {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  const dependencies = useRef<Set<string>>(new Set())
  const proxyCache = useRef<WeakMap<object, any>>(new WeakMap())

  // Get the fragment ID if in fragment-scoped mode
  const fragmentId = fragmentRef?.__id

  // Always call useSelector, but return different data based on mode
  const sourceData = useSelector((state: RootState) => {
    if (fragmentId) {
      // Fragment-scoped mode: return the specific fragment
      return state.fragments[fragmentId]
    } else {
      // Page-scoped mode: return current page data
      return state.pages[currentPageKey].data
    }
  })

  const fragments = useSelector(
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

  const proxy = useMemo(() => {
    if (fragmentId && !sourceData) {
      throw new Error(`Fragment with id "${fragmentId}" not found`)
    }

    return createProxy(
      sourceData,
      fragments,
      dependencies.current,
      proxyCache.current
    )
  }, [sourceData]) // Only recreate when source data changes

  return proxy as ProxiedContent<T>
}

// auto detect type
export function unproxy<T>(proxy: T): T {
  return unproxyUtil(proxy)
}

export function popRef<T>(fragmentData: T): { __id: string } {
  return popRefUtil(fragmentData)
}
