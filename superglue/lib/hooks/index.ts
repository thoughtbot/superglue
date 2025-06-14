import { useSelector } from 'react-redux'
import { JSONMappable, Page, RootState, SuperglueState, AllFragments } from '../types'
export { useFragment } from './useFragment'

/**
 * A lightweight hook that grabs the superglue state from the store.
 */
export function useSuperglue() {
  return useSelector<RootState, SuperglueState>((state) => state.superglue)
}

/**
 * A lightweight hook that grabs the current page's content from the store.
 */
export function useContent<T = JSONMappable>() {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  return useSelector<RootState<T>, Page<T>>(
    (state) => state.pages[currentPageKey]
  ).data
}

type ContentSelector<T, R> = (content: T) => R
type ProxiedContent<T> = T & {
  [K in keyof T]: T[K] extends { __id: string } 
    ? T[K] & (() => any)
    : T[K] extends (infer U)[] 
      ? ProxiedContent<U>[]
      : T[K] extends object
        ? ProxiedContent<T[K]>
        : T[K]
}

function createContentProxy<T extends JSONMappable>(
  content: T, 
  fragments: AllFragments
): ProxiedContent<T> {
  return new Proxy(content as any, {
    get(target: any, prop: string | symbol) {
      const value = target[prop]
      
      if (value && typeof value === 'object') {
        if (value.__id && typeof value.__id === 'string') {
          const fragmentRef = { ...value }
          const callable = () => fragments[value.__id]
          Object.setPrototypeOf(callable, fragmentRef)
          Object.assign(callable, fragmentRef)
          return callable
        }
        
        if (Array.isArray(value)) {
          return new Proxy(value, {
            get(target, prop) {
              const item = target[prop]
              
              if (item && typeof item === 'object') {
                if (item.__id && typeof item.__id === 'string') {
                  const fragmentRef = { ...item }
                  const callable = () => fragments[item.__id]
                  Object.setPrototypeOf(callable, fragmentRef)
                  Object.assign(callable, fragmentRef)
                  return callable
                }
                
                return createContentProxy(item, fragments)
              }
              
              return item
            }
          })
        }
        
        return createContentProxy(value, fragments)
      }
      
      return value
    }
  })
}

/**
 * Enhanced version of useContent with proxy support for fragment resolution.
 * Can be used with or without a selector function.
 */
export function useContentV2<T = JSONMappable>(): T
export function useContentV2<T = JSONMappable, R = any>(
  selector: ContentSelector<ProxiedContent<T>, R>
): R
export function useContentV2<T = JSONMappable, R = any>(
  selector?: ContentSelector<ProxiedContent<T>, R>
) {
  const superglueState = useSuperglue()
  const currentPageKey = superglueState.currentPageKey

  if (!selector) {
    return useSelector<RootState<T>, T>(
      (state) => state.pages[currentPageKey].data
    )
  }

  return useSelector<RootState<T>, R>((state) => {
    const pageData = state.pages[currentPageKey].data
    const fragments = state.fragments
    const proxiedContent = createContentProxy(pageData, fragments)
    return selector(proxiedContent)
  })
}
