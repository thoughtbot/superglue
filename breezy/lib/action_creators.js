import {
  argsForFetch,
  parseResponse
} from './utils/request'
import 'cross-fetch'
import {uuidv4} from './utils/helpers'
import {needsRefresh} from './window'
import {withoutBZParams} from './utils/url'

export function saveResponse ({pageKey, page}) {
  return {
    type: 'BREEZY_SAVE_RESPONSE', pageKey, page
  }
}

export function handleGraft ({pageKey, page}) {
  return {
    type: 'BREEZY_HANDLE_GRAFT', pageKey, page
  }
}

export function setInPage ({pageKey, keypath, value}) {
  return {
    type: 'BREEZY_SET_IN_PAGE',
    pageKey,
    keypath,
    value
  }
}

export function delInPage ({pageKey, keypath}) {
  return {
    type: 'BREEZY_DEL_IN_PAGE',
    pageKey,
    keypath,
  }
}

export function extendInPage ({pageKey, keypath, value}) {
  return {
    type: 'BREEZY_EXTEND_IN_PAGE',
    pageKey,
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


export function persist ({pageKey, page}) {
  return (dispatch, getState) => {
    const {defers = []} = page

    defers.forEach(function ({url}){
      dispatch(remote(url, {}, pageKey))
    })

    if (page.action === 'graft') {
      dispatch(handleGraft({pageKey, page}))
    } else {
      dispatch(saveResponse({pageKey, page}))
    }
  }
}

function handleFetchErr (err, fetchArgs, dispatch) {
  dispatch(handleError(err.message))
  err.fetchArgs = fetchArgs
  err.url = fetchArgs[0]
  err.pageKey = withoutBZParams(fetchArgs[0])
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

const persistAndMeta = (state, rsp, page, pageKey, dispatch) => {
  const prevAssets = state.breezy.assets
  const newAssets = page.assets

  pageKey = withoutBZParams(pageKey)

  const meta = {
    pageKey,
    page,
    screen: page.screen,
    rsp,
    needsRefresh: needsRefresh(prevAssets, newAssets)
  }

  dispatch(persist({pageKey, page}))
  return meta
}

export function remote (pathQuery, {method = 'GET', headers, body = ''} = {}, pageKey) {
  if (!pageKey) {
    throw new Error('pageKey is a required parameter')
  }

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {method, headers, body})

    dispatch({type: 'BREEZY_BEFORE_REMOTE'})
    dispatch(beforeFetch({fetchArgs}))

    return wrappedFetch(fetchArgs)
      .then(parseResponse)
      .then(({rsp, page}) => persistAndMeta(getState(), rsp, page, pageKey, dispatch))
      .catch(e => handleFetchErr(e, fetchArgs, dispatch))
  }
}

export function visit (pathQuery, {method = 'GET', headers, body = ''} = {}, pageKey) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, pathQuery, {headers, body, method})
    const seqId = uuidv4()
    let actualKey = null

    dispatch({type: 'BREEZY_BEFORE_VISIT'})
    dispatch(beforeFetch({fetchArgs}))
    dispatch({type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId})

    return wrappedFetch(fetchArgs)
      .then(parseResponse)
      .then(({rsp, page}) => {
        if (method === 'GET') {
          actualKey = pageKey || pathQuery
        } else {
          const responseUrl = rsp.headers.get('x-response-url')
          const contentLocation = rsp.headers.get('content-location')

          actualKey = (pageKey || contentLocation || responseUrl)
        }

        const meta = persistAndMeta(getState(), rsp, page, actualKey, dispatch)
        const controlFlows = getState().breezy.controlFlows

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
