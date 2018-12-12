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

export function forEachJointPathAcrossAllPages (pages, name, fn = ()=>{}) {
  Object.entries(pages)
    .forEach(([pageKey, page]) => {
      forEachJointPathInPage(page, name, (path) => {
        const pathToJoint = [pageKey, path].join('.')
        fn(pathToJoint)
      })
    })
}

export function forEachJointPathInPage (page, name, fn = ()=>{}) {
  const keyPaths = jointPathsInPage(page, name)
  keyPaths.forEach((path) => {
    const pathToJoint = ['data', path].join('.')
    fn(pathToJoint)
  })
}

export function jointPathsInPage (page, name) {
  return page.joints[name] || []
}

export function forEachJointInPage ({joints}, fn = () => {}) {
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
