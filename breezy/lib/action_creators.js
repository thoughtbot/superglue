import {
  argsForFetch,
  parseResponse
} from './utils/request'
import parse from 'url-parse'
import 'cross-fetch'
import {
  uuidv4,
  isGraft,
  extractNodeAndPath,
  parseSJR,
} from './utils/helpers'
import {needsRefresh} from './window'
import {
  withoutBZParams,
  withoutBusters,
} from './utils/url'
import {
  SAVE_RESPONSE,
  HANDLE_GRAFT,
  BEFORE_FETCH,
  BREEZY_ERROR,
  BREEZY_GRAFTING_ERROR,
  MATCH_FRAGMENTS_IN_PAGE,
  OVERRIDE_VISIT_SEQ,
  UPDATE_ALL_FRAGMENTS,
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

export function handleGraft ({pageKey, node, pathToNode, fragments={}}) {
  pageKey = withoutBZParams(pageKey)

  return {
    type: HANDLE_GRAFT,
    payload: {
      pageKey,
      node,
      pathToNode,
      fragments
    }
  }
}

function beforeFetch (payload) {
  return {
    type: BEFORE_FETCH,
    payload,
  }
}

function handleError (err) {
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

function fetchDeferments (pageKey, {defers = []}) {
  pageKey = withoutBZParams(pageKey)
  return (dispatch) => {
    const fetches = defers.map(function ({url}){
      return dispatch(remote(url, {}, pageKey)).catch((err) => {
        let parsedUrl = new parse(url, true)
        const keyPath = parsedUrl.query._bz

        dispatch({
          type: BREEZY_GRAFTING_ERROR,
          payload: {
            url,
            err,
            pageKey,
            keyPath,
          }
        })
      })
    })

    return Promise.all(fetches)
  }
}

function updateAllFragmentsToMatch (pageKey) {
  pageKey = withoutBZParams(pageKey)

  return {
    type: UPDATE_ALL_FRAGMENTS,
    payload: {
      pageKey
    }
  }
}

function updateFragmentsInPageToMatch ({pageKey, lastFragmentName, lastFragmentPath}) {
  pageKey = withoutBZParams(pageKey)

  return {
    type: MATCH_FRAGMENTS_IN_PAGE,
    payload: {
      pageKey,
      lastFragmentName,
      lastFragmentPath,
    }
  }
}

export function saveAndProcessPage (pageKey, page) {
  return (dispatch) => {
    pageKey = withoutBZParams(pageKey)

    const {
      fragments,
      lastFragmentName,
      lastFragmentPath
    } = page

    if (isGraft(page)) {
      const {node, pathToNode} = extractNodeAndPath(page)
      dispatch(handleGraft({fragments, pageKey, node, pathToNode}))

      if (lastFragmentName) {
        dispatch(updateFragmentsInPageToMatch({
          pageKey,
          lastFragmentName,
          lastFragmentPath,
        }))
      }
    } else {
      dispatch(saveResponse({pageKey, page}))
    }

    dispatch(updateAllFragmentsToMatch(pageKey))
    return dispatch(fetchDeferments(pageKey, page))
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
        return wrappedFetch([location, {...nextOpts, method: 'GET', _redirected: true}])
      } else {
        if (fetchArgs[1] && fetchArgs[1]._redirected) {
          response._redirected = true
        }
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
  pathQuery = withoutBusters(pathQuery)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {method, headers, body})

    dispatch(beforeFetch({fetchArgs}))

    return wrappedFetch(fetchArgs)
      .then(parseResponse)
      .then(({rsp, page}) => {
        pageKey = pageKey || extractPageKey(...[...fetchArgs, rsp])
        pageKey = withoutBZParams(pageKey)
        const {breezy} = getState()
        const meta = {
          ...buildMeta(pageKey, page, breezy),
          redirected: rsp._redirected,
          rsp,
          fetchArgs,
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

export function ensureSingleVisit (fn) {
  return (dispatch, getState) => {
    const seqId = uuidv4()
    dispatch({
      type: OVERRIDE_VISIT_SEQ,
      payload: {
        seqId
      }
    })

    return fn().then((obj) => {
      const {breezy} = getState()
      return {...obj, canNavigate: canNavigate(seqId, breezy)}
    })
  }
}

export function visit (pathQuery, {method = 'GET', headers, body = ''} = {}, pageKey) {
  pathQuery = withoutBZParams(pathQuery)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {headers, body, method})

    return ensureSingleVisit(() => {
      return remote(pathQuery, {method, headers, body}, pageKey)(dispatch, getState)
    })(dispatch, getState).catch(e => handleFetchErr(e, fetchArgs, dispatch))
  }
}
