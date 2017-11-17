const getIn = function(obj, path) {
  const keyPath = normalizeKeyPath(path)
  let result = obj

  for (let i = 0; i < keyPath.length; i++) {
    const key = keyPath[i]
    if (!result) { break }
    result = atKey(result, key)
  }

  return result
}

const isArray = function(val) {
  return Object.prototype.toString.call(val) === '[object Array]'
}

const isObject = function(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

const setValueIntoNode = function(node, key, value) {
  const [attr, id] = Array.from(key.split('='))

  if (isArray(node) && id) {
    let i
    for (i = 0; i < node.length; i++) {
      const child = node[i]
      if (child[attr].toString() === id) {
        break
      }
    }

    return node[i] = value

  } else {
    return node[key] = value
  }
}

const atKey = function(node, key) {
  const [attr, id] = Array.from(key.split('='))

  if (isArray(node) && id) {
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

const normalizeKeyPath = function(path) {
  if (typeof path === 'string') {
    return path.split('.')
  } else {
    return path
  }
}

const shallowCopy = function(obj) {
  let copy
  if (isArray(obj)) {
    copy = (Array.from(obj))
  }

  if (isObject(obj)) {
    copy = {}
    for (let key in obj) {
      const value = obj[key]
      copy[key] = value
    }
  }

  return copy
}


const setIn = function(node, path, value, opts) {
  let i, key
  if (opts == null) { opts = {} }
  if (!node) { return node }

  const root = node
  const keyPath = normalizeKeyPath(path)

  let branch = [node]
  for (i = 0; i < keyPath.length; i++) {
    key = keyPath[i]
    const child = atKey(node, key)
    if (child === undefined) {
      const parentPath = keyPath.slice(0, i + 1).join('.')
      console.warn(`Could not find child ${key} at ${parentPath}`)
      return root
    }
    branch.push(child)
    node = child
  }

  branch[branch.length - 1] = value
  branch = branch.map(node => shallowCopy(node))

  for (i = 0; i < keyPath.length; i++) {
    key = keyPath[i]
    setValueIntoNode(branch[i], key, branch[i + 1])
  }

  return branch[0]
}

export {getIn, setIn}
