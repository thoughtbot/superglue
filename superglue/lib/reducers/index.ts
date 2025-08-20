import { setIn, urlToPageKey, parsePageKey } from '../utils'
import type { Action } from '@reduxjs/toolkit'
import {
  saveResponse,
  handleGraft,
  historyChange,
  copyPage,
  setCSRFToken,
  setActivePage,
  removePage,
  handleFragmentGraft,
  saveFragment,
  appendToFragment,
  prependToFragment,
} from '../actions'
import { config } from '../config'
import {
  AllPages,
  Page,
  SaveResponse,
  FragmentPath,
  GraftResponse,
  SuperglueState,
  JSONMappable,
  AllFragments,
} from '../types'

function constrainPagesSize(state: AllPages) {
  const { maxPages } = config
  const allPageKeys = Object.keys(state)
  const cacheTimesRecentFirst = allPageKeys
    .map((key) => state[key].savedAt)
    .sort((a, b) => b - a)

  for (const key of Array.from(allPageKeys)) {
    if (state[key].savedAt <= cacheTimesRecentFirst[maxPages - 1]) {
      delete state[key]
    }
  }
}

function handleSaveResponse(
  state: AllPages,
  pageKey: string,
  page: SaveResponse
): AllPages {
  state = { ...state }

  const nextPage: Page = {
    ...page,
    savedAt: Date.now(),
  }
  constrainPagesSize(state)
  state[pageKey] = nextPage

  return state
}

export function appendReceivedFragmentsOntoPage(
  state: AllPages,
  pageKey: string,
  receivedFragments: FragmentPath[]
): AllPages {
  if (!pageKey) {
    return state
  }

  if (receivedFragments.length === 0) {
    return state
  }

  const currentPage = state[pageKey]
  const { fragments: prevFragments = [] } = currentPage
  const nextFragments = [...prevFragments]
  const existingKeys: Record<string, boolean> = {}
  prevFragments.forEach((frag) => (existingKeys[frag.path] = true))

  receivedFragments.forEach((frag) => {
    if (!existingKeys[frag.path]) {
      nextFragments.push(frag)
    }
  })

  const nextPage = {
    ...currentPage,
    fragments: nextFragments,
  }

  const nextState = { ...state }
  nextState[pageKey] = nextPage

  return nextState
}

export function graftNodeOntoTarget<T extends JSONMappable>(
  state: T,
  pageKey: string,
  node: JSONMappable,
  pathToNode: string
): T {
  if (!node) {
    console.warn(
      'There was no node returned in the response. Do you have the correct key path in your props_at?'
    )
    return state
  }

  if (!pathToNode || !pageKey) {
    return state
  }
  const fullPathToNode = [pageKey, pathToNode].join('.')
  return setIn(state, fullPathToNode, node)
}

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

function handleGraftResponse(
  state: AllPages,
  pageKey: string,
  page: GraftResponse
): AllPages {
  const currentPage = state[pageKey]
  if (!currentPage) {
    const error = new Error(
      `Superglue was looking for ${pageKey} in your state, but could not find it in your mapping. Did you forget to pass in a valid pageKey to this.props.remote or this.props.visit?`
    )
    throw error
  }
  const {
    data: receivedNode,
    path: pathToNode,
    fragments: receivedFragments = [],
  } = page

  return [
    (nextState: AllPages) =>
      graftNodeOntoTarget(nextState, pageKey, receivedNode, pathToNode),
    (nextState: AllPages) =>
      appendReceivedFragmentsOntoPage(nextState, pageKey, receivedFragments),
  ].reduce((memo, fn) => fn(memo), state)
}

export function pageReducer(state: AllPages = {}, action: Action): AllPages {
  if (removePage.match(action)) {
    const { pageKey } = action.payload
    const nextState = { ...state }
    delete nextState[pageKey]

    return nextState
  }

  if (copyPage.match(action)) {
    const nextState = { ...state }
    const { from, to } = action.payload

    nextState[urlToPageKey(to)] = JSON.parse(JSON.stringify(nextState[from]))

    return nextState
  }

  if (handleGraft.match(action)) {
    const { pageKey, page } = action.payload

    return handleGraftResponse(state, pageKey, page)
  }

  if (saveResponse.match(action)) {
    const { pageKey, page } = action.payload
    const nextState = handleSaveResponse(state, pageKey, page)
    return nextState
  }

  return state
}

export function superglueReducer(
  state: SuperglueState = {
    currentPageKey: '',
    search: {},
    assets: [],
  },
  action: Action
): SuperglueState {
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

export function fragmentReducer(
  state: AllFragments = {},
  action: Action
): AllFragments {
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

  if (appendToFragment.match(action)) {
    const { data, fragmentId } = action.payload
    let targetFragment = state[fragmentId]

    if (Array.isArray(targetFragment)) {
      targetFragment = [...targetFragment, data]

      return {
        ...state,
        [fragmentId]: targetFragment,
      }
    } else {
      return state
    }
  }

  if (prependToFragment.match(action)) {
    const { data, fragmentId } = action.payload
    let targetFragment = state[fragmentId]

    if (Array.isArray(targetFragment)) {
      targetFragment = [data, ...targetFragment]
      return {
        ...state,
        [fragmentId]: targetFragment,
      }
    } else {
      return state
    }
  }

  return state
}

export const rootReducer = {
  superglue: superglueReducer,
  pages: pageReducer,
  fragments: fragmentReducer,
}
