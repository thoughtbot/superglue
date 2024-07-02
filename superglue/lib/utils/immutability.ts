// These were taken from Scour.js
// Then, modified to respect the id=0 keypath

const isSearchable = /^[\da-zA-Z\-_=.]+$/

class KeyPathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KeyPathError'
  }
}

function getIn(
  node: Record<string, unknown> | Array<unknown>,
  path: string
): unknown {
  const keyPath = normalizeKeyPath(path)
  let result = node

  for (let i = 0; i < keyPath.length; i++) {
    const key = keyPath[i]
    if (!result) {
      break
    }
    result = atKey(result, key)
  }

  return result
}

function clone(node: Record<string, unknown> | Array<unknown>) {
  return Array.isArray(node) ? [].slice.call(node) : { ...node }
}

function getKey(node: Record<string, unknown> | Array<unknown>, key: string) {
  if (Array.isArray(node) && Number.isNaN(Number(key))) {
    const key_parts = Array.from(key.split('='))
    const attr = key_parts[0]
    const id = key_parts[1]
    let i: number
    let child: unknown

    if (!id) {
      return key
    }

    for (i = 0; i < node.length; i++) {
      child = node[i]
      if (child[attr as string].toString() === id) {
        break
      }
    }

    return i
  } else {
    return key
  }
}

function isArray(node: unknown) {
  return Array.isArray(node)
}

function isObject(node: unknown) {
  return !isArray(node) && node === Object(node)
}

function atKey(node: Record<string, unknown> | Array<unknown>, key: string) {
  let id: string
  let attr: string

  if (isSearchable.test(key)) {
    // eslint-disable-next-line
    ;[attr, id] = Array.from(key.split('='))
  }

  if (!isArray(node) && !isObject(node)) {
    throw new KeyPathError(
      `Expected to traverse an Array or Obj, got ${JSON.stringify(node)}`
    )
  }

  if (isObject(node) && id) {
    throw new KeyPathError(
      `Expected to find an Array when using the key: ${key}`
    )
  }

  if (Array.isArray(node) && id) {
    let child: unknown
    for (let i = 0; i < node.length; i++) {
      child = node[i]
      if (child[attr].toString() === id) {
        break
      }
    }

    if (child[attr].toString() === id) {
      return child
    } else {
      return undefined
    }
  } else {
    return node[key]
  }
}

function normalizeKeyPath(path) {
  if (typeof path === 'string') {
    path = path.replace(/ /g, '')
    if (path === '') {
      return []
    }

    return path.split('.')
  } else {
    return path
  }
}

function setIn<T>(object: T, keypath: string, value: unknown): T {
  keypath = normalizeKeyPath(keypath)

  const results = {}
  const parents = {}
  let i: number

  parents[0] = object

  for (i = 0; i < keypath.length; i++) {
    parents[i + 1] = atKey(parents[i], keypath[i])
  }

  results[keypath.length] = value

  for (i = keypath.length - 1; i >= 0; i--) {
    results[i] = clone(parents[i])
    const key = getKey(results[i], keypath[i])
    results[i][key] = results[i + 1]
  }

  return results[0]
}

export { getIn, setIn, KeyPathError }
