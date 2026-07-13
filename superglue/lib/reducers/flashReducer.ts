import type { Action } from '@reduxjs/toolkit'
import {
  beforeVisit,
  receiveResponse,
  clearFlash,
  flash,
  resetStore,
} from '../actions'
import { FlashState } from '../types'

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
