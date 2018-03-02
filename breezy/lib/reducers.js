import {reverseMerge} from './utils/helpers'
import parseUrl from 'url-parse'
import {setIn, getIn, extendIn, delIn} from'./utils/immutability'
import {pageYOffset, pageXOffset} from'./window'
import {combineReducers} from 'redux'

function saveResponse (state, pathQuery, page) {
  state = {...state}

  reverseMerge(page, {
    cachedAt: new Date().getTime(),
    positionY: pageYOffset(),
    positionX: pageXOffset(),
    pathQuery,
    joints: {}
  })

  Object.entries(page.joints)
    .forEach(([ref, paths]) => {
      paths.forEach((path) => {
        const updatedNode = getIn(page.data, path)
        state = setInByJoint(state, ref, updatedNode)
      })
    })

  state[pathQuery] = page

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

function handleGraft (state, pathQuery, page) {
  state = {...state}

  reverseMerge(page, {joints: {}})

  Object.entries(page.joints)
    .forEach(([ref, paths]) => {
      paths.forEach((path) => {
        const updatedNode = getIn(page.data, path)
        state = setInByJoint(state, ref, updatedNode)
      })
    })
  const currentPage = state[pathQuery]
  state[pathQuery].data = setIn(currentPage.data, page.path, page.data)

  return state
}

export function pageReducer (state = {}, action) {
  switch(action.type) {
  case 'BREEZY_SAVE_RESPONSE': {
    const {pathQuery, page} = action
    return saveResponse(state, pathQuery, page)
  }
  case 'BREEZY_HANDLE_GRAFT': {
    const {pathQuery, page} = action
    return handleGraft(state, pathQuery, page)
  }
  case 'BREEZY_REMOVE_PAGE': {
    const {pathQuery} = action
    const nextState = {...state}
    delete nextState[pathQuery]

    return nextState
  }
  case 'BREEZY_SET_IN_PAGE': {
    const {pathQuery, keypath, value} = action
    const fullPath = [pathQuery, 'data', keypath].join('.')
    //todo: make setIn accept an array
    const nextState = setIn(state, fullPath, value)

    return nextState
  }
  case 'BREEZY_DEL_IN_PAGE': {
    const {pathQuery, keypath} = action
    const fullPath = [pathQuery, 'data', keypath].join('.')
    const nextState = delIn(state, fullPath)

    return nextState
  }
  case 'BREEZY_EXTEND_IN_PAGE': {
    const {pathQuery, keypath, value} = action
    const fullPath = [pathQuery, 'data', keypath].join('.')
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
