import {isValidResponse, parseSJR} from './utils/request'
import 'cross-fetch'
import {registeredControlFlows} from './control_flows'
import {getStore} from './connector'
import parse from 'url-parse'

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

const beforeFetch = (opts) => {
  return {...opts,
    type: 'BREEZY_BEFORE_FETCH'
  }
}

const handleError = (err) => {
  return {
    type: 'BREEZY_FETCH_ERROR',
    payload: {
      error: err
    }
  }
}

const validateResponse = (args) => {
  const {rsp} = args
  if(isValidResponse(rsp)) {
    return args
  } else {
    const error = new Error('Invalid Breezy Response')
    error.response = rsp
    throw error
  }
}

const handleServerErrors = (args)=> {
  const {rsp} = args
  if (!rsp.ok) {
    const error = new Error(rsp.statusText)
    error.response = rsp
    throw error
  }
  return args
}

export const restorePage = (location) => {
  return {
    type: 'BREEZY_RESTORE_PAGE',
    url: location
  }
}

export const argsForFetch = (getState, {url, contentType = null, body = '', method = 'GET'}) => {
  const currentState = getState().breezy || {}

  const jsAccept = 'text/javascript, application/x-javascript, application/javascript'
  const headers = {
    'accept': jsAccept,
    'x-xhr-referer': currentState.currentUrl,
    'x-requested-with': 'XMLHttpRequest'
  }

  if (contentType) {
    headers['content-type'] = contentType
  }

  if (currentState.csrfToken) {
    headers['x-csrf-token'] = currentState.csrfToken
  }
  const href = new parse(url, currentState.baseUrl || '', false).href

  return [href, {method, headers, body}]
}

const extractText = (rsp) => {
  return rsp.text().then((txt) => {
    return {rsp, txt}
  })
}

export const parseResponse = (prm) => {
  return Promise.resolve(prm)
    .then(extractText)
    .then(handleServerErrors)
    .then(validateResponse)
    .then(extractSJR)
}

const handleDeferments = (defers=[], dispatch) => {
  defers.forEach(function({url}){
    dispatch(remote({url}))
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

const extractSJR = ({rsp, txt}) => {
  const page = parseSJR(txt)
  if (page) {
    return Promise.resolve({rsp, page})
  } else {
    const error = new Error('Could not parse Server Generated Javascript Response for Breezy')
    error.response = rsp

    throw error
  }
}

export const remote = ({url, contentType = null, method = 'GET', body = '', flow='visit'}) => {
  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, {url, contentType, body, method})
    const flowHandler = registeredControlFlows[flow] || registeredControlFlows['visit']

    dispatch(beforeFetch({fetchArgs}))

    return flowHandler(getState, dispatch, fetchArgs)
      .catch((err) => {
        dispatch(handleError(err.message))
        throw err
      })
  }
}
