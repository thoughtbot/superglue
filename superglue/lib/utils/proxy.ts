import { JSONMappable, AllFragments } from '../types'

type AccessKeyType = string | symbol | number

// Global mapping from proxy back to original value for unproxy() functionality
const proxyToOriginalMap = new WeakMap<any, any>()

// Global mapping from fragment data back to fragment reference for popRef() functionality
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
                
                // Store mapping for popRef() functionality
                fragmentToReferenceMap.set(proxy, item)
                
                // Define cleanup function directly on proxy
                // We can't use Object.defineProperty because the proxy traps block it
                ;(proxy as any).__POP_DEPENDENCY__ = () => {
                  dependencies.delete(item.__id)
                }
                
                return proxy
              }
     
              if (typeof item === 'object' && item !== null) {
                if ('$$typeof' in item) {
                  // Handle React elements - pass through without proxying
                  return item
                } else {
                  return createProxy(item, fragments, dependencies, proxyCache)
                }
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
          
          // Store mapping for popRef() functionality
          fragmentToReferenceMap.set(proxy, item)
          
          // Define cleanup function directly on proxy
          // We can't use Object.defineProperty because the proxy traps block it
          ;(proxy as any).__POP_DEPENDENCY__ = () => {
            dependencies.delete(item.__id)
          }

          return proxy
        }

        if (typeof item === 'object' && item !== null) {
          if ('$$typeof' in item) {
            // Handle React elements - pass through without proxying
            return item
          } else {
            return createProxy(item, fragments, dependencies, proxyCache)
          }
        }

        return item
      }

      // Handle other array properties (length, etc.)
      return target[prop]
    },

    set(target, prop, value) {
      // Allow setting __POP_DEPENDENCY__ for internal use
      if (prop === '__POP_DEPENDENCY__') {
        return Reflect.set(target, prop, value)
      }
      throw new Error(
        'Cannot mutate proxy array. Use Redux actions to update state.'
      )
    },

    deleteProperty() {
      throw new Error(
        'Cannot delete properties on proxy array. Use Redux actions to update state.'
      )
    },

    defineProperty(target, prop, descriptor) {
      // Allow defining __POP_DEPENDENCY__ for internal use
      if (prop === '__POP_DEPENDENCY__') {
        return true // Allow this property to be defined
      }
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
        
        // Store mapping for popRef() functionality
        fragmentToReferenceMap.set(proxy, value)
        
        // Define cleanup function directly on proxy
        // We can't use Object.defineProperty because the proxy traps block it
        ;(proxy as any).__POP_DEPENDENCY__ = () => {
          dependencies.delete(value.__id)
        }

        return proxy
      }
      if (typeof value === 'object' && value !== null) {
        if ('$$typeof' in value) {
          // Handle React elements - pass through without proxying
          return value
        } else if (Array.isArray(value)) {
          return createArrayProxy(value, fragments, dependencies, proxyCache)
        } else {
          return createObjectProxy(value, fragments, dependencies, proxyCache)
        }
      }

      // For primitive values and undefined, direct access
      return value
    },

    set(target, prop, value) {
      // Allow setting __POP_DEPENDENCY__ for internal use
      if (prop === '__POP_DEPENDENCY__') {
        return Reflect.set(target, prop, value)
      }
      throw new Error(
        'Cannot mutate proxy object. Use Redux actions to update state.'
      )
    },

    deleteProperty() {
      throw new Error(
        'Cannot delete properties on proxy object. Use Redux actions to update state.'
      )
    },

    defineProperty(target, prop, descriptor) {
      // Allow defining __POP_DEPENDENCY__ for internal use
      if (prop === '__POP_DEPENDENCY__') {
        return Reflect.defineProperty(target, prop, descriptor)
      }
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

  // Don't proxy React elements
  if ('$$typeof' in content) {
    return content
  }

  if (Array.isArray(content)) {
    return createArrayProxy(content, fragments, dependencies, proxyCache) as T
  }

  return createObjectProxy(content, fragments, dependencies, proxyCache) as T
}

export function unproxy<T>(proxy: T): T {
  return proxyToOriginalMap.get(proxy)// || proxy
}

export function popRef<T>(fragmentData: T): { __id: string } {
  const ref = fragmentToReferenceMap.get(fragmentData)
  if (!ref) {
    throw new Error('Cannot convert to fragment reference: data was not resolved from a fragment')
  }
  
  // Call the cleanup function if it exists to remove dependency
  if (fragmentData && typeof fragmentData === 'object' && '__POP_DEPENDENCY__' in fragmentData) {
    ;(fragmentData as any).__POP_DEPENDENCY__()
  }
  
  return ref
}
