import parse from 'url-parse'
import { formatForXHR } from './url'

export function isValidResponse(xhr) {
  return isValidContent(xhr) && !downloadingFile(xhr)
}

export function isValidContent(rsp) {
  const contentType = rsp.headers.get('content-type')
  const jsContent = /^(?:application\/json)(?:;|$)/

  return !!(contentType !== undefined && contentType.match(jsContent))
}

function downloadingFile(xhr) {
  const disposition = xhr.headers.get('content-disposition')
  return (
    disposition !== undefined &&
    disposition !== null &&
    disposition.match(/^attachment/)
  )
}

export function validateResponse(args) {
  const { rsp } = args
  if (isValidResponse(rsp)) {
    return args
  } else {
    const error = new Error('Invalid Breezy Response')
    error.response = rsp
    throw error
  }
}

export function handleServerErrors(args) {
  const { rsp } = args
  if (!rsp.ok) {
    const error = new Error(rsp.statusText)
    error.response = rsp
    throw error
  }
  return args
}

export function argsForFetch(
  getState,
  pathQuery,
  { method = 'GET', headers = {}, body = '' } = {}
) {
  method = method.toUpperCase()

  const currentState = getState().breezy || {}

  const jsAccept = 'application/json'
  headers = {
    ...headers,
    accept: jsAccept,
    'x-requested-with': 'XMLHttpRequest',
    'x-breezy-request': true,
  }

  if (method != 'GET' && method != 'HEAD') {
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

  const options = { method, headers, body, credentials }

  if (method == 'GET' || method == 'HEAD') {
    delete options.body
  }

  return [formatForXHR(href), options]
}

export function extractJSON(rsp) {
  return rsp
    .json()
    .then((json) => {
      return { rsp, json }
    })
    .catch((e) => {
      e.response = rsp
      throw e
    })
}

export function parseResponse(prm) {
  return Promise.resolve(prm)
    .then(extractJSON)
    .then(handleServerErrors)
    .then(validateResponse)
}
