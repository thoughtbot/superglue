import { useSelector, useStore } from 'react-redux'
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

type FragmentRef = { __id: string } | string

interface UseContentOptions {
  optional?: boolean
}

export function useContent<T = JSONMappable>(): ProxiedContent<T>
export function useContent<T = JSONMappable>(
  fragmentRef: FragmentRef
): ProxiedContent<T>
export function useContent<T = JSONMappable>(
  fragmentRef: FragmentRef,
  options: { optional: false }
): ProxiedContent<T>
export function useContent<T = JSONMappable>(
  fragmentRef: FragmentRef,
  options: { optional: true }
): ProxiedContent<T> | undefined
export function useContent<T = JSONMappable>(
  fragmentRef?: FragmentRef,
  options?: UseContentOptions
): ProxiedContent<T> | undefined {
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

  const raiseOnMissing = !(options?.optional ?? false)
  const store = useStore<RootState>()

  const proxy = useMemo(() => {
    const proxyCache = new WeakMap()

    if (fragmentId && !sourceData) {
      if (raiseOnMissing) {
        throw new Error(`Fragment with id "${fragmentId}" not found`)
      } else {
        return undefined
      }
    }

    return createProxy(
      sourceData,
      { current: store.getState().fragments },
      dependencies.current,
      proxyCache
    ) as ProxiedContent<T>
  }, [sourceData, trackedFragments, options?.optional])

  return proxy
}

export function unproxy<T>(proxy: T): Unproxied<T> {
  return unproxyUtil(proxy)
}
