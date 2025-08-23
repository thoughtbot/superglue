import { JSONMappable, AllFragments, Unproxy } from '../types'
import { RefObject } from 'react'

type AccessKeyType = string | symbol | number

// Symbol for accessing original data from proxy
const ORIGINAL_TARGET = Symbol('@@originalTarget')

const ARRAY_GETTER_METHODS = new Set<AccessKeyType>([
  Symbol.iterator,
  'at',
  'concat',
  'entries',
  'every',
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
  'toString',
  'values',
])

const ARRAY_SETTER_METHODS = new Set<AccessKeyType>([
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
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
  return Number.isInteger(num) ? num : null
}

function isFragmentReference(value: unknown): value is { __id: string } {
  return (
    !!value &&
    typeof value === 'object' &&
    '__id' in value &&
    typeof value.__id === 'string'
  )
}

function createArrayProxy(
  arrayData: unknown[],
  fragments: RefObject<AllFragments>,
  dependencies: Set<string>,
  proxyCache: WeakMap<object, unknown>
): unknown[] {
  if (proxyCache && proxyCache.has(arrayData)) {
    return proxyCache.get(arrayData) as unknown[]
  }

  const proxy = new Proxy(arrayData, {
    get(target, prop) {
      // Return original target for unproxy functionality
      if (prop === ORIGINAL_TARGET) {
        return target
      }

      // Handle array methods
      if (isArrayGetter(prop)) {
        const method = target[prop]
        if (typeof method === 'function') {
          return function (...args: unknown[]) {
            // Apply the method directly to the proxy
            // The proxy's numeric index handler will resolve fragments as needed
            return Reflect.apply(method, proxy, args)
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
          const fragmentData = fragments.current[item.__id]

          if (!fragmentData) {
            throw new Error(`Fragment with id "${item.__id}" not found`)
          }

          return createProxy(fragmentData, fragments, dependencies, proxyCache)
        }

        if (typeof item === 'object' && item !== null) {
          if ('$$typeof' in item) {
            // Handle React elements - pass through without proxying
            return item
          } else {
            return createProxy(
              item as JSONMappable,
              fragments,
              dependencies,
              proxyCache
            )
          }
        }

        return item
      }

      // Handle other array properties (length, etc.)
      return Reflect.get(target, prop)
    },

    has(target, prop) {
      if (prop === ORIGINAL_TARGET) {
        return true
      }
      return Reflect.has(target, prop)
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

  if (proxyCache) {
    proxyCache.set(arrayData, proxy)
  }

  return proxy
}

function createObjectProxy(
  objectData: object,
  fragments: RefObject<AllFragments>,
  dependencies: Set<string>,
  proxyCache: WeakMap<object, unknown>
): unknown {
  if (proxyCache && proxyCache.has(objectData)) {
    return proxyCache.get(objectData)
  }

  const proxy = new Proxy(objectData as Record<string | symbol, unknown>, {
    get(target: Record<string | symbol, unknown>, prop: string | symbol) {
      // Return original target for unproxy functionality
      if (prop === ORIGINAL_TARGET) {
        return target
      }

      const value = target[prop]

      if (isFragmentReference(value)) {
        dependencies.add(value.__id)
        const fragmentData = fragments.current[value.__id]

        if (!fragmentData) {
          throw new Error(`Fragment with id "${value.__id}" not found`)
        }

        return createProxy(fragmentData, fragments, dependencies, proxyCache)
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

    has(target, prop) {
      if (prop === ORIGINAL_TARGET) {
        return true
      }
      return Reflect.has(target, prop)
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

  if (proxyCache) {
    proxyCache.set(objectData, proxy)
  }

  return proxy
}

export function createProxy<T extends JSONMappable>(
  content: T,
  fragments: RefObject<AllFragments>,
  dependencies: Set<string>,
  proxyCache: WeakMap<object, unknown>
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

export function unproxy<T>(proxy: T): Unproxy<T> {
  if (proxy && typeof proxy === 'object' && ORIGINAL_TARGET in proxy) {
    return proxy[ORIGINAL_TARGET] as Unproxy<T>
  }
  return proxy as Unproxy<T>
}
