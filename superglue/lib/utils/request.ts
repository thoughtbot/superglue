import parse from 'url-parse'
import { formatForXHR } from './url'
import { config } from '../config'
import { BasicRequestInit, ParsedResponse, RootState } from '../types'

export function isValidResponse(xhr: Response): boolean {
  return isValidContent(xhr) && !downloadingFile(xhr)
}

export function isValidContent(rsp: Response): boolean {
  const contentType = rsp.headers.get('content-type')
  const jsContent = /^(?:application\/json)(?:;|$)/

  return !!(contentType && contentType.match(jsContent))
}

function downloadingFile(xhr: Response): boolean {
  const disposition = xhr.headers.get('content-disposition')

  return !!(disposition && disposition.match(/^attachment/) !== null)
}

class SuperglueResponseError extends Error {
  response: Response

  constructor(message: string) {
    super(message)
    this.name = 'SuperglueResponseError'
  }
}

export function validateResponse(args: ParsedResponse): ParsedResponse {
  const { rsp } = args
  if (isValidResponse(rsp)) {
    return args
  } else {
    const error = new SuperglueResponseError('Invalid Superglue Response')
    error.response = rsp
    throw error
  }
}

export function handleServerErrors(args: ParsedResponse): ParsedResponse {
  const { rsp } = args
  if (!rsp.ok) {
    if (rsp.status === 406) {
      console.error(
        "Superglue encountered a 406 Not Acceptable response. This can happen if you used respond_to and didn't specify format.json in the block. Try adding it to your respond_to. For example:\n\n" +
          'respond_to do |format|\n' +
          '  format.html\n' +
          '  format.json\n' +
          '  format.csv\n' +
          'end'
      )
    }
    const error = new SuperglueResponseError(rsp.statusText)
    error.response = rsp
    throw error
  }
  return args
}

export function argsForFetch(
  getState: () => RootState,
  pathQuery: string,
  { method = 'GET', headers = {}, body = '', signal }: BasicRequestInit = {}
): [string, BasicRequestInit] {
  method = method.toUpperCase()
  const currentState = getState().superglue

  const nextHeaders = { ...headers }
  nextHeaders['x-requested-with'] = 'XMLHttpRequest'
  nextHeaders['accept'] = 'application/json'
  nextHeaders['x-superglue-request'] = 'true'

  if (method != 'GET' && method != 'HEAD') {
    nextHeaders['content-type'] = 'application/json'
  }

  if (body instanceof FormData) {
    delete nextHeaders['content-type']
  }

  if (currentState.csrfToken) {
    nextHeaders['x-csrf-token'] = currentState.csrfToken
  }

  const fetchPath = new parse(
    formatForXHR(pathQuery),
    config.baseUrl || {},
    true
  )

  const credentials = 'same-origin'

  if (!(method == 'GET' || method == 'HEAD')) {
    nextHeaders['x-http-method-override'] = method
    method = 'POST'
  }

  const options: BasicRequestInit = {
    method,
    headers: nextHeaders,
    body,
    credentials,
    signal,
  }

  if (currentState.currentPageKey) {
    const referrer = new parse(
      currentState.currentPageKey,
      config.baseUrl || {},
      false
    ).href

    options.referrer = referrer
  }

  if (method == 'GET' || method == 'HEAD') {
    if (options.body instanceof FormData) {
      const allData = new URLSearchParams(
        options.body as unknown as Record<string, string>
      )

      // TODO: Add coverage for this
      const nextQuery = { ...fetchPath.query, ...Object.fromEntries(allData) }
      fetchPath.set('query', nextQuery)
    }

    delete options.body
  }

  return [fetchPath.toString(), options]
}

export function extractJSON(rsp: Response): PromiseLike<ParsedResponse> {
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

export function parseResponse(prm: Response): PromiseLike<ParsedResponse> {
  return Promise.resolve(prm)
    .then(extractJSON)
    .then(handleServerErrors)
    .then(validateResponse)
}
