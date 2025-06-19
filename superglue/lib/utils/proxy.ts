import { JSONMappable, AllFragments } from '../types'

type AccessKeyType = string | symbol | number

// Global mapping from proxy back to original value for unproxy() functionality
const proxyToOriginalMap = new WeakMap<any, any>()

// Global mapping from fragment data back to fragment reference for toRef() functionality
const fragmentToReferenceMap = new WeakMap<any, { __id: string }>()

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
  dependencies: Set<string>,
  proxyCache: WeakMap<object, any>
): any[] {
  if (proxyCache && proxyCache.has(arrayData)) {
    return proxyCache.get(arrayData)
  }

  const proxy = new Proxy(arrayData, {
    get(target, prop) {
      // Handle array methods
      if (isArrayGetter(prop)) {
        const method = target[prop]
        if (typeof method === 'function') {
          return function (...args: any[]) {
            // Create a mapped version of the target with resolved fragments for the method call
            const resolvedTarget = target.map((item) => {
              if (isFragmentReference(item)) {
                dependencies.add(item.__id)
                const fragmentData = fragments[item.__id]
                if (!fragmentData) {
                  throw new Error(`Fragment with id "${item.__id}" not found`)
                }
                
                const proxy = createProxy(
                  fragmentData,
                  fragments,
                  dependencies,
                  proxyCache
                )
                
                // Store mapping for toRef() functionality
                fragmentToReferenceMap.set(proxy, item)
                
                return proxy
              }

              if (item && typeof item === 'object') {
                return createProxy(item, fragments, dependencies, proxyCache)
              }

              return item
            })

            const result = method.apply(resolvedTarget, args)

            // For methods that return arrays, we need to proxy them too
            if (Array.isArray(result)) {
              return createArrayProxy(
                result,
                fragments,
                dependencies,
                proxyCache
              )
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
          dependencies.add(item.__id)
          const fragmentData = fragments[item.__id]

          if (!fragmentData) {
            throw new Error(`Fragment with id "${item.__id}" not found`)
          }

          const proxy = createProxy(fragmentData, fragments, dependencies, proxyCache)
          
          // Store mapping for toRef() functionality
          fragmentToReferenceMap.set(proxy, item)

          return proxy
        }

        if (item && typeof item === 'object') {
          return createProxy(item, fragments, dependencies, proxyCache)
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

  proxyToOriginalMap.set(proxy, arrayData)

  if (proxyCache) {
    proxyCache.set(arrayData, proxy)
  }

  return proxy
}

function createObjectProxy(
  objectData: object,
  fragments: AllFragments,
  dependencies: Set<string>,
  proxyCache: WeakMap<object, any>
): any {
  if (proxyCache && proxyCache.has(objectData)) {
    return proxyCache.get(objectData)
  }

  const proxy = new Proxy(objectData as any, {
    get(target: any, prop: string | symbol) {
      const value = target[prop]

      if (isFragmentReference(value)) {
        dependencies.add(value.__id)
        const fragmentData = fragments[value.__id]

        if (!fragmentData) {
          throw new Error(`Fragment with id "${value.__id}" not found`)
        }

        const proxy = createProxy(fragmentData, fragments, dependencies, proxyCache)
        
        // Store mapping for toRef() functionality
        fragmentToReferenceMap.set(proxy, value)

        return proxy
      }

      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          return createArrayProxy(value, fragments, dependencies, proxyCache)
        }
        return createObjectProxy(value, fragments, dependencies, proxyCache)
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

  if (proxyCache) {
    proxyCache.set(objectData, proxy)
  }

  return proxy
}

export function createProxy<T extends JSONMappable>(
  content: T,
  fragments: AllFragments,
  dependencies: Set<string>,
  proxyCache: WeakMap<object, any>
): T {
  if (!content || typeof content !== 'object') {
    return content
  }

  if (Array.isArray(content)) {
    return createArrayProxy(content, fragments, dependencies, proxyCache) as T
  }

  return createObjectProxy(content, fragments, dependencies, proxyCache) as T
}

export function unproxy<T>(proxy: T): T {
  return proxyToOriginalMap.get(proxy) || proxy
}

export function toRef<T>(fragmentData: T): { __id: string } {
  const ref = fragmentToReferenceMap.get(fragmentData)
  if (!ref) {
    throw new Error('Cannot convert to fragment reference: data was not resolved from a fragment')
  }
  return ref
}
