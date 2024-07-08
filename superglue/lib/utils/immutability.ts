// These were taken from Scour.js
// Then, modified to respect the id=0 keypath

import { JSONMappable, JSONValue } from '../types'

const isDigKey = /^[\da-zA-Z\-_]+=[\da-zA-Z\-_]+$/

class KeyPathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KeyPathError'
  }
}

function getIn(node: JSONMappable, path: string): JSONValue {
  const keyPath = normalizeKeyPath(path)
  let result: JSONValue = node
  let i: number

  for (i = 0; i < keyPath.length; i++) {
    const key = keyPath[i]

    if (typeof result === 'object' && result !== null) {
      if (!Array.isArray(result) && isDigKey.test(key)) {
        throw new KeyPathError(
          `Expected to find an Array when using the key: ${key}`
        )
      }

      result = atKey(result, key)
    } else {
      throw new KeyPathError(
        `Expected to traverse an Array or Obj, got ${JSON.stringify(result)}`
      )
    }
  }

  if (i === keyPath.length) {
    return result
  } else {
    return undefined
  }
}

function clone(node: JSONMappable): JSONMappable {
  return Array.isArray(node) ? [].slice.call(node) : { ...node }
}

function getKey(node: JSONMappable, key: string): string | number | never {
  if (Array.isArray(node) && Number.isNaN(Number(key))) {
    const key_parts = Array.from(key.split('='))
    const attr = key_parts[0]
    const id = key_parts[1]

    if (!id || !attr) {
      return key
    }

    let i: number
    let child: JSONValue

    for (i = 0; i < node.length; i++) {
      child = node[i]
      if (
        typeof child === 'object' &&
        !Array.isArray(child) &&
        child !== null
      ) {
        const val = child[attr]
        if (val && val.toString() === id) {
          break
        }
      } else {
        throw new KeyPathError(`Could not look ahead ${key} at ${child}`)
      }
    }

    if (i === node.length) {
      throw new KeyPathError(`Could not find ${key} while looking ahead`)
    }

    return i
  } else {
    return key
  }
}

function atKey(node: JSONMappable, key: string) {
  const actualKey = getKey(node, key)

  if (Array.isArray(node)) {
    return node[actualKey as number]
  } else {
    return node[actualKey]
  }
}

function normalizeKeyPath(path: string): string[] {
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

function setIn<T extends JSONMappable>(
  object: T,
  path: string,
  value: JSONValue
): T | never {
  const keypath = normalizeKeyPath(path)

  const results: {
    0: T
    [key: number]: JSONValue
  } = { 0: object }

  const parents: {
    0: T
    [key: number]: JSONValue
  } = { 0: object }

  let i: number

  for (i = 0; i < keypath.length; i++) {
    const parent = parents[i]

    if (!(typeof parent === 'object' && parent !== null)) {
      throw new KeyPathError(
        `Expected to traverse an Array or Obj, got ${JSON.stringify(parent)}`
      )
    }

    const child = atKey(parent, keypath[i])
    parents[i + 1] = child
  }

  results[keypath.length] = value

  for (i = keypath.length - 1; i >= 0; i--) {
    // Parents will always have a JSONValue at
    // keypath.length so this loop skips that one element
    // Every other element in parents is a JSONMappable
    const target = clone(parents[i] as JSONMappable)
    results[i] = target
    const key = getKey(results[i] as JSONMappable, keypath[i])
    if (Array.isArray(target)) {
      target[key as number] = results[i + 1]
    } else {
      target[key] = results[i + 1]
    }
  }

  return results[0]
}

export { getIn, setIn, KeyPathError }
