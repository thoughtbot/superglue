import type { Action } from '@reduxjs/toolkit'
import {
  handleFragmentGraft,
  saveFragment,
  updateFragment,
  removeFragments,
  appendToFragment,
  prependToFragment,
  resetStore,
  beforeVisit,
  receiveResponse,
  clearFlash,
  flash,
} from '../actions'
import {
  JSONMappable,
  AllFragments,
  FlashState,
  GraftResponse,
} from '../types'
import {
  pageReducer,
  appendReceivedFragmentsOntoPage,
  graftNodeOntoTarget,
} from './pageReducer'
import { superglueReducer } from './superglueReducer'

export { pageReducer, appendReceivedFragmentsOntoPage, graftNodeOntoTarget }
export { superglueReducer }

function handleFragmentGraftResponse(
  state: AllFragments,
  key: string,
  response: GraftResponse
): AllFragments {
  const target = state[key]

  if (!target) {
    const error = new Error(
      `Superglue was looking for ${key} in your fragments, but could not find it.`
    )
    throw error
  }
  const { data: receivedNode, path: pathToNode } = response

  return graftNodeOntoTarget(state, key, receivedNode, pathToNode)
}

function upsertFragmentArray(
  state: AllFragments,
  fragmentId: string,
  data: JSONMappable,
  upsert: boolean,
  position: 'append' | 'prepend'
): AllFragments {
  const targetFragment = state[fragmentId]

  if (targetFragment === undefined) {
    console.warn(
      `Superglue: could not find fragment "${fragmentId}" to ${position} to.`
    )
    return state
  }

  if (!Array.isArray(targetFragment)) {
    console.warn(
      `Superglue: cannot ${position} to fragment "${fragmentId}" because it is not an array.`
    )
    return state
  }

  if (upsert && 'id' in data) {
    const index = targetFragment.findIndex((val) => {
      return val && typeof val === 'object' && 'id' in val && val.id === data.id
    })

    if (index > -1) {
      const next = [...targetFragment]
      next[index] = data
      return { ...state, [fragmentId]: next }
    }
  }

  const next =
    position === 'append'
      ? [...targetFragment, data]
      : [data, ...targetFragment]

  return { ...state, [fragmentId]: next }
}

export function fragmentReducer(
  state: AllFragments = {},
  action: Action
): AllFragments {
  if (action.type === resetStore.type) {
    return {}
  }

  if (removeFragments.match(action)) {
    const { fragmentIds } = action.payload
    const next = { ...state }
    for (const id of fragmentIds) {
      delete next[id]
    }
    return next
  }

  if (handleFragmentGraft.match(action)) {
    const { fragmentId, response } = action.payload
    return handleFragmentGraftResponse(state, fragmentId, response)
  }

  if (saveFragment.match(action)) {
    const { fragmentId, data } = action.payload

    return {
      ...state,
      [fragmentId]: data,
    }
  }

  if (updateFragment.match(action)) {
    const { fragmentId, data } = action.payload

    return {
      ...state,
      [fragmentId]: data,
    }
  }

  if (appendToFragment.match(action)) {
    const { data, fragmentId, upsert } = action.payload
    return upsertFragmentArray(state, fragmentId, data, upsert, 'append')
  }

  if (prependToFragment.match(action)) {
    const { data, fragmentId, upsert } = action.payload
    return upsertFragmentArray(state, fragmentId, data, upsert, 'prepend')
  }

  return state
}

export function flashReducer(
  state: FlashState = {},
  action: Action
): FlashState {
  if (action.type === resetStore.type) {
    return {}
  }

  if (beforeVisit.match(action)) {
    return {}
  }

  if (clearFlash.match(action)) {
    const { key } = action.payload
    if (!key) {
      return {}
    }

    const next = { ...state }
    delete next[key]
    return next
  }

  if (flash.match(action)) {
    return {
      ...state,
      ...action.payload.flash,
    }
  }

  if (receiveResponse.match(action)) {
    const { response } = action.payload

    if (response.flash) {
      return {
        ...state,
        ...response.flash,
      }
    }

    return state
  }

  return state
}

export const rootReducer = {
  superglue: superglueReducer,
  pages: pageReducer,
  fragments: fragmentReducer,
  flash: flashReducer,
}
