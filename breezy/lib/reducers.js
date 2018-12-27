import {
  reverseMerge,
  forEachJointInPage,
  forEachJointPathInPage,
  forEachJointPathAcrossAllPages,
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
  MATCH_JOINTS_IN_PAGE,
} from './actions'

function updateAllJoints (state, pageKey) {
  const selectedPage = state[pageKey]
  forEachJointInPage(selectedPage, (jointName, jointPath) => {
    const updatedNode = getIn(selectedPage, jointPath)
    state = copyInByJoint(state, jointName, updatedNode)
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

function copyInByJoint (state, name, value, subpath = null) {
  state = {...state}
  const copy = JSON.stringify(value)
  forEachJointPathAcrossAllPages(state, name, (pathToJoint) =>{
    const fullpath = [pathToJoint]
    if (subpath) {
      fullpath.push(subpath)
    }
    state = setIn(state, fullpath.join('.'), JSON.parse(copy))
  })

  return state
}

function updateJointsInPageToMatch (state, pageKey, jointName, pathToJoint) {
  const currentPage = state[pageKey]
  if (!currentPage) {
    const error = new Error(`Breezy was looking for ${pageKey} in your state, but could not find it in your mapping. Did you forget to pass in a valid pageKey to this.props.remote or this.props.visit?`)
    throw error
  }

  const node = getIn(state, [pageKey, 'data', pathToJoint].join('.'))
  const copy = JSON.stringify(node)
  let nextState = state

  forEachJointPathInPage(currentPage, jointName, (path) => {
    nextState = setIn(nextState, [pageKey, 'data', path].join('.'), JSON.parse(copy))
  })

  return nextState
}

function handleGraft (state, pageKey, node, pathToNode, joints={}) {
  state = {...state}
  joints = {...joints}

  const currentPage = state[pageKey]

  if (!currentPage) {
    const error = new Error(`Breezy was looking for ${pageKey} in your state, but could not find it in your mapping. Did you forget to pass in a valid pageKey to this.props.remote or this.props.visit?`)
    throw error
  }
  let nextState = setIn(state, [pageKey, 'data', pathToNode].join('.'), node)

  Object.keys(currentPage.joints).forEach((name) => {
    if(!joints[name]) {
      joints[name] = []
    }

    joints[name] = [
      ...new Set([...joints[name],
        ...currentPage.joints[name]])
    ]
  })

  nextState = setIn(nextState, [pageKey, 'joints'].join('.'), joints)
  return nextState
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
  case MATCH_JOINTS_IN_PAGE: {
    const {
      pageKey,
      lastJointName,
      lastJointPath,
    } = action.payload

    return updateJointsInPageToMatch(state, pageKey, lastJointName, lastJointPath)
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
