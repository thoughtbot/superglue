import { parsePageKey } from '../utils'
import type { Action } from '@reduxjs/toolkit'
import {
  saveResponse,
  historyChange,
  setCSRFToken,
  setActivePage,
  resetStore,
} from '../actions'
import { SuperglueState } from '../types'

const initialSuperglueState: SuperglueState = {
  currentPageKey: '',
  search: {},
  assets: [],
}

export function superglueReducer(
  state: SuperglueState = initialSuperglueState,
  action: Action
): SuperglueState {
  if (action.type === resetStore.type) {
    return initialSuperglueState
  }

  if (setCSRFToken.match(action)) {
    const { csrfToken } = action.payload
    return { ...state, csrfToken: csrfToken }
  }

  if (setActivePage.match(action)) {
    const { pageKey } = action.payload
    const { search } = parsePageKey(pageKey)

    return {
      ...state,
      search,
      currentPageKey: pageKey,
    }
  }

  if (historyChange.match(action)) {
    const { pageKey } = action.payload
    const { search } = parsePageKey(pageKey)

    return {
      ...state,
      currentPageKey: pageKey,
      search,
    }
  }

  if (saveResponse.match(action)) {
    const {
      page: { csrfToken, assets },
    } = action.payload

    return { ...state, csrfToken, assets }
  }

  return state
}
