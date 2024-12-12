import { setIn, getIn, urlToPageKey } from '../utils'
import type { Action } from '@reduxjs/toolkit'
import {
  saveResponse,
  handleGraft,
  historyChange,
  copyPage,
  setCSRFToken,
  removePage,
} from '../actions'
import { config } from '../config'
import {
  AllPages,
  Page,
  VisitResponse,
  Fragment,
  GraftResponse,
  SuperglueState,
  JSONMappable,
} from '../types'

function addPlaceholdersToDeferredNodes(existingPage: Page, page: Page): Page {
  const { defers = [] } = existingPage

  const prevDefers = defers.map(({ path }) => {
    const node = getIn(existingPage, path)
    const copy = JSON.stringify(node)
    return [path, JSON.parse(copy)]
  })

  return prevDefers.reduce((memo, [path, node]) => {
    return setIn(page, path, node)
  }, page)
}

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
  page: VisitResponse
): AllPages {
  state = { ...state }

  let nextPage: Page = {
    // pageKey,
    ...page,
    savedAt: Date.now(),
  }

  const existingPage = state[pageKey]

  if (existingPage) {
    nextPage = addPlaceholdersToDeferredNodes(existingPage, nextPage)
  }
  constrainPagesSize(state)
  state[pageKey] = nextPage

  return state
}

export function appendReceivedFragmentsOntoPage(
  state: AllPages,
  pageKey: string,
  receivedFragments: Fragment[]
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

export function graftNodeOntoPage(
  state: AllPages,
  pageKey: string,
  node: JSONMappable,
  pathToNode: string
): AllPages {
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
      graftNodeOntoPage(nextState, pageKey, receivedNode, pathToNode),
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
    pathname: '',
    currentPageKey: '',
    search: '',
    hash: '',
    assets: [],
  },
  action: Action
): SuperglueState {
  if (setCSRFToken.match(action)) {
    const { csrfToken } = action.payload
    return { ...state, csrfToken: csrfToken }
  }

  if (historyChange.match(action)) {
    const { pathname, search, hash } = action.payload
    const currentPageKey = urlToPageKey(pathname + search)

    return {
      ...state,
      currentPageKey,
      pathname,
      search,
      hash,
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

export const rootReducer = {
  superglue: superglueReducer,
  pages: pageReducer,
}
