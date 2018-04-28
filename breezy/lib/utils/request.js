import parse from 'url-parse'
import {formatForXHR} from './url'

export function isValidResponse (xhr) {
  return isValidContent(xhr) && !downloadingFile(xhr)
}

export function parseSJR (body) {
  return (new Function(`'use strict'; return ${body}` )())
}

export function isValidContent (rsp) {
  const contentType = rsp.headers.get('content-type')
  const jsContent = /^(?:text\/javascript|application\/x-javascript|application\/javascript)(?:;|$)/

  return !!(contentType !== undefined && contentType.match(jsContent))
}

function downloadingFile (xhr) {
  const disposition = xhr.headers.get('content-disposition')
  return disposition !== undefined && disposition !== null && disposition.match(/^attachment/)
}

export function validateResponse (args) {
  const {rsp} = args
  if(isValidResponse(rsp)) {
    return args
  } else {
    const error = new Error('Invalid Breezy Response')
    error.response = rsp
    throw error
  }
}

export function handleServerErrors (args){
  const {rsp} = args
  if (!rsp.ok) {
    const error = new Error(rsp.statusText)
    error.response = rsp
    throw error
  }
  return args
}

export function argsForFetch (getState, pathQuery, {method='GET', headers = {}, body}) {
  const currentState = getState().breezy || {}

  const jsAccept = 'text/javascript, application/x-javascript, application/javascript'
  headers = {
    ...headers,
    'accept': jsAccept,
    'x-requested-with': 'XMLHttpRequest',
    'x-breezy-request': true,
  }

  if(method != 'GET') {
    headers['content-type'] = 'application/json'
  }

  if (currentState.currentUrl) {
    headers['x-xhr-referer'] = currentState.currentUrl
  }

  if (currentState.csrfToken) {
    headers['x-csrf-token'] = currentState.csrfToken
  }

  const href = new parse(pathQuery, currentState.baseUrl || '', false).href
  const credentials = 'same-origin'

  if (!(method == 'GET' || method == 'HEAD')) {
    headers['x-http-method-override'] = method
    method = 'POST'
  }

  const options = {method, headers, body, credentials}

  if (method == 'GET' || method == 'HEAD') {
    delete options.body
  }

  return [formatForXHR(href), options]
}

export function extractText (rsp) {
  return rsp.text().then((txt) => {
    return {rsp, txt}
  })
}

export function extractSJR ({rsp, txt}) {
  const page = parseSJR(txt)
  if (page) {
    return Promise.resolve({rsp, page})
  } else {
    const error = new Error('Could not parse Server Generated Javascript Response for Breezy')
    error.response = rsp

    throw error
  }
}

export function parseResponse (prm) {
  return Promise.resolve(prm)
    .then(extractText)
    .then(handleServerErrors)
    .then(validateResponse)
    .then(extractSJR)
}
