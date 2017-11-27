import {
  argsForFetch,
  parseResponse
 } from './utils/request'
import 'cross-fetch'
import {getStore} from './connector'
import {uuidv4} from './utils/helpers'
import {needsRefresh, refreshBrowser} from './window'

export const savePage = ({url, page}) => {
  return {
    type: 'BREEZY_SAVE_PAGE', url, page
  }
}

export const handleGraft = ({url, page}) => {
  return {
    type: 'BREEZY_HANDLE_GRAFT', url, page
  }
}

export const graftByJoint = (joint, payload) => {
  return {
    type: 'BREEZY_GRAFT_BY_JOINT',
    joint,
    payload
  }
}

export const beforeFetch = (opts) => {
  return {...opts,
    type: 'BREEZY_BEFORE_FETCH'
  }
}

export const handleError = (err) => {
  return {
    type: 'BREEZY_FETCH_ERROR',
    payload: {
      error: err
    }
  }
}

export const restorePage = (location) => {
  return {
    type: 'BREEZY_RESTORE_PAGE',
    url: location
  }
}

const handleDeferments = (defers=[], dispatch) => {
  defers.forEach(function({url}){
    dispatch(asyncNoOrder({url})) //todo: ability to ignore and not clear queue
  })
}

export const persist = ({url, page, dispatch}) => {
  const state = getStore().getState()
  const prevAssets = state.breezy.assets
  const newAssets = page.assets

  handleDeferments(page.defers, dispatch)

  if (page.action !== 'graft') {
    return savePage({url, page})
  } else {
    return handleGraft({url, page})
  }
}


const fetchWithFlow = (fetchArgs, flow, dispatch) => {
  return fetch(...fetchArgs)
    .then(parseResponse)
    .then(flow)
    .catch((err) => {
      dispatch(handleError(err.message))
      err.fetchArgs = fetchArgs
      throw err
    })
}

export const visit = ({url, contentType = null, method = 'GET', body = ''}) => {
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

    dispatch(beforeFetch({fetchArgs}))
    dispatch({type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId})
    dispatch({type: 'BREEZY_PAGE_CHANGE'})

    return fetchWithFlow(fetchArgs, flow, dispatch)
  }
}

function dispatchCompleted(getState, dispatch) {
  const inQ = getState().breezy.controlFlows.asyncInOrder

  for (var i = 0, l = inQ.length; i < l; i++) {
    let item = inQ[i]
    if (item.done) {
      dispatch(item.action)
    } else {
      break
    }
  }

  dispatch({type: 'BREEZY_ASYNC_IN_ORDER_DRAIN', index: i})
}

export const asyncInOrder = ({url, contentType = null, method = 'GET', body = ''}) => {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {url, contentType, body, method})
    const seqId = uuidv4()
    const fetchUrl = fetchArgs[0]

    const flow = (page) => {
      const action = persist({url: fetchUrl, page, dispatch})
      dispatch({
        type: 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM',
        action,
        seqId,
      })
      dispatchCompleted(getState, dispatch)
    }

    dispatch({
      type: 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM',
      seqId
    })

    dispatch(beforeFetch({fetchArgs}))
    return fetchWithFlow(fetchArgs, flow, dispatch)
  }
}

export const asyncNoOrder = ({url, contentType = null, method = 'GET', body = ''}) => {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {url, contentType, body, method})
    const seqId = uuidv4()
    const fetchUrl = fetchArgs[0]

    const flow = (page) => {
        const action = persist({url: fetchUrl, page, dispatch})
        const inQ = getState().breezy.controlFlows.asyncNoOrder
        const hasSeq = inQ.includes(seqId)
        if(hasSeq) {
          dispatch(action)
        }
      }

    dispatch({
      type: 'BREEZY_ASYNC_NO_ORDER_QUEUE_ITEM',
      seqId
    })

    dispatch(beforeFetch({fetchArgs}))
    return fetchWithFlow(fetchArgs, flow, dispatch)
  }
}

