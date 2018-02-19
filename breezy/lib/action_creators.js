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
    type: 'BREEZY_SET_IN_JOINT',
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

function handleDeferments (defers=[], dispatch) {
  defers.forEach(function ({url}){
    dispatch(remote(url)) //todo: ability to ignore and not clear queue
  })
}

export function persist ({pathQuery, page, dispatch}) {
  // Ignore the _bz attributes when storing
  const vanity = vanityPath(pathQuery)

  handleDeferments(page.defers, dispatch)
  if (page.action === 'graft') {
    return handleGraft({pathQuery: vanity, page})
  } else {
    return saveResponse({pathQuery: vanity, page})
  }
}

export function fetchWithFlow (fetchArgs, flow, dispatch) {
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
    .then(flow)
    .catch((err) => {
      dispatch(handleError(err.message))
      err.fetchArgs = fetchArgs
      err.url = fetchArgs[0]
      err.pathQuery = convertToPathQuery(fetchArgs[0])
      throw err
    })
}

export function visit () {
  const controlFlows = getState().breezy.controlFlows
  const seqId = uuidv4()

  dispatch({type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId})

  return remote(...arguments).then((meta) => {
    const responseUrl = rsp.headers.get('x-response-url')
    const contentLocation = rsp.headers.get('content-location')
    const shouldNotPersist = (method !== 'GET' && !contentLocation && !responseUrl)

    if (shouldNotPersist) {
      return {...meta, canNavigate: false}
    }

    if (controlFlows['visit'] === seqId ) {
      return {...meta, canNavigate: true}
    } else {
      dispatch({type: 'BREEZY_NOOP'})
      return {...meta, canNavigate: false}
    }
  })
}

export function visit (pathQuery, {contentType = null, method = 'GET', body = ''} = {}) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {pathQuery, contentType, body, method})
    const seqId = uuidv4()
    const fetchUrl = fetchArgs[0]

    const controlFlows = getState().breezy.controlFlows
    const state = getState()

    const flow = ({rsp, page}) => {
      const prevAssets = state.breezy.assets
      const newAssets = page.assets

      const responseUrl = rsp.headers.get('x-response-url')
      const contentLocation = rsp.headers.get('content-location')
      const shouldNotPersist = (method !== 'GET' && !contentLocation && !responseUrl)

      if (shouldNotPersist) {
        dispatch({type: 'BREEZY_NOOP', fetchArgs, message: 'Response was successful but was not a GET with content-location or x-response-url'})
        return {
          canNavigate: false
        }
      } else {
        const baseUrl = getState().breezy.baseUrl
        let actual = pathQuery

        if (method !== 'GET') {
          actual = (contentLocation || responseUrl).replace(baseUrl, '')
        }

        const meta = {
          url: actual, //todo: handle redirects with different origins
          pathQuery: convertToPathQuery(actual), //todo: handle redirects with different origins
          page,
          screen: page.screen,
          needsRefresh: needsRefresh(prevAssets, newAssets)
        }

        if (controlFlows['visit'] === seqId ) {
          dispatch(persist({pathQuery: meta.pathQuery, page, dispatch}))
          return {...meta, canNavigate: true}
        } else {
          dispatch({type: 'BREEZY_NOOP'})
          return {...meta, canNavigate: false}
        }
      }
    }

    dispatch({type: 'BREEZY_BEFORE_VISIT'})
    dispatch(beforeFetch({fetchArgs}))
    dispatch({type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId})

    return fetchWithFlow(fetchArgs, flow, dispatch)
  }
}

function dispatchCompleted (getState, dispatch) {
  const inQ = getState().breezy.controlFlows.remoteInOrder

  for (var i = 0, l = inQ.length; i < l; i++) {
    let item = inQ[i]
    if (item.done && item.action) {
      dispatch(item.action)
    } else {
      break
    }
  }

  dispatch({type: 'BREEZY_REMOTE_IN_ORDER_DRAIN', index: i})
}


export function remote (pathQuery, {pageKey = null, contentType = null, method = 'GET', body = ''} = {}) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {pathQuery, contentType, body, method})
    const fetchUrl = fetchArgs[0]

    const flow = ({rsp, page}) => {
      const prevAssets = state.breezy.assets
      const newAssets = page.assets

      const baseUrl = getState().breezy.baseUrl
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

    dispatch({type: 'BREEZY_BEFORE_REMOTE'})
    dispatch(beforeFetch({fetchArgs}))

    return fetchWithFlow(fetchArgs, flow, dispatch)
  }
}
