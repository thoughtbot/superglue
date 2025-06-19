import { JSONMappable, AllFragments } from '../types'
import { MutableRefObject } from 'react'

type AccessKeyType = string | symbol | number

// Global proxy caches using WeakMaps for automatic memory management
const globalProxyCache = new WeakMap<object, any>()
const globalFragmentCache = new Map<string, any>()

// Global mapping from proxy back to original value for unproxy() functionality
const proxyToOriginalMap = new WeakMap<any, any>()

const ARRAY_GETTER_METHODS = new Set<AccessKeyType>([
  Symbol.iterator,
  'concat',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'values',
])

const ARRAY_SETTER_METHODS = new Set<AccessKeyType>([
  'push',
  'pop',
  'unshift',
  'shift',
  'splice',
  'sort',
])

function isArraySetter<T>(prop: AccessKeyType): prop is keyof Array<T> {
  return ARRAY_SETTER_METHODS.has(prop)
}

function isArrayGetter<T>(prop: AccessKeyType): prop is keyof Array<T> {
  return ARRAY_GETTER_METHODS.has(prop)
}

function convertToInt(prop: AccessKeyType): number | null {
  if (typeof prop === 'symbol') return null

  const num = Number(prop)

  if (isNaN(num)) return null

  return num % 1 === 0 ? num : null
}

function isFragmentReference(value: any): value is { __id: string } {
  return value && typeof value === 'object' && typeof value.__id === 'string'
}

function createArrayProxy(
  arrayData: any[],
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  localCache?: WeakMap<object, any>
): any[] {
  // Check local cache if provided (for hook-specific caching)
  if (localCache && localCache.has(arrayData)) {
    return localCache.get(arrayData)
  }

  const proxy = new Proxy(arrayData, {
    get(target, prop) {
      // Handle array methods
      if (isArrayGetter(prop)) {
        const method = target[prop]
        if (typeof method === 'function') {
          return function(...args: any[]) {
            // Create a mapped version of the target with resolved fragments for the method call
            const resolvedTarget = target.map((item, index) => {
              if (isFragmentReference(item)) {
                dependenciesRef.current.add(item.__id)
                const fragmentData = fragments[item.__id]
                if (!fragmentData) {
                  throw new Error(`Fragment with id "${item.__id}" not found`)
                }
                return createProxy(fragmentData, fragments, dependenciesRef, localCache)
              }
              
              if (item && typeof item === 'object') {
                return createProxy(item, fragments, dependenciesRef, localCache)
              }
              
              return item
            })
            
            const result = method.apply(resolvedTarget, args)
            
            // For methods that return arrays, we need to proxy them too
            if (Array.isArray(result)) {
              return createArrayProxy(result, fragments, dependenciesRef, localCache)
            }
            
            return result
          }
        }
        return method
      }

      // Block mutations
      if (isArraySetter(prop)) {
        throw new Error(
          `Cannot mutate proxy array. Use Redux actions to update state.`
        )
      }

      // Handle numeric indices
      const index = convertToInt(prop)
      if (index !== null && index >= 0 && index < target.length) {
        const item = target[index]
        
        if (isFragmentReference(item)) {
          // Track dependency and resolve fragment
          dependenciesRef.current.add(item.__id)
          const fragmentData = fragments[item.__id]
          
          if (!fragmentData) {
            throw new Error(`Fragment with id "${item.__id}" not found`)
          }
          
          return createProxy(fragmentData, fragments, dependenciesRef, localCache)
        }
        
        if (item && typeof item === 'object') {
          return createProxy(item, fragments, dependenciesRef, localCache)
        }
        
        return item
      }

      // Handle other array properties (length, etc.)
      return target[prop]
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

  // Store proxy -> original mapping for unproxy functionality
  proxyToOriginalMap.set(proxy, arrayData)
  
  // Cache in local cache if provided
  if (localCache) {
    localCache.set(arrayData, proxy)
  }
  
  return proxy
}

function createObjectProxy(
  objectData: object,
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  localCache?: WeakMap<object, any>
): any {
  // Check local cache if provided (for hook-specific caching)
  if (localCache && localCache.has(objectData)) {
    return localCache.get(objectData)
  }

  const proxy = new Proxy(objectData as any, {
    get(target: any, prop: string | symbol) {
      const value = target[prop]

      if (isFragmentReference(value)) {
        // Track dependency and resolve fragment
        dependenciesRef.current.add(value.__id)
        const fragmentData = fragments[value.__id]
        
        if (!fragmentData) {
          throw new Error(`Fragment with id "${value.__id}" not found`)
        }
        
        return createProxy(fragmentData, fragments, dependenciesRef, localCache)
      }

      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          return createArrayProxy(value, fragments, dependenciesRef, localCache)
        }
        return createObjectProxy(value, fragments, dependenciesRef, localCache)
      }

      return value
    },

    set() {
      throw new Error(
        'Cannot mutate proxy object. Use Redux actions to update state.'
      )
    },

    deleteProperty() {
      throw new Error(
        'Cannot delete properties on proxy object. Use Redux actions to update state.'
      )
    },

    defineProperty() {
      throw new Error(
        'Cannot define properties on proxy object. Use Redux actions to update state.'
      )
    },
  })

  // Store proxy -> original mapping for unproxy functionality
  proxyToOriginalMap.set(proxy, objectData)
  
  // Cache in local cache if provided
  if (localCache) {
    localCache.set(objectData, proxy)
  }
  
  return proxy
}

/**
 * Creates a reactive proxy for content data with global caching and fragment resolution.
 * 
 * @param content - The data to proxy (object or array)
 * @param fragments - All available fragments for resolution
 * @param dependenciesRef - Ref to track fragment dependencies for this hook instance
 * @returns Proxied content with automatic fragment resolution
 */
export function createProxy<T extends JSONMappable>(
  content: T,
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>,
  localCache?: WeakMap<object, any>
): T {
  if (!content || typeof content !== 'object') {
    return content
  }

  if (Array.isArray(content)) {
    return createArrayProxy(content, fragments, dependenciesRef, localCache) as T
  }

  return createObjectProxy(content, fragments, dependenciesRef, localCache) as T
}

/**
 * Clears cached proxies for specific fragment IDs.
 * Used by Redux middleware when fragments are updated.
 */
export function invalidateFragmentProxies(fragmentIds: string[]): void {
  fragmentIds.forEach(id => {
    globalFragmentCache.delete(id)
  })
}

/**
 * Clears all cached proxies. Use sparingly, mainly for testing.
 */
export function clearAllProxyCaches(): void {
  globalFragmentCache.clear()
  // Note: WeakMap doesn't have clear() method, it will be GC'd naturally
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
 * ```
 * 
 * @param proxy - The proxy object to unwrap
 * @returns The original underlying value, or the input if not a proxy
 */
export function unproxy<T>(proxy: T): T {
  return proxyToOriginalMap.get(proxy) || proxy
}
