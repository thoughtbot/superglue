import * as actions from './actions'
import { getIn } from './utils/immutability'

const actionValues = Object.values(actions)

const fragmentMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState()
  const nextAction = next(action)
  let nextState = store.getState()

  if (actionValues.includes(action.type)) {
    return nextAction
  }

  if (prevState.pages === nextState.pages) {
    return nextAction
  }

  let changedFragments = {}
  let changedKeys = Object.keys(nextState.pages).filter((key) => {
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
        if (err.name == 'KeyPathError') {
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
