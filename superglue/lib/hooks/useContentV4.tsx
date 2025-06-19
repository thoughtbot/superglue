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

export function useContentV4<T = JSONMappable>(): ProxiedContent<T> {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  const dependencies = useRef<Set<string>>(new Set())
  const proxyCache = useRef<WeakMap<object, any>>(new WeakMap())

  const pageData = useSelector(
    (state: RootState) => state.pages[currentPageKey].data
  )

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
    return createProxy(
      pageData,
      fragments,
      dependencies.current,
      proxyCache.current
    )
  }, [pageData])

  return proxy as ProxiedContent<T>
}

// auto detect type
export function unproxy<T>(proxy: T): T {
  return unproxyUtil(proxy)
}

export function popRef<T>(fragmentData: T): { __id: string } {
  return popRefUtil(fragmentData)
}
