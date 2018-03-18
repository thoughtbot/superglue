import {reverseMerge} from './utils/helpers'
import {setIn, getIn, extendIn, delIn} from'./utils/immutability'
import {pageYOffset, pageXOffset} from'./window'

function saveResponse (state, pageKey, page) {
  state = {...state}

  reverseMerge(page, {
    cachedAt: new Date().getTime(),
    positionY: pageYOffset(),
    positionX: pageXOffset(),
    pageKey,
    joints: {}
  })

  Object.entries(page.joints)
    .forEach(([ref, paths]) => {
      paths.forEach((path) => {
        const updatedNode = getIn(page.data, path)
        state = setInByJoint(state, ref, updatedNode)
      })
    })

  state[pageKey] = page

  return state
}

function extendInByJoint (state, name, value, subpath) {
  state = {...state}
  Object.entries(state)
    .forEach(([pathname, page]) => {
      const keyPaths = page.joints[name] || []
      keyPaths.forEach((path) => {
        const fullpath = ['data', path]
        if (subpath) {
          fullpath.push(subpath)
        }
        state[pathname] = extendIn(page, fullpath.join('.'), value)
      })
    })

  return state
}

function delInByJoint (state, name, subpath = null) {
  state = {...state}
  Object.entries(state)
    .forEach(([pathname, page]) => {
      const keyPaths = page.joints[name] || []
      keyPaths.forEach((path) => {
        const fullpath = ['data', path]
        if (subpath) {
          fullpath.push(subpath)
        }

        state[pathname] = delIn(page, fullpath.join('.'))
      })
    })

  return state
}

function setInByJoint (state, name, value, subpath = null) {
  state = {...state}
  Object.entries(state)
    .forEach(([pathname, page]) => {
      const keyPaths = page.joints[name] || []
      keyPaths.forEach((path) => {
        const fullpath = ['data', path]
        if (subpath) {
          fullpath.push(subpath)
        }
        state[pathname] = setIn(page, fullpath.join('.'), value)
      })
    })

  return state
}

function handleGraft (state, pageKey, page) {
  state = {...state}
  reverseMerge(page, {joints: {}})

  const currentPage = state[pageKey]
  currentPage.data = setIn(currentPage.data, page.path, page.data)

  Object.entries(page.joints)
    .forEach(([ref, paths]) => {
      paths.forEach((path) => {
        const updatedNode = getIn(currentPage.data, path)
        state = setInByJoint(state, ref, updatedNode)
      })
    })

  return state
}

export function pageReducer (state = {}, action) {
  switch(action.type) {
  case 'BREEZY_SAVE_RESPONSE': {
    const {pageKey, page} = action
    return saveResponse(state, pageKey, page)
  }
  case 'BREEZY_HANDLE_GRAFT': {
    const {pageKey, page} = action
    return handleGraft(state, pageKey, page)
  }
  case 'BREEZY_REMOVE_PAGE': {
    const {pageKey} = action
    const nextState = {...state}
    delete nextState[pageKey]

    return nextState
  }
  case 'BREEZY_SET_IN_PAGE': {
    const {pageKey, keypath, value} = action
    const fullPath = [pageKey, 'data', keypath].join('.')
    //todo: make setIn accept an array
    const nextState = setIn(state, fullPath, value)

    return nextState
  }
  case 'BREEZY_DEL_IN_PAGE': {
    const {pageKey, keypath} = action
    const fullPath = [pageKey, 'data', keypath].join('.')
    const nextState = delIn(state, fullPath)

    return nextState
  }
  case 'BREEZY_EXTEND_IN_PAGE': {
    const {pageKey, keypath, value} = action
    const fullPath = [pageKey, 'data', keypath].join('.')
    const nextState = extendIn(state, fullPath, value)

    return nextState
  }
  case 'BREEZY_SET_IN_JOINT': {
    const {name, keypath, value} = action
    return setInByJoint(state, name, value, keypath)
  }
  case 'BREEZY_DEL_IN_JOINT': {
    const {name, keypath} = action
    return delInByJoint(state, name, keypath)
  }
  case 'BREEZY_EXTEND_IN_JOINT': {
    const {name, keypath, value} = action
    return extendInByJoint(state, name, value, keypath)
  }
  default:
    return state
  }
}

export function metaReducer (state = {}, action) {
  switch(action.type) {
  case 'BREEZY_HISTORY_CHANGE': {
    const {url} = action
    return {...state, currentUrl: url}
  }
  case 'BREEZY_SET_BASE_URL': {
    const {baseUrl} = action
    return {...state, baseUrl}
  }
  case 'BREEZY_SAVE_RESPONSE': {
    const {page} = action
    return {...state, csrfToken: page.csrf_token}
  }
  case 'BREEZY_SET_CSRF_TOKEN': {
    const {csrfToken} = action
    return {...state, csrfToken: csrfToken}
  }
  default:
    return state
  }
}

export function controlFlowReducer (state = {
}, action) {

  switch(action.type) {
  case 'BREEZY_OVERRIDE_VISIT_SEQ': {
    return {...state, visit: action.seqId}
  }
  default:
    return state
  }
}

export function breezyReducer (state = {}, action) {
  let meta = metaReducer(state, action)
  let controlFlows = controlFlowReducer(meta.controlFlows, action)

  return {...meta, controlFlows}
}

export const rootReducer = {
  breezy: breezyReducer,
  pages: pageReducer
}
