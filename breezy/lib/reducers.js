import {
  reverseMerge,
  forEachJointInPage,
  forEachJointPathAcrossAllPages,
  pagePath,
} from './utils/helpers'
import {setIn, getIn} from'./utils/immutability'
import {pageYOffset, pageXOffset} from'./window'
import {
  REMOVE_PAGE,
  SAVE_RESPONSE,
  HANDLE_GRAFT,
  OVERRIDE_VISIT_SEQ,
  HISTORY_CHANGE,
  SET_BASE_URL,
  SET_CSRF_TOKEN,
  UPDATE_ALL_JOINTS,
} from './actions'

function updateAllJoints (state, pageKey) {
  const selectedPage = state[pageKey]
  forEachJointInPage(selectedPage, (jointName, jointPath) => {
    const updatedNode = getIn(selectedPage, jointPath)
    state = setInByJoint(state, jointName, updatedNode)
  })

  return state
}

function saveResponse (state, pageKey, page) {
  state = {...state}

  reverseMerge(page, {
    cachedAt: new Date().getTime(),
    positionY: pageYOffset(),
    positionX: pageXOffset(),
    pageKey,
    joints: {},
  })

  state[pageKey] = page

  return state
}

function setInByJoint (state, name, value, subpath = null) {
  state = {...state}
  forEachJointPathAcrossAllPages(state, name, (pathToJoint) =>{
    const fullpath = [pathToJoint]
    if (subpath) {
      fullpath.push(subpath)
    }
    state = setIn(state, fullpath.join('.'), value)
  })

  return state
}

function handleGraft (state, pageKey, node, pathToNode, joints={}) {
  state = {...state}
  joints = {...joints}

  const currentPage = state[pageKey]
  currentPage.data = setIn(currentPage.data, pathToNode, node)

  Object.keys(currentPage.joints).forEach((name) => {
    if(!joints[name]) {
      joints[name] = []
    }

    joints[name] = [...new Set([...joints[name], ...currentPage.joints[name]])]
  })

  currentPage.joints = joints

  return state
}

export function pageReducer (state = {}, action) {
  switch(action.type) {
  case SAVE_RESPONSE: {
    const {pageKey, page} = action.payload
    return saveResponse(state, pageKey, page)
  }
  case UPDATE_ALL_JOINTS: {
    const {pageKey} = action.payload
    return updateAllJoints(state, pageKey)
  }
  case HANDLE_GRAFT: {
    const {
      pageKey,
      node,
      pathToNode,
      joints,
    } = action.payload
    return handleGraft(state, pageKey, node, pathToNode, joints)
  }
  case REMOVE_PAGE: {
    const {pageKey} = action.payload
    const nextState = {...state}
    delete nextState[pageKey]

    return nextState
  }
  default:
    return state
  }
}

export function metaReducer (state = {}, action) {
  switch(action.type) {
  case HISTORY_CHANGE: {
    const {url} = action.payload
    return {...state, currentUrl: url}
  }
  case SET_BASE_URL: {
    const {baseUrl} = action.payload
    return {...state, baseUrl}
  }
  case SAVE_RESPONSE: {
    const {page} = action.payload
    return {...state, csrfToken: page.csrfToken}
  }
  case SET_CSRF_TOKEN: {
    const {csrfToken} = action.payload
    return {...state, csrfToken: csrfToken}
  }
  default:
    return state
  }
}

export function controlFlowReducer (state = {
}, action) {

  switch(action.type) {
  case OVERRIDE_VISIT_SEQ: {
    const {seqId} = action.payload
    return {...state, visit: seqId}
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
