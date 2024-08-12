import * as actions from './actions'
import { Dispatch, JSONValue, RootState } from './types'
import { getIn } from './utils/immutability'
import { Middleware } from 'redux'
import { KeyPathError } from './utils/immutability'

const actionValues = Object.values(actions).map((action) => action.toString())

/**
 * A middleware that will update all {@link Fragment} across the {@link
 * AllPages} slice, if a fragment on any page was mutated.
 *
 * @experimental
 */
const fragmentMiddleware: Middleware<unknown, RootState, Dispatch> =
  (store) => (next) => (action) => {
    const prevState = store.getState()
    const nextAction = next(action)
    const nextState = store.getState()
    if (
      !(
        action instanceof Object &&
        'type' in action &&
        typeof action.type === 'string'
      )
    ) {
      return nextAction
    }

    const type = action.type

    if (actionValues.includes(type)) {
      return nextAction
    }

    if (prevState.pages === nextState.pages) {
      return nextAction
    }

    const changedFragments: Record<string, JSONValue> = {}
    const changedKeys = Object.keys(nextState.pages).filter((key) => {
      return prevState.pages[key] !== nextState.pages[key]
    })

    if (changedKeys.length === 0) {
      return nextAction
    }

    changedKeys.forEach((key) => {
      nextState.pages[key].fragments.forEach((fragment) => {
        const { type, path } = fragment
        const nextPage = nextState.pages[key]
        const prevPage = prevState.pages[key]
        let nextFragment, prevFragment

        try {
          prevFragment = getIn(prevPage, path)
          nextFragment = getIn(nextPage, path)
        } catch (err) {
          if (err instanceof KeyPathError) {
            console.warn(err.message)
          } else {
            throw err
          }
        }

        if (
          nextFragment !== undefined &&
          prevFragment !== undefined &&
          nextFragment !== prevFragment &&
          nextFragment
        ) {
          changedFragments[type] = nextFragment
        }
      })
    })

    if (Object.keys(changedFragments).length === 0) {
      return nextAction
    }

    store.dispatch({
      type: actions.UPDATE_FRAGMENTS,
      payload: {
        changedFragments,
      },
    })

    return nextAction
  }

export { fragmentMiddleware }
