import { useSelector } from 'react-redux'
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
  dependenciesRef: MutableRefObject<Set<string>>
) {
  return new Proxy(arrayData, {
    get(target, prop) {
      if (prop === '__isContentProxy') return true
      
      const item = target[prop]
      
      if (item && typeof item === 'object') {
        if (item.__id && typeof item.__id === 'string') {
          const fragmentRef = { ...item }
          const callable = () => {
            dependenciesRef.current.add(item.__id)
            return fragments[item.__id]
          }
          Object.setPrototypeOf(callable, fragmentRef)
          Object.assign(callable, fragmentRef)
          return callable
        }
        
        return createContentProxy(item, fragments, dependenciesRef)
      }
      
      return item
    },
    
    set() {
      throw new Error('Cannot mutate proxy array. Use Redux actions to update state.')
    },
    
    deleteProperty() {
      throw new Error('Cannot delete properties on proxy array. Use Redux actions to update state.')
    },
    
    defineProperty() {
      throw new Error('Cannot define properties on proxy array. Use Redux actions to update state.')
    }
  })
}

function createContentProxy<T extends JSONMappable>(
  content: T,
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>
): ProxiedContent<T> {
  return new Proxy(content as any, {
    get(target: any, prop: string | symbol) {
      if (prop === '__isContentProxy') return true
      
      const value = target[prop]
      
      if (value && typeof value === 'object') {
        if (value.__id && typeof value.__id === 'string') {
          const fragmentRef = { ...value }
          const callable = () => {
            dependenciesRef.current.add(value.__id)
            return fragments[value.__id]
          }
          Object.setPrototypeOf(callable, fragmentRef)
          Object.assign(callable, fragmentRef)
          return callable
        }
        
        if (Array.isArray(value)) {
          return createArrayProxy(value, fragments, dependenciesRef)
        }
        
        return createContentProxy(value, fragments, dependenciesRef)
      }
      
      return value
    },
    
    set() {
      throw new Error('Cannot mutate page proxy. Use Redux actions to update state.')
    },
    
    deleteProperty() {
      throw new Error('Cannot delete properties on page proxy. Use Redux actions to update state.')
    },
    
    defineProperty() {
      throw new Error('Cannot define properties on page proxy. Use Redux actions to update state.')
    }
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
  
  // Get current page and fragments data
  const { pageData, fragments } = useSelector((state: RootState) => ({
    pageData: state.pages[currentPageKey].data,
    fragments: state.fragments
  }))
  
  // Track accessed fragments for dependency management
  const dependencyData = useSelector((state: RootState) => {
    const deps = Array.from(dependenciesRef.current)
    return deps.reduce((acc, fragmentId) => {
      acc[fragmentId] = state.fragments[fragmentId]
      return acc
    }, {} as Record<string, any>)
  })
  
  // Create stable proxy
  const proxy = useMemo(() => {
    return createContentProxy(pageData, fragments, dependenciesRef)
  }, [pageData, fragments, dependencyData])
  
  return proxy
}