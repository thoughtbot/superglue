import { useRef, useMemo, useCallback, MutableRefObject } from 'react'
import { useSelector } from 'react-redux'
import { RootState, AllFragments, JSONMappable } from '../types'

// Utility type guards (inspired by Valtio's approach)
const isObject = (x: unknown): x is object =>
  typeof x === 'object' && x !== null

// Fragment reference detection
const isFragmentRef = (value: unknown): value is { __id: string } =>
  isObject(value) && 
  typeof (value as any).__id === 'string'

// Array proxy creation (simplified from Valtio's array handling)
function createArrayProxy<T extends any[]>(
  array: T,
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  fragmentProxyMap: MutableRefObject<WeakMap<object, string>>,
  proxyCache: MutableRefObject<Map<string, any>>
): T {
  const proxy = new Proxy(array, {
    get(target, prop) {
      // Handle numeric indices
      if (typeof prop === 'string' && /^\d+$/.test(prop)) {
        const index = parseInt(prop, 10)
        const item = target[index]
        
        if (isFragmentRef(item)) {
          return handleFragmentAccess(
            item,
            fragments,
            dependenciesRef,
            fragmentProxyMap,
            proxyCache
          )
        }
        
        if (isObject(item)) {
          return createContentProxy(
            item,
            fragments,
            dependenciesRef,
            fragmentProxyMap,
            proxyCache
          )
        }
        
        return item
      }
      
      // Handle array methods (inspired by Valtio's array method handling)
      if (prop === 'map') {
        return (callback: (item: any, index: number, array: any[]) => any) => {
          return target.map((item, index) => {
            // Get the proxied item by calling the proxy's get handler
            const proxiedItem = proxy[index]
            return callback(proxiedItem, index, target)
          })
        }
      }
      
      // Array properties and methods
      return target[prop as keyof T]
    },
    
    set() {
      throw new Error(
        'Cannot mutate array proxy. Use Redux actions to update state.'
      )
    },
    
    deleteProperty() {
      throw new Error(
        'Cannot delete properties on array proxy. Use Redux actions to update state.'
      )
    }
  }) as T
  
  return proxy
}

// Core proxy creation (drawing from Valtio's proxy patterns)
function createContentProxy<T extends JSONMappable>(
  content: T,
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  fragmentProxyMap: MutableRefObject<WeakMap<object, string>>,
  proxyCache: MutableRefObject<Map<string, any>>
): T {
  return new Proxy(content as any, {
    get(target: any, prop: string | symbol) {
      const value = target[prop]
      
      // Fragment reference handling - auto-resolve and track
      if (isFragmentRef(value)) {
        return handleFragmentAccess(
          value,
          fragments,
          dependenciesRef,
          fragmentProxyMap,
          proxyCache
        )
      }
      
      // Array handling
      if (Array.isArray(value)) {
        return createArrayProxy(
          value,
          fragments,
          dependenciesRef,
          fragmentProxyMap,
          proxyCache
        )
      }
      
      // Nested object handling
      if (isObject(value)) {
        return createContentProxy(
          value,
          fragments,
          dependenciesRef,
          fragmentProxyMap,
          proxyCache
        )
      }
      
      return value
    },
    
    set() {
      throw new Error(
        'Cannot mutate content proxy. Use Redux actions to update state.'
      )
    },
    
    defineProperty() {
      throw new Error(
        'Cannot define properties on content proxy. Use Redux actions to update state.'
      )
    },
    
    deleteProperty() {
      throw new Error(
        'Cannot delete properties on content proxy. Use Redux actions to update state.'
      )
    }
  })
}

// Fragment access handler (similar to Valtio's proxy state handling)
function handleFragmentAccess(
  fragmentRef: { __id: string },
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  fragmentProxyMap: MutableRefObject<WeakMap<object, string>>,
  proxyCache: MutableRefObject<Map<string, any>>
) {
  const fragmentId = fragmentRef.__id
  
  // Check cache first (Valtio-inspired caching)
  if (proxyCache.current.has(fragmentId)) {
    return proxyCache.current.get(fragmentId)
  }
  
  // Auto-track dependency (key difference from V3)
  dependenciesRef.current.add(fragmentId)
  
  // Get fragment data
  const fragmentData = fragments[fragmentId]
  if (!fragmentData) {
    console.warn(`Fragment ${fragmentId} not found`)
    return undefined
  }
  
  // Create proxied fragment data
  const proxiedFragment = createContentProxy(
    fragmentData,
    fragments,
    dependenciesRef,
    fragmentProxyMap,
    proxyCache
  )
  
  // Track for unProxyFragment (using WeakMap like Valtio's proxyCache)
  fragmentProxyMap.current.set(proxiedFragment, fragmentId)
  
  // Cache the result (Valtio-inspired caching strategy)
  proxyCache.current.set(fragmentId, proxiedFragment)
  
  return proxiedFragment
}

/**
 * useContentV4 - Reactive content hook with automatic fragment resolution
 * 
 * Inspired by Valtio's proxy-based reactivity but adapted for server-driven fragments.
 * Key differences from V3:
 * - Fragments auto-resolve on access (no explicit () calls)
 * - Natural object/array access patterns
 * - unProxyFragment for performance optimization
 * 
 * @returns [content, unProxyFragment] tuple
 */
export function useContentV4<T extends JSONMappable = JSONMappable>() {
  // Get current page and fragments from Redux
  const currentPageKey = useSelector((state: RootState) => state.superglue.currentPageKey)
  const pageData = useSelector((state: RootState) => state.pages[currentPageKey]?.data as T)
  
  // Dependency tracking (scoped per hook instance like Valtio)
  const dependenciesRef = useRef(new Set<string>())
  
  // Fragment proxy tracking (WeakMap for memory efficiency, inspired by Valtio's proxyCache)
  const fragmentProxyMap = useRef(new WeakMap<object, string>())
  
  // Proxy cache for performance (similar to Valtio's caching strategy)
  const proxyCache = useRef(new Map<string, any>())
  
  // Fragment selector with dependency-based equality check (inspired by Valtio's subscription model)
  const fragments = useSelector(
    (state: RootState) => state.fragments,
    (oldFragments: AllFragments, newFragments: AllFragments) => {
      // Custom equality: only check fragments this component uses
      let isEqual = true
      
      dependenciesRef.current.forEach((id) => {
        const prevVal = oldFragments[id]
        const nextVal = newFragments[id]
        if (prevVal !== nextVal) {
          // Invalidate cache for changed fragments (Valtio-inspired cache invalidation)
          proxyCache.current.delete(id)
          isEqual = false
        }
      })
      
      return isEqual
    }
  )
  
  // unProxyFragment function - returns fragment reference and removes from dependencies
  const unProxyFragment = useCallback((fragmentProxy: any) => {
    const fragmentId = fragmentProxyMap.current.get(fragmentProxy)
    
    if (!fragmentId) {
      throw new Error(
        'unProxyFragment() can only be called with fragment data returned from useContentV4. ' +
        'The provided value is not a tracked fragment.'
      )
    }
    
    // Remove from dependencies for performance optimization
    dependenciesRef.current.delete(fragmentId)
    
    // Return fragment reference
    return { __id: fragmentId }
  }, [])
  
  // Create proxied content (memoized like Valtio's proxy creation)
  const proxy = useMemo(() => {
    // Clear dependencies on new page data (fresh start like Valtio's proxy initialization)
    dependenciesRef.current.clear()
    
    if (!pageData) {
      return {} as T
    }
    
    return createContentProxy(
      pageData,
      fragments,
      dependenciesRef,
      fragmentProxyMap,
      proxyCache
    )
  }, [pageData, fragments])
  
  return [proxy, unProxyFragment] as const
}