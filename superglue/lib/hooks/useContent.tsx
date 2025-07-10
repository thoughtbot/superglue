import { useSelector } from 'react-redux'
import { useMemo, useRef } from 'react'
import { JSONMappable, RootState, Unproxied } from '../types'
import { useSuperglue } from './index'
import { createProxy, unproxy as unproxyUtil } from '../utils/proxy'

type ProxiedContent<T> = T & {
  readonly [K in keyof T]: T[K] extends { __id: string }
    ? unknown // Fragment references resolve to actual fragment data
    : T[K] extends (infer U)[]
    ? ProxiedContent<U>[]
    : T[K] extends object
    ? ProxiedContent<T[K]>
    : T[K]
}

export function useContent<T = JSONMappable>(): ProxiedContent<T>
export function useContent<T = JSONMappable>(fragmentRef: {
  __id: string
}): ProxiedContent<T>
export function useContent<T = JSONMappable>(fragmentRef?: {
  __id: string
}): ProxiedContent<T> {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  const dependencies = useRef<Set<string>>(new Set())
  const proxyCache = useRef<WeakMap<object, unknown>>(new WeakMap())

  const fragmentId = fragmentRef?.__id
  const sourceData = useSelector((state: RootState) => {
    if (fragmentId) {
      return state.fragments[fragmentId]
    } else {
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
  }, [sourceData])

  return proxy as ProxiedContent<T>
}

export function unproxy<T>(proxy: T): Unproxied<T> {
  return unproxyUtil(proxy)
}
