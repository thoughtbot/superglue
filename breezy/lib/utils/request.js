import parse from 'url-parse'

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

export function argsForFetch (getState, {url, contentType = null, body = '', method = 'GET'}) {
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
  const credentials = 'same-origin'

  return [href, {method, headers, body, credentials}]
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
