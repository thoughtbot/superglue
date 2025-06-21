import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { produce } from 'immer'
import { RootState, AllFragments } from '../types'

function isFragmentReference(value: any): value is { __id: string } {
  return value && typeof value === 'object' && typeof value.__id === 'string'
}

export function createFragment(fragmentId: string, data: any) {
  return {
    type: 'createFragment',
    fragmentId,
    data
  }
}

function createMutationProxy(
  draft: any,
  fragments: AllFragments,
  updateFragment: (fragmentId: string, updater: (draft: any) => void) => void,
  createNewFragment?: (fragmentId: string, data: any) => void
): any {
  if (!draft || typeof draft !== 'object') {
    return draft
  }

  return new Proxy(draft, {
    get(target, prop) {
      const value = target[prop]

      // Handle fragment references - return function for "entering" fragment
      if (isFragmentReference(value)) {
        return (callback: (fragmentDraft: any) => void) => {
          updateFragment(value.__id, callback)
        }
      }

      // Handle arrays that might contain fragment references
      if (Array.isArray(value)) {
        return new Proxy(value, {
          get(arrayTarget, arrayProp) {
            const arrayIndex = Number(arrayProp)
            
            // Handle numeric indices that might be fragment references
            if (!isNaN(arrayIndex) && arrayIndex >= 0 && arrayIndex < arrayTarget.length) {
              const item = arrayTarget[arrayIndex]
              
              if (isFragmentReference(item)) {
                // Return function for entering this fragment
                return (callback: (fragmentDraft: any) => void) => {
                  updateFragment(item.__id, callback)
                }
              }
              
              // Regular array item
              return item
            }

            // Handle array methods and properties
            if (arrayProp === 'push') {
              return function(...items: any[]) {
                items.forEach(item => {
                  if (item && item.type === 'createFragment') {
                    // Create fragment first, then push reference
                    if (createNewFragment) {
                      createNewFragment(item.fragmentId, item.data)
                    }
                    arrayTarget.push({ __id: item.fragmentId })
                  } else {
                    // Regular push
                    arrayTarget.push(item)
                  }
                })
              }
            }

            // Handle other array methods/properties normally
            const arrayMethod = arrayTarget[arrayProp as keyof Array<any>]
            if (typeof arrayMethod === 'function') {
              return arrayMethod.bind(arrayTarget)
            }
            
            return arrayMethod
          }
        })
      }

      // Handle nested objects
      if (value && typeof value === 'object') {
        return createMutationProxy(value, fragments, updateFragment)
      }

      return value
    },

    set(target, prop, newValue) {
      target[prop] = newValue
      return true
    }
  })
}

export function useUpdateFragment() {
  const dispatch = useDispatch()
  const fragments = useSelector((state: RootState) => state.fragments)

  const updateFragment = useCallback((fragmentId: string, updater: (draft: any) => void) => {
    const currentFragment = fragments[fragmentId]
    if (!currentFragment) {
      throw new Error(`Fragment with id "${fragmentId}" not found`)
    }

    const updatedFragment = produce(currentFragment, draft => {
      // Create proxy for nested fragment references within this fragment
      const proxiedDraft = createMutationProxy(draft, fragments, updateFragment)
      updater(proxiedDraft)
    })
    
    // Dispatch action to save the updated fragment
    dispatch({
      type: 'superglue/saveFragment',
      payload: {
        fragmentKey: fragmentId,
        fragment: updatedFragment
      }
    })
  }, [dispatch, fragments])

  const updateFragmentWithProxy = useCallback((fragmentId: string, updater: (proxiedDraft: any) => void) => {
    const currentFragment = fragments[fragmentId]
    if (!currentFragment) {
      throw new Error(`Fragment with id "${fragmentId}" not found`)
    }

    const updatedFragment = produce(currentFragment, draft => {
      const proxiedDraft = createMutationProxy(draft, fragments, updateFragment)
      updater(proxiedDraft)
    })
    
    // Dispatch action to save the updated fragment
    dispatch({
      type: 'superglue/saveFragment',
      payload: {
        fragmentKey: fragmentId,
        fragment: updatedFragment
      }
    })
  }, [dispatch, fragments, updateFragment])

  return {
    updateFragment,
    updateFragmentWithProxy
  }
}