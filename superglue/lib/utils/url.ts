import parse from 'url-parse'
import { PageKey } from '../types'

export function pathQuery(url: string): string {
  const { pathname, query } = new parse(url, {})

  return pathname + query
}

export function pathQueryHash(url: string): string {
  const { pathname, query, hash } = new parse(url, {})

  return pathname + query + hash
}

export function hasPropsAt(url: string): boolean {
  const parsed = new parse(url, {}, true)
  const query = parsed.query

  return !!query['props_at']
}

export function propsAtParam(url: string): string | undefined {
  const parsed = new parse(url, {}, true)
  const query = parsed.query

  return query['props_at']
}

export function withFormatJson(url: string): string {
  const parsed = new parse(url, {}, true)
  parsed.query['format'] = 'json'

  return parsed.toString()
}

export function pathWithoutBZParams(url: string): string {
  const parsed = new parse(url, {}, true)
  const query = parsed.query

  delete query['props_at']
  delete query['format']
  parsed.set('query', query)

  return pathQueryHash(parsed.toString())
}

export function removePropsAt(url: string): string {
  const parsed = new parse(url, {}, true)
  const query = parsed.query

  delete query['props_at']
  parsed.set('query', query)

  return parsed.toString()
}

/**
 * Converts a url to a PageKey.
 *
 * @param url
 * @returns
 */
export function urlToPageKey(url: string): PageKey {
  const parsed = new parse(url, {}, true)
  const query = parsed.query

  delete query['props_at']
  delete query['format']
  parsed.set('query', query)

  return pathQuery(parsed.toString())
}

export function withoutHash(url: string): string {
  const parsed = new parse(url, {}, true)
  parsed.set('hash', '')
  return parsed.toString()
}

export function withoutBusters(url: string): string {
  const parsed = new parse(url, {}, true)
  const query = parsed.query
  delete query['format']
  parsed.set('query', query)

  return pathQuery(parsed.toString())
}

export function formatForXHR(url: string): string {
  const formats = [withoutHash, withFormatJson]

  return formats.reduce((memo, f) => f(memo), url)
}
