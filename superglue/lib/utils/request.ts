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
  json: unknown

  constructor(message: string) {
    super(message)
    this.name = 'SuperglueResponseError'
  }
}

export function validateResponse(args: ParsedResponse): ParsedResponse {
  const { rsp, json } = args
  if (isValidResponse(rsp)) {
    return args
  } else {
    const error = new SuperglueResponseError('Invalid Superglue Response')
    error.response = rsp
    error.json = json
    throw error
  }
}

export function handleServerErrors(args: ParsedResponse): ParsedResponse {
  const { rsp, json } = args
  if (!rsp.ok && rsp.status !== 422) {
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
    error.json = json
    throw error
  }
  return args
}

export function argsForFetch(
  getState: () => RootState,
  pathQuery: string,
  {
    method = 'GET',
    headers = {},
    body = '',
    signal,
    ...rest
  }: BasicRequestInit = {}
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

  const fetchPath = new URL(formatForXHR(pathQuery), config.baseUrl)

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
    const referrer = new URL(currentState.currentPageKey, config.baseUrl)

    options.referrer = referrer.toString()
  }

  if (method == 'GET' || method == 'HEAD') {
    if (options.body instanceof FormData) {
      const allData = new URLSearchParams(
        options.body as unknown as Record<string, string>
      )

      // Form data should override anything in the URL params First we
      // delete every key. Then append the new keys accounting for
      // duplicate keys that represent structural arrays.
      allData.forEach((value, key) => fetchPath.searchParams.delete(key))
      allData.forEach((value, key) => fetchPath.searchParams.append(key, value))
    }

    delete options.body
  }

  return [fetchPath.toString(), { ...options, ...rest }]
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
