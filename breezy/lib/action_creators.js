import {
  argsForFetch,
  parseResponse
} from './utils/request'
import {getIn} from'./utils/immutability'
import parse from 'url-parse'
import 'cross-fetch'
import {
  uuidv4,
  isGraft,
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

export function handleGraft ({pageKey, page}) {
  pageKey = withoutBZParams(pageKey)

  return {
    type: HANDLE_GRAFT,
    payload: {
      pageKey,
      page,
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

function fetchDeferments (pageKey, defers = []) {
  pageKey = withoutBZParams(pageKey)
  return (dispatch) => {
    const fetches = defers.filter(({type}) => type === 'auto').map(function ({url}){
      return dispatch(remote(url, {}, pageKey)).catch((err) => {
        let parsedUrl = new parse(url, true)
        const keyPath = parsedUrl.query.bzq

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

function updateAllFragmentsWith (fragments) {

  return {
    type: UPDATE_ALL_FRAGMENTS,
    payload: {
      fragments
    }
  }
}

function receivedPagetoFragmentList ({fragments = {}, data, path, action}) {
  const fragmentNameToNode = {}

  if (action) {
    Object.keys(fragments).forEach((digest) => {
      fragments[digest].forEach((fpath) => {
        if (!fragmentNameToNode[digest]) {
          const start = path.split('.').length
          const actualPath = fpath.split('.').slice(start).join('.')
          const updatedNode = getIn(data, actualPath)
          fragmentNameToNode[digest] = updatedNode
        }
      })
    })
  } else {
    Object.keys(fragments).forEach((digest) => {
      fragments[digest].forEach((fpath) => {
        if (!fragmentNameToNode[digest]) {
          const updatedNode = getIn({data}, fpath)
          fragmentNameToNode[digest] = updatedNode
        }
      })
    })
  }

  return fragmentNameToNode
}

export function saveAndProcessPage (pageKey, page) {
  return (dispatch) => {
    pageKey = withoutBZParams(pageKey)

    const {
      defers = [],
    } = page

    if (isGraft(page)) {
      if (pageKey) {
        dispatch(handleGraft({pageKey, page}))
      }
    } else {
      dispatch(saveResponse({pageKey, page}))
    }

    const receivedFragments = receivedPagetoFragmentList(page)

    dispatch(updateAllFragmentsWith(receivedFragments))
    return dispatch(fetchDeferments(pageKey, defers))
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

//TODO: Provide a connected component for refresh
function buildMeta (pageKey, page, state) {
  const {assets: prevAssets} = state
  const {assets: nextAssets} = page

  pageKey = withoutBZParams(pageKey)
  //TODO: needs refresh should dispatch, to get a nice, you need to reload your page
  return {
    pageKey,
    page,
    componentIdentifier: page.componentIdentifier,
    needsRefresh: needsRefresh(prevAssets, nextAssets)
  }
}

export function remote (pathQuery, {method = 'GET', headers, body = '', beforeSave = (prevPage, receivedPage) => (receivedPage)} = {}, pageKey) {
  pathQuery = withoutBusters(pathQuery)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {method, headers, body})

    dispatch(beforeFetch({fetchArgs}))

    return wrappedFetch(fetchArgs)
      .then(parseResponse)
      .then(({rsp, json}) => {
        pageKey = pageKey || extractPageKey(...[...fetchArgs, rsp])
        pageKey = withoutBZParams(pageKey)
        const {breezy, pages = {}} = getState()
        const meta = {
          ...buildMeta(pageKey, json, breezy),
          redirected: rsp._redirected,
          rsp,
          fetchArgs,
        }
        const page = beforeSave(pages[pageKey], json)
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

export function visit (pathQuery, {method = 'GET', headers, body = '', beforeSave = (prevPage, receivedPage) => (receivedPage)} = {}, pageKey) {
  pathQuery = withoutBZParams(pathQuery)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {headers, body, method})

    return ensureSingleVisit(() => {
      return remote(pathQuery, {method, headers, body, beforeSave}, pageKey)(dispatch, getState)
    })(dispatch, getState).catch(e => handleFetchErr(e, fetchArgs, dispatch))
  }
}
