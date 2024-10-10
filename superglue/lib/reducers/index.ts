import { setIn, getIn, urlToPageKey } from '../utils'
import {
  SAVE_RESPONSE,
  HANDLE_GRAFT,
  historyChange,
  copyPage,
  UPDATE_FRAGMENTS,
  setCSRFToken,
  removePage,
} from '../actions'
import { config } from '../config'
import {
  AllPages,
  Page,
  PageReducerAction,
  VisitResponse,
  Fragment,
  GraftResponse,
  SuperglueState,
  SuperglueReducerAction,
  SaveResponseAction,
  SetCSRFToken,
  HandleGraftAction,
  UpdateFragmentsAction,
  CopyAction,
  RemovePageAction,
  JSONMappable,
} from '../types'
import { UnknownAction } from 'redux'

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

function saveResponse(
  state: AllPages,
  pageKey: string,
  page: VisitResponse
): AllPages {
  state = { ...state }

  let nextPage: Page = {
    pageKey,
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

export function handleGraft(
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

export function pageReducer(
  state: AllPages = {},
  action: PageReducerAction | UnknownAction
): AllPages {
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

  switch (action.type) {
    case SAVE_RESPONSE: {
      const { pageKey, page } = action.payload as SaveResponseAction['payload']
      return saveResponse(state, pageKey, page)
    }
    case HANDLE_GRAFT: {
      const { pageKey, page } = action.payload as HandleGraftAction['payload']

      return handleGraft(state, pageKey, page)
    }
    case UPDATE_FRAGMENTS: {
      const { changedFragments } =
        action.payload as UpdateFragmentsAction['payload']
      let nextState = state

      Object.entries(state).forEach(([pageKey, page]) => {
        page.fragments.forEach((fragment) => {
          const { type, path } = fragment
          const changedNode = changedFragments[type]
          const currentNode = getIn(nextState, `${pageKey}.${path}`)

          if (type in changedFragments && changedNode !== currentNode) {
            const nextNode = JSON.parse(JSON.stringify(changedNode))
            nextState = setIn(nextState, `${pageKey}.${path}`, nextNode)
          }
        })
      })

      return nextState
    }
    default:
      return state
  }
}

export function superglueReducer(
  state: Partial<SuperglueState> = {},
  action: SuperglueReducerAction | UnknownAction
): Partial<SuperglueState> {
  if (setCSRFToken.match(action)) {
    const { csrfToken } = action.payload as SetCSRFToken['payload']
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

  switch (action.type) {
    case SAVE_RESPONSE: {
      const {
        page: { csrfToken, assets },
      } = action.payload as SaveResponseAction['payload']

      return { ...state, csrfToken, assets }
    }
    default:
      return state
  }
}

export const rootReducer = {
  superglue: superglueReducer,
  pages: pageReducer,
}
