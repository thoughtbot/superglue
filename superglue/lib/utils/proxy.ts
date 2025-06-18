import { JSONMappable, AllFragments } from '../types'
import { MutableRefObject } from 'react'

type AccessKeyType = string | symbol | number

// Global proxy caches using WeakMaps for automatic memory management
const globalProxyCache = new WeakMap<object, any>()
const globalFragmentCache = new Map<string, any>()

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
  dependenciesRef: MutableRefObject<Set<string>>
): any[] {
  // Check global cache first
  if (globalProxyCache.has(arrayData)) {
    return globalProxyCache.get(arrayData)
  }

  const proxy = new Proxy(arrayData, {
    get(target, prop) {
      // Handle array methods
      if (isArrayGetter(prop)) {
        const method = target[prop]
        if (typeof method === 'function') {
          return function(...args: any[]) {
            const result = method.apply(target, args)
            
            // For methods that return arrays, we need to proxy them too
            if (Array.isArray(result)) {
              return createArrayProxy(result, fragments, dependenciesRef)
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
          
          return createProxy(fragmentData, fragments, dependenciesRef)
        }
        
        if (item && typeof item === 'object') {
          return createProxy(item, fragments, dependenciesRef)
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

  // Cache the proxy
  globalProxyCache.set(arrayData, proxy)
  return proxy
}

function createObjectProxy(
  objectData: object,
  fragments: AllFragments,
  dependenciesRef: MutableRefObject<Set<string>>
): any {
  // Check global cache first
  if (globalProxyCache.has(objectData)) {
    return globalProxyCache.get(objectData)
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
        
        return createProxy(fragmentData, fragments, dependenciesRef)
      }

      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          return createArrayProxy(value, fragments, dependenciesRef)
        }
        return createObjectProxy(value, fragments, dependenciesRef)
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

  // Cache the proxy
  globalProxyCache.set(objectData, proxy)
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
  dependenciesRef: MutableRefObject<Set<string>>
): T {
  if (!content || typeof content !== 'object') {
    return content
  }

  if (Array.isArray(content)) {
    return createArrayProxy(content, fragments, dependenciesRef) as T
  }

  return createObjectProxy(content, fragments, dependenciesRef) as T
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
