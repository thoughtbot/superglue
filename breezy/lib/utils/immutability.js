// These were taken from Scour.js
// Then, modified to respect the id=0 keypath

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

const clone = function (object) {
  return Array.isArray(object)
    ? [].slice.call(object)
    : {... object}
}

const getKey = function (node, key) {
  if (Array.isArray(node) && isNaN(key)) {
    const key_parts = Array.from(key.split('='))
    const attr = key_parts[0]
    const id = key_parts[1]
    let i, child

    if(!id) {
      return key
    }

    for (i = 0; i < node.length; i++) {
      child = node[i]
      if (child[attr].toString() === id) {
        break
      }
    }

    return i
  } else {
    return key
  }
}

const cloneWithout = function (object, key) {
  if (Array.isArray(object)) {
    key = getKey(object, key)
    return object.slice(0, +key).concat(object.slice(+key + 1))
  } else {
    let result = {}
    key = '' + key
    for (let k in object) {
      if (object.hasOwnProperty(k) && key !== k) {
        result[k] = object[k]
      }
    }
    return result
  }
}

const atKey = function(node, key) {
  const [attr, id] = Array.from(key.split('='))

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

const normalizeKeyPath = function(path) {
  if (typeof path === 'string') {
    return path.split('.')
  } else {
    return path
  }
}

const setIn = function(object, keypath, value) {
  keypath = normalizeKeyPath(keypath)

  let results = {}
  let parents = {}
  let i, len

  for (i = 0, len = keypath.length; i < len; i++) {
    if (i === 0) {
      parents[i] = object
    } else {
      parents[i] = atKey(parents[i - 1], keypath[i - 1]) || {}
      // handle cases when it isn't an object
      if (typeof parents[i] !== 'object') {
        parents[i] = {}
      }
    }
  }
  for (i = keypath.length; i >= 0; i--) {
    if (!parents[i]) {
      results[i] = value
    } else {
      results[i] = clone(parents[i])
      let key = getKey(results[i], keypath[i])
      results[i][key] = results[i + 1]
    }
  }

  return results[0]
}

const delIn = function (object, keypath) {
  keypath = normalizeKeyPath(keypath)

  let results = {}
  let parents = {}
  let i, len

  for (i = 0, len = keypath.length; i < len; i++) {
    if (i === 0) {
      parents[i] = object
    } else {
      parents[i] = atKey(parents[i - 1], keypath[i - 1])
      if (!parents[i] || typeof parents[i] !== 'object') {
        return object
      }
    }
  }

  for (i = keypath.length - 1; i >= 0; i--) {
    if (i === keypath.length - 1) {
      results[i] = cloneWithout(parents[i], keypath[i])

      delete results[i][keypath[i]]
    } else {
      results[i] = clone(parents[i])
      results[i][keypath[i]] = results[i + 1]
    }
  }

  return results[0]
}

const extendIn = function (source, keypath, extensions) {
  keypath = normalizeKeyPath(keypath)

  if (keypath.length === 0) return {...source, ...extensions}

  let data =  {...getIn(source, keypath)}

  for (let i = 2, len = arguments.length; i < len; i++) {
    data = {...data, ...arguments[i]}
  }

  return setIn(source, keypath, data)
}

export {getIn, setIn, delIn, extendIn}
