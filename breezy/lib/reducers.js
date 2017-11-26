import {reverseMerge} from './utils/helpers'
import parseUrl from 'url-parse'
import {pathQuery} from './utils/url'
import {setIn, getIn} from'./utils/immutability'
import {pageYOffset, pageXOffset} from'./window'

const savePage = (state, url, page) => {
  const pathname = pathQuery(url)

  state = {...state}

  reverseMerge(page, {
    cachedAt: new Date().getTime(),
    positionY: pageYOffset(),
    positionX: pageXOffset(),
    pathname: pathname,
    joints: {}
  })

  Object.entries(page.joints)
    .forEach(([ref, paths]) => {
      paths.forEach((path) => {
        const updatedNode = getIn(page.data, path)
        state = graftByJoint(state, ref, updatedNode)
      })
    })

  state[pathname] = page

  return state
}

const graftByJoint = (state, ref, node, opts={}) => {
  state = {...state}
  Object.entries(state)
    .forEach(([pathname, page]) => {
      const keyPaths = page.joints[ref] || []
      keyPaths.forEach((path) => {
        state[pathname] = setIn(page, ['data', path].join('.'), node, opts)
      })
    })

  return state
}

const handleGraft = (state, url, page) => {
  state = {...state}
  const pathname = parseUrl(url).pathname

  reverseMerge(page, {joints: {}})

  Object.entries(page.joints)
    .forEach(([ref, paths]) => {
      paths.forEach((path) => {
        const updatedNode = getIn(page.data, path)
        state = graftByJoint(state, ref, updatedNode)
      })
    })

  const currentPage = state[pathname]
  state[pathname].data = setIn(currentPage.data, page.path, page.data)

  return state
}

const pageReducer = (state = {}, action) => {
  switch(action.type) {
  case 'BREEZY_SAVE_PAGE': {
    const {url, page} = action
    return savePage(state, url, page)
  }
  case 'BREEZY_REMOVE_PAGE': {
    const {url} = action
    const nextState = {...state}
    delete nextState[url]

    return nextState
  }
  case 'BREEZY_HANDLE_GRAFT': {
    const {url, page} = action
    return handleGraft(state, url, page)
  }
  case 'BREEZY_GRAFT_BY_JOINT': {
    const {joint, payload} = action
    const nextState = {...state}

    return graftByJoint(nextState, joint, payload)
  }
  default:
    return state
  }
}

const metaReducer = (state = {}, action) => {
  switch(action.type) {
  case 'BREEZY_HISTORY_CHANGE': {
    const {url} = action
    return {...state, currentUrl: url}
  }
  case 'BREEZY_SET_BASE_URL': {
    const {baseUrl} = action
    return {...state, baseUrl}
  }
  case 'BREEZY_SAVE_PAGE': {
    const {page} = action
    return {...state, csrfToken: page.csrf_token}
  }
  default:
    return state
  }
}

const controlFlowReducer = (state = {}, action) => {
  switch(action.type) {
  case 'BREEZY_OVERRIDE_VISIT_SEQ': {
    return {...state, visit: action.seqId}
  }
  case 'BREEZY_ASYNC_IN_ORDER_DRAIN': {
    const newQ = state.asyncInOrder.slice(action.index)
    return {...state, asyncInOrder: newQ}
  }
  case 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM': {
    const newQ = state.asyncInOrder.map((item)=>{
      if (item.seqId === action.seqId) {
        return {...item, done: true, action: action.action}
      } else {
        return item
      }
    })

    return {...state, asyncInOrder: newQ}
  }
  case 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM': {
    const item = {
      seqId: action.seqId,
      done: false,
      action: null
    }

    return {...state, asyncInOrder: [...state.asyncInOrder, item]}
  }
  case 'BREEZY_ASYNC_NO_ORDER_QUEUE_ITEM': {
    const item = {
      seqId: action.seqId,
      done: false,
      action: null
    }

    return {...state, asyncNoOder: [...state.asyncNoOrder, item]}
  }
  default:
    return state
  }
}

const breezyReducer = function(state = {controlFlows:{}}, action) {
  let meta = metaReducer(state, action)
  let controlFlows = controlFlowReducer(meta.controlFlows, action)

  return {...meta, controlFlows}
}

export const rootReducer = combineReducers({
  breezy: breezyReducer,
  page: pageReducer
})

export {pageReducer, breezyReducer, controlFlowReducer}
