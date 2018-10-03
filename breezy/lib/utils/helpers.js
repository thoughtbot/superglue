import uuidv4 from 'uuid/v4'

function reverseMerge (dest, obj) {
  let k, v
  for (k in obj) {
    v = obj[k]
    if (!dest.hasOwnProperty(k)) {
      dest[k] = v
    }
  }
  return dest
}

function pagePath (pageKey, keypath) {
  return [pageKey, 'data', keypath].join('.')
}

export {reverseMerge, uuidv4, pagePath}
