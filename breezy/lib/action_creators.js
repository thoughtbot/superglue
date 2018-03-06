import {
  argsForFetch,
  parseResponse
} from './utils/request'
import 'cross-fetch'
import {uuidv4} from './utils/helpers'
import {needsRefresh} from './window'
import parse from 'url-parse'
import {pathQuery as convertToPathQuery, vanityPath} from './utils/url'

export function saveResponse ({pathQuery, page}) {
  return {
    type: 'BREEZY_SAVE_RESPONSE', pathQuery, page
  }
}

export function handleGraft ({pathQuery, page}) {
  return {
    type: 'BREEZY_HANDLE_GRAFT', pathQuery, page
  }
}

export function setInPage ({pathQuery, keypath, value}) {
  return {
    type: 'BREEZY_SET_IN_PAGE',
    pathQuery,
    keypath,
    value
  }
}

export function delInPage ({pathQuery, keypath}) {
  return {
    type: 'BREEZY_DEL_IN_PAGE',
    pathQuery,
    keypath,
  }
}

export function extendInPage ({pathQuery, keypath, value}) {
  return {
    type: 'BREEZY_EXTEND_IN_PAGE',
    pathQuery,
    keypath,
    value
  }
}

export function setInJoint ({name, keypath, value}) {
  return {
    type: 'BREEZY_SET_IN_JOINT',
    name,
    keypath,
    value
  }
}

export function delInJoint ({name, keypath}) {
  return {
    type: 'BREEZY_DEL_IN_JOINT',
    name,
    keypath
  }
}

export function extendInJoint ({name, keypath, value}) {
  return {
    type: 'BREEZY_EXTEND_IN_JOINT',
    name,
    keypath,
    value
  }
}

export function graftByKeypath (pathQuery, keypath, payload) {
  return {
    type: 'BREEZY_GRAFT_BY_KEYPATH',
    pathQuery,
    keypath,
    payload
  }
}

export function beforeFetch (opts) {
  return {...opts,
    type: 'BREEZY_BEFORE_FETCH'
  }
}

export function handleError (err) {
  return {
    type: 'BREEZY_FETCH_ERROR',
    payload: {
      error: err
    }
  }
}

function handleDeferments (defers=[], dispatch, pageKey) {
  defers.forEach(function ({url}){
    dispatch(remote(url, {}, pageKey)) //todo: ability to ignore and not clear queue
  })
}

export function persist ({pathQuery, page, dispatch}) {
  // Ignore the _bz attributes when storing
  const vanity = vanityPath(pathQuery)

  handleDeferments(page.defers, dispatch, vanity)
  if (page.action === 'graft') {
    return handleGraft({pathQuery: vanity, page})
  } else {
    return saveResponse({pathQuery: vanity, page})
  }
}
function handleFetchErr(err, fetchArgs, dispatch) {
  dispatch(handleError(err.message))
  err.fetchArgs = fetchArgs
  err.url = fetchArgs[0]
  err.pathQuery = convertToPathQuery(fetchArgs[0])
  throw err
}

export function wrappedFetch(fetchArgs, dispatch) {
  return fetch(...fetchArgs)
    .then((response) => {
      const location = response.headers.get('x-breezy-location')
      const nextOpts = {...fetchArgs[1], body: undefined}
      if (location) {
        return fetch(location, {...nextOpts, method: 'GET'})
      } else {
        return response
      }
    })
    .then(parseResponse)
}

const persistAndMeta = (state, rsp, page, pageKey, dispatch) => {
  const prevAssets = state.breezy.assets
  const newAssets = page.assets

  const baseUrl = state.breezy.baseUrl
  const actual = (pageKey).replace(baseUrl, '')
  const action = persist({pathQuery: pageKey, page, dispatch})
  const meta = {
    pageKey,
    page,
    screen: page.screen,
    rsp,
    needsRefresh: needsRefresh(prevAssets, newAssets)
  }
  dispatch(action)
  return meta
}

export function remote (pathQuery, {method = 'GET', headers, body = ''} = {}, pageKey) {
  if (!pageKey) {
    throw new Error('pageKey is a required parameter')
  }

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {method, headers, body})
    const fetchUrl = fetchArgs[0]

    dispatch({type: 'BREEZY_BEFORE_REMOTE'})
    dispatch(beforeFetch({fetchArgs}))

    return wrappedFetch(fetchArgs)
      .then(({rsp, page}) => persistAndMeta(getState(), rsp, page, pageKey, dispatch))
      .catch(e => handleFetchErr(e, fetchArgs, dispatch))
  }
}

export function visit(pathQuery, {method = 'GET', headers, body = ''} = {}, pageKey) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {headers, body, method})
    const fetchUrl = fetchArgs[0]

    const seqId = uuidv4()
    const controlFlows = getState().breezy.controlFlows
    const state = getState()
    let actualKey = null

    dispatch({type: 'BREEZY_BEFORE_VISIT'})
    dispatch(beforeFetch({fetchArgs}))
    dispatch({type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId})

    return wrappedFetch(fetchArgs)
      .then(({rsp, page}) => {
        const baseUrl = getState().breezy.baseUrl

        if (method === 'GET') {
          actualKey = pageKey || pathQuery
        } else {
          const responseUrl = rsp.headers.get('x-response-url')
          const contentLocation = rsp.headers.get('content-location')

          actualKey = (pageKey || contentLocation || responseUrl).replace(baseUrl, '')
        }

        const meta = persistAndMeta(getState(), rsp, page, actualKey, dispatch)

        if (controlFlows['visit'] === seqId ) {
          return {...meta, canNavigate: true}
        } else {
          dispatch({type: 'BREEZY_NOOP'})
          return {...meta, canNavigate: false}
        }
      })
      .catch(e => handleFetchErr(e, fetchArgs, dispatch))
  }
}
