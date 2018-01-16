import {
  argsForFetch,
  parseResponse
} from './utils/request'
import 'cross-fetch'
import {uuidv4} from './utils/helpers'
import {needsRefresh} from './window'
import parse from 'url-parse'

export function saveResponse ({url, page}) {
  return {
    type: 'BREEZY_SAVE_RESPONSE', url, page
  }
}

export function handleGraft ({url, page}) {
  return {
    type: 'BREEZY_HANDLE_GRAFT', url, page
  }
}

export function setInPage ({url, keypath, value}) {
  return {
    type: 'BREEZY_SET_IN_PAGE',
    url,
    keypath,
    value
  }
}

export function delInPage ({url, keypath}) {
  return {
    type: 'BREEZY_DEL_IN_PAGE',
    url,
    keypath,
  }
}

export function extendInPage ({url, keypath, value}) {
  return {
    type: 'BREEZY_EXTEND_IN_PAGE',
    url,
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

export function graftByKeypath (url, keypath, payload) {
  return {
    type: 'BREEZY_GRAFT_BY_KEYPATH',
    url,
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

export function restorePage (location) {
  return {
    type: 'BREEZY_RESTORE_PAGE',
    url: location
  }
}

function handleDeferments (defers=[], dispatch) {
  defers.forEach(function ({url}){
    dispatch(remote(url)) //todo: ability to ignore and not clear queue
  })
}

export function persist ({url, page, dispatch}) {
  handleDeferments(page.defers, dispatch)

  if (page.action === 'graft') {
    return handleGraft({url, page})
  } else {
    return saveResponse({url, page})
  }
}

export function fetchWithFlow (fetchArgs, flow, dispatch) {
  return fetch(...fetchArgs)
    .then(parseResponse)
    .then(flow)
    .catch((err) => {
      dispatch(handleError(err.message))
      err.fetchArgs = fetchArgs
      throw err
    })
}

export function visit (url, {contentType = null, method = 'GET', body = ''} = {}) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {url, contentType, body, method})
    const seqId = uuidv4()
    const fetchUrl = fetchArgs[0]

    const flow = ({rsp, page}) => {
      const controlFlows = getState().breezy.controlFlows
      if (controlFlows['visit'] === seqId ) {
        dispatch(persist({url: fetchUrl, page, dispatch}))

        const state = getState()
        const prevAssets = state.breezy.assets
        const newAssets = page.assets
        const redirectedUrl = rsp.headers.get('x-xhr-redirected-to')

        return {
          url: redirectedUrl || fetchUrl,
          page,
          screen: page.screen,
          needsRefresh: needsRefresh(prevAssets, newAssets)
        }
      } else {
        return dispatch({type: 'BREEZY_NOOP'})
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
    if (item.done) {
      dispatch(item.action)
    } else {
      break
    }
  }

  dispatch({type: 'BREEZY_REMOTE_IN_ORDER_DRAIN', index: i})
}

export function remoteInOrder (url, {contentType = null, method = 'GET', body = ''} = {}) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {url, contentType, body, method})
    const seqId = uuidv4()
    const fetchUrl = fetchArgs[0]

    const flow = (page) => {
      const action = persist({url: fetchUrl, page, dispatch})
      dispatch({
        type: 'BREEZY_REMOTE_IN_ORDER_UPDATE_QUEUED_ITEM',
        action,
        seqId,
      })
      dispatchCompleted(getState, dispatch)
    }

    dispatch({
      type: 'BREEZY_REMOTE_IN_ORDER_QUEUE_ITEM',
      seqId
    })

    dispatch({type: 'BREEZY_BEFORE_REMOTE_IN_ORDER'})
    dispatch(beforeFetch({fetchArgs}))
    return fetchWithFlow(fetchArgs, flow, dispatch)
  }
}

export function remote (url, {contentType = null, method = 'GET', body = ''} = {}) {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {url, contentType, body, method})
    const seqId = uuidv4()
    const fetchUrl = fetchArgs[0]

    const flow = ({page}) => {
      const action = persist({url: fetchUrl, page, dispatch})
      const inQ = getState().breezy.controlFlows.remote
      const hasSeq = !!inQ.find((element) => {
        return element.seqId  === seqId
      })

      if(hasSeq) {
        dispatch(action)
      }
    }

    dispatch({
      type: 'BREEZY_REMOTE_QUEUE_ITEM',
      seqId
    })

    dispatch({type: 'BREEZY_BEFORE_REMOTE'})
    dispatch(beforeFetch({fetchArgs}))
    return fetchWithFlow(fetchArgs, flow, dispatch)
  }
}
