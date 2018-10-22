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

export function forEachJointAtNameAcrossAllPages (pages, name, fn = ()=>{}) {
  Object.entries(pages)
    .forEach(([pageKey, page]) => {
      const keyPaths = page.joints[name] || []
      keyPaths.forEach((path) => {
        const pathToJoint = ['data', path].join('.')
        fn(pageKey, page, pathToJoint)
      })
    })
}

export function forEachJoint (joints, fn = () => {}) {
  Object.entries(joints)
    .forEach(([jointName, paths]) => {
      paths.forEach((path) => {
        const jointPath = ['data', path].join('.')
        fn(jointName, jointPath)
      })
    })
}

export function isGraft (page) {
  return page.action === 'graft'
}

export function extractNodeAndPath (page) {
  if(page.action === 'graft') {
    const node = page.data
    const pathToNode = page.path

    return {node, pathToNode}
  } else {
    const errMsg = 'Expected page to be a graft response rendered from node filtering.'
    throw new Error(errMsg)
  }
}

export function parseSJR (body) {
  return (new Function(`'use strict'; return ${body}` )())
}
