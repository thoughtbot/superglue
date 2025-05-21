import { setIn, getIn, urlToPageKey, parsePageKey } from '../utils'
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
  replaceFragment,
  // mergeFragment,
  // reverseMergeFragment,
  // beforeFragment,
  // afterFragment,
} from '../actions'
import { config } from '../config'
import {
  AllPages,
  Page,
  SaveResponse,
  Fragment,
  GraftResponse,
  SuperglueState,
  JSONMappable,
  AllFragments,
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
  page: SaveResponse
): AllPages {
  state = { ...state }

  let nextPage: Page = {
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
    const { fragmentKey, response } = action.payload
    return handleFragmentGraftResponse(state, fragmentKey, response)
  }

  if (saveFragment.match(action)) {
    const { fragmentKey, fragment } = action.payload

    return {
      ...state,
      [fragmentKey]: fragment,
    }
  }

  if (replaceFragment.match(action)) {
    const { target, data } = action.payload

    return {
      ...state,
      [target]: data,
    }
  }

  if (appendToFragment.match(action)) {
    const { data, target } = action.payload
    let targetFragment = state[target]

    if (Array.isArray(targetFragment)) {
      targetFragment = [...targetFragment, data]

      return {
        ...state,
        [target]: targetFragment,
      }
    } else {
      return state
    }
  }

  if (prependToFragment.match(action)) {
    const { data, target } = action.payload
    let targetFragment = state[target]

    if (Array.isArray(targetFragment)) {
      targetFragment = [data, ...targetFragment]
    }
    return {
      ...state,
      [target]: targetFragment,
    }
  }

  // if (mergeFragment.match(action)) {
  //   const { fragmentKey, fragment } = action.payload
  //   const targetFragment = state[fragmentKey]

  //   if (
  //     typeof targetFragment === 'object' &&
  //     !Array.isArray(targetFragment) &&
  //     targetFragment !== null
  //   ) {
  //     state[fragmentKey] = { ...targetFragment, ...fragment }
  //   }
  // }

  // if (reverseMergeFragment.match(action)) {
  //   const { fragmentKey, fragment } = action.payload
  //   const targetFragment = state[fragmentKey]

  //   if (
  //     typeof targetFragment === 'object' &&
  //     !Array.isArray(targetFragment) &&
  //     targetFragment !== null
  //   ) {
  //     state[fragmentKey] = { ...fragment, ...targetFragment }
  //   }
  // }

  // if (beforeFragment.match(action)) {
  //   const { fragmentKey, fragment, target, within } = action.payload
  //   let collection = state[within]

  //   if (Array.isArray(collection)) {
  //     const targetFragmentIndex = collection.findIndex((item) => {
  //       if (typeof item === 'object' && !Array.isArray(item) && item !== null) {
  //         return item['__id'] === target
  //       } else {
  //         return false
  //       }
  //     })

  //     if (targetFragmentIndex >= 0) {
  //       collection = [...collection]
  //       collection.splice(targetFragmentIndex, 0, { __id: fragmentKey })
  //     }
  //   }

  //   return {
  //     ...state,
  //     [fragmentKey]: fragment,
  //     [within]: collection,
  //   }
  // }

  // if (afterFragment.match(action)) {
  //   const { fragmentKey, fragment, target, within } = action.payload
  //   let collection = state[within]

  //   if (Array.isArray(collection)) {
  //     const targetFragmentIndex = collection.findIndex((item) => {
  //       if (typeof item === 'object' && !Array.isArray(item) && item !== null) {
  //         return item['__id'] === target
  //       } else {
  //         return false
  //       }
  //     })

  //     if (targetFragmentIndex >= 0) {
  //       collection = [...collection]
  //       collection.splice(targetFragmentIndex + 1, 0, { __id: fragmentKey })
  //     }
  //   }

  //   return {
  //     ...state,
  //     [fragmentKey]: fragment,
  //     [within]: collection,
  //   }
  // }

  return state
}

export const rootReducer = {
  superglue: superglueReducer,
  pages: pageReducer,
  fragments: fragmentReducer,
}
