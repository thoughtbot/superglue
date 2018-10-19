import uuidv4 from 'uuid/v4'
export {uuidv4}

export function reverseMerge (dest, obj) {
  let k, v
  for (k in obj) {
    v = obj[k]
    if (!dest.hasOwnProperty(k)) {
      dest[k] = v
    }
  }
  return dest
}

export function pagePath (pageKey, keypath) {
  return [pageKey, 'data', keypath].join('.')
}

export function forEachJointAtNameAcrossAllPages(pages, name, fn = _=>{}) {
  Object.entries(pages)
    .forEach(([pageKey, page]) => {
      const keyPaths = page.joints[name] || []
      keyPaths.forEach((path) => {
        const pathToJoint = ['data', path].join('.')
        fn(pageKey, page, pathToJoint)
      })
    })
}

export function forEachJoint(joints, fn = _ => {}) {
  Object.entries(joints)
    .forEach(([jointName, paths]) => {
      paths.forEach((path) => {
        const jointPath = ['data', path].join('.')
        fn(jointName, jointPath)
      })
    })
}
