// These were taken from Scour.js
// Then, modified to respect the id=0 keypath

const isSearchable = /^[\da-zA-Z\-_=.]+$/

class KeyPathError extends Error {
  constructor(message) {
    super(message)
    this.name = 'KeyPathError'
  }
}

function getIn(obj, path) {
  const keyPath = normalizeKeyPath(path)
  let result = obj

  for (let i = 0; i < keyPath.length; i++) {
    const key = keyPath[i]
    if (!result) {
      break
    }
    result = atKey(result, key)
  }

  return result
}

function clone(object) {
  return Array.isArray(object) ? [].slice.call(object) : { ...object }
}

function getKey(node, key) {
  if (Array.isArray(node) && isNaN(key)) {
    const key_parts = Array.from(key.split('='))
    const attr = key_parts[0]
    const id = key_parts[1]
    let i, child

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

function isArray(ary) {
  return Array.isArray(ary)
}

function isObject(obj) {
  return !isArray(obj) && obj === Object(obj)
}

function atKey(node, key) {
  let id, attr

  if (isSearchable.test(key)) {
    // eslint-disable-next-line
    ;[attr, id] = Array.from(key.split('='))
  }

  if (!isArray(node) && !isObject(node)) {
    throw new KeyPathError(
      `Expected to traverse an Array or Obj, got ${JSON.stringify(
        node
      )}`
    )
  }

  if (isObject(node) && id) {
    throw new KeyPathError(
      `Expected to find an Array when using the key: ${key}`
    )
  }

  if (Array.isArray(node) && id) {
    let child
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

function setIn(object, keypath, value) {
  keypath = normalizeKeyPath(keypath)

  const results = {}
  const parents = {}
  let i

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
