import parse from 'url-parse'

export function pathQuery(url) {
  const { pathname, query } = new parse(url, {})

  return pathname + query
}

export function pathQueryHash(url) {
  const { pathname, query, hash } = new parse(url, {})

  return pathname + query + hash
}

export function hasPropsAt(url) {
  url = new parse(url, {}, true)
  const query = url.query

  return !!query['props_at']
}

export function withFormatJson(url) {
  url = new parse(url, {}, true)
  url.query['format'] = 'json'

  return url.toString()
}

export function pathWithoutBZParams(url) {
  url = new parse(url, {}, true)
  const query = url.query

  delete query['props_at']
  delete query['format']
  url.query = query

  return pathQueryHash(url.toString())
}

export function removePropsAt(url) {
  url = new parse(url, {}, true)
  const query = url.query

  delete query['props_at']
  url.query = query

  return url.toString()
}

export function urlToPageKey(url) {
  url = new parse(url, {}, true)
  const query = url.query

  delete query['props_at']
  delete query['format']
  url.query = query

  return pathQuery(url.toString())
}

export function withoutHash(url) {
  url = new parse(url, {}, true)
  url.hash = ''
  return url.toString()
}

export function withoutBusters(url) {
  url = new parse(url, {}, true)
  const query = url.query
  delete query['format']
  url.query = query

  return pathQuery(url.toString())
}

export function formatForXHR(url) {
  const formats = [withoutHash, withFormatJson]

  return formats.reduce((memo, f) => f(memo), url)
}
