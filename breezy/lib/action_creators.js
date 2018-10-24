import {
  argsForFetch,
  parseResponse
} from './utils/request'
import 'cross-fetch'
import {
  uuidv4,
  isGraft,
  extractNodeAndPath,
  parseSJR,
} from './utils/helpers'
import {needsRefresh} from './window'
import {withoutBZParams} from './utils/url'
import {
  SAVE_RESPONSE,
  HANDLE_GRAFT,
  SET_IN_PAGE,
  DEL_IN_PAGE,
  EXTEND_IN_PAGE,
  SET_IN_JOINT,
  DEL_IN_JOINT,
  EXTEND_IN_JOINT,
  BEFORE_FETCH,
  BREEZY_ERROR,
  OVERRIDE_VISIT_SEQ,
  UPDATE_ALL_JOINTS,
} from './actions'

export function saveResponse ({pageKey, page}) {
  pageKey = withoutBZParams(pageKey)

  return {
    type: SAVE_RESPONSE,
    payload: {
      pageKey,
      page,
    }
  }
}

export function handleGraft ({pageKey, node, pathToNode}) {
  pageKey = withoutBZParams(pageKey)

  return {
    type: HANDLE_GRAFT,
    payload: {
      pageKey,
      node,
      pathToNode,
    }
  }
}

export function setInPage ({pageKey, keypath, value}) {
  return {
    type: SET_IN_PAGE,
    payload: {
      pageKey,
      keypath,
      value
    }
  }
}

export function delInPage ({pageKey, keypath}) {
  return {
    type: DEL_IN_PAGE,
    payload: {
      pageKey,
      keypath,
    }
  }
}

export function extendInPage ({pageKey, keypath, value}) {
  return {
    type: EXTEND_IN_PAGE,
    payload:{
      pageKey,
      keypath,
      value
    }
  }
}

export function setInJoint ({name, keypath, value}) {
  return {
    type: SET_IN_JOINT,
    payload: {
      name,
      keypath,
      value
    }
  }
}

export function delInJoint ({name, keypath}) {
  return {
    type: DEL_IN_JOINT,
    payload: {
      name,
      keypath
    }
  }
}

export function extendInJoint ({name, keypath, value}) {
  return {
    type: EXTEND_IN_JOINT,
    payload: {
      name,
      keypath,
      value
    }
  }
}

export function beforeFetch (payload) {
  return {
    type: BEFORE_FETCH,
    payload,
  }
}

export function handleError (err) {
  return {
    type: BREEZY_ERROR,
    payload: {
      message: err.message
    }
  }
}

export function saveAndProcessSJRPage (pageKey, pageSJR) {
  const page = parseSJR(pageSJR)
  return saveAndProcessPage(pageKey, page)
}

export function fetchDeferments (pageKey, {defers = []}) {
  pageKey = withoutBZParams(pageKey)

  return (dispatch) => {
    const fetches = defers.map(function ({url}){
      return dispatch(remote(url, {}, pageKey))
    })

    return Promise.all(fetches)
  }
}

export function updateAllJointsToMatch (pageKey) {
  pageKey = withoutBZParams(pageKey)

  return {
    type: UPDATE_ALL_JOINTS,
    payload: {
      pageKey
    }
  }
}

export function saveAndProcessPage (pageKey, page) {
  return (dispatch) => {
    pageKey = withoutBZParams(pageKey)
    if (isGraft(page)) {
      const {node, pathToNode} = extractNodeAndPath(page)
      dispatch(handleGraft({pageKey, node, pathToNode}))
    } else {
      dispatch(saveResponse({pageKey, page}))
    }

    dispatch(fetchDeferments(pageKey, page))
      .then(() => dispatch(updateAllJointsToMatch(pageKey)))
      .catch((error) => {
        dispatch({
          type: BREEZY_ERROR,
          payload: error.message
        })

        throw error
      })
  }
}

function handleFetchErr (err, fetchArgs, dispatch) {
  err.fetchArgs = fetchArgs
  err.url = fetchArgs[0]
  err.pageKey = withoutBZParams(fetchArgs[0])
  dispatch(handleError(err))
  throw err
}

export function wrappedFetch (fetchArgs) {
  return fetch(...fetchArgs)
    .then((response) => {
      const location = response.headers.get('x-breezy-location')
      const nextOpts = {...fetchArgs[1], body: undefined}
      if (location) {
        return wrappedFetch([location, {...nextOpts, method: 'GET'}])
      } else {
        return response
      }
    })
}

function buildMeta (pageKey, page, {assets}) {
  const prevAssets = assets
  const newAssets = page.assets
  pageKey = withoutBZParams(pageKey)

  return {
    pageKey,
    page,
    screen: page.screen,
    needsRefresh: needsRefresh(prevAssets, newAssets)
  }
}

export function remote (pathQuery, {method = 'GET', headers, body = ''} = {}, pageKey) {
  if (!pageKey) {
    throw new Error('pageKey is a required parameter')
  }

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {method, headers, body})

    dispatch(beforeFetch({fetchArgs}))

    return wrappedFetch(fetchArgs)
      .then(parseResponse)
      .then(({rsp, page}) => {
        pageKey = withoutBZParams(pageKey)
        const {breezy} = getState()
        const meta = {
          ...buildMeta(pageKey, page, breezy),
          rsp
        }
        dispatch(saveAndProcessPage(pageKey, page))

        return meta
      })
      .catch(e => handleFetchErr(e, fetchArgs, dispatch))
  }
}

function extractPageKey (pathQuery, {method = 'GET'}, rsp) {
  if (method === 'GET') {
    return pathQuery
  } else {
    const responseUrl = rsp.headers.get('x-response-url')
    const contentLocation = rsp.headers.get('content-location')

    return contentLocation || responseUrl
  }
}

function canNavigate (seqId, {controlFlows}) {
  if (controlFlows['visit'] === seqId ) {
    return true
  } else {
    return false
  }
}

export function visit (pathQuery, {method = 'GET', headers, body = ''} = {}, pageKey) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {headers, body, method})
    const seqId = uuidv4()

    dispatch(beforeFetch({fetchArgs}))
    dispatch({
      type: OVERRIDE_VISIT_SEQ,
      payload: {
        seqId
      }
    })

    return wrappedFetch(fetchArgs)
      .then(parseResponse)
      .then(({rsp, page}) => {
        pageKey = pageKey || extractPageKey(...[...fetchArgs, rsp])
        pageKey = withoutBZParams(pageKey)

        const {breezy} = getState()
        const meta = {
          ...buildMeta(pageKey, page, breezy),
          rsp
        }
        dispatch(saveAndProcessPage(pageKey, page))

        return {...meta, canNavigate: canNavigate(seqId, breezy)}
      })
      .catch(e => handleFetchErr(e, fetchArgs, dispatch))
  }
}
