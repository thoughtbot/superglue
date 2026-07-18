import { PageKey } from '../types'

const FAKE_ORIGIN = 'https://example.com'

export function pathQuery(url: string): string {
  const { pathname, search: query } = new URL(url, FAKE_ORIGIN)

  return pathname + query
}

export function pathQueryHash(url: string): string {
  const { pathname, hash, search: query } = new URL(url, FAKE_ORIGIN)

  return pathname + query + hash
}

export function hasPropsAt(url: string): boolean {
  const { searchParams } = new URL(url, FAKE_ORIGIN)

  return searchParams.has('props_at')
}

export function propsAtParam(url: string): string | null {
  const { searchParams } = new URL(url, FAKE_ORIGIN)

  return searchParams.get('props_at')
}

export function withFormatJson(url: string): string {
  const parsed = new URL(url, FAKE_ORIGIN)
  parsed.searchParams.set('format', 'json')

  return parsed.href.replace(parsed.origin, '')
}

export function removePropsAt(url: string): string {
  const parsed = new URL(url, FAKE_ORIGIN)
  parsed.searchParams.delete('props_at')

  return parsed.href.replace(parsed.origin, '')
}

/**
 * Converts a url to a PageKey.
 *
 * @param url
 * @returns
 */
export function urlToPageKey(url: string): PageKey {
  const parsed = new URL(url, FAKE_ORIGIN)
  parsed.searchParams.delete('props_at')
  parsed.searchParams.delete('format')

  return pathQuery(parsed.toString())
}

export function withoutHash(url: string): string {
  const parsed = new URL(url, FAKE_ORIGIN)
  parsed.hash = ''

  return parsed.href.replace(parsed.origin, '')
}

export function formatForXHR(url: string): string {
  const formats = [withoutHash, withFormatJson]

  return formats.reduce((memo, f) => f(memo), url)
}

export function parsePageKey(pageKey: PageKey) {
  const { pathname, searchParams } = new URL(pageKey, FAKE_ORIGIN)

  const search = Object.fromEntries(searchParams)

  return {
    pathname,
    search,
  }
}
