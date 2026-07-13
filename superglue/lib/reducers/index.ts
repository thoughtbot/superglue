import type { Action } from '@reduxjs/toolkit'
import {
  resetStore,
  beforeVisit,
  receiveResponse,
  clearFlash,
  flash,
} from '../actions'
import { FlashState } from '../types'
import {
  pageReducer,
  appendReceivedFragmentsOntoPage,
  graftNodeOntoTarget,
} from './pageReducer'
import { superglueReducer } from './superglueReducer'
import { fragmentReducer } from './fragmentReducer'

export { pageReducer, appendReceivedFragmentsOntoPage, graftNodeOntoTarget }
export { superglueReducer }
export { fragmentReducer }

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
