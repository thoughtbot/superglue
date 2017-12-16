import {reverseMerge} from './utils/helpers'
import parseUrl from 'url-parse'
import {pathQuery} from './utils/url'
import {setIn, getIn, extendIn, delIn} from'./utils/immutability'
import {pageYOffset, pageXOffset} from'./window'
import {combineReducers} from 'redux'

const saveResponse = (state, url, page) => {
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
        state = setInByJoint(state, ref, updatedNode)
      })
    })

  state[pathname] = page

  return state
}

const extendInByJoint = (state, name, value, subpath) => {
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

const delInByJoint = (state, name, subpath = null) => {
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

const setInByJoint = (state, name, value, subpath = null) => {
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

const graftByKeypath= (state, ref, node, opts={}) => {
  state = {...state}
  page = state[url]
  state[url] = setIn(page, ['data', path].join('.'), node, opts)

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
        state = setInByJoint(state, ref, updatedNode)
      })
    })

  const currentPage = state[pathname]
  state[pathname].data = setIn(currentPage.data, page.path, page.data)

  return state
}

export const pageReducer = (state = {}, action) => {
  switch(action.type) {
  case 'BREEZY_SAVE_RESPONSE': {
    const {url, page} = action
    return saveResponse(state, url, page)
  }
  case 'BREEZY_HANDLE_GRAFT': {
    const {url, page} = action
    return handleGraft(state, url, page)
  }
  case 'BREEZY_REMOVE_PAGE': {
    const {url} = action
    const nextState = {...state}
    delete nextState[url]

    return nextState
  }
  case 'BREEZY_SET_IN_PAGE': {
    const {url, keypath, value} = action
    const fullPath = [url, 'data', keypath].join('.')
    const nextState = setIn(state, fullPath, value)

    return nextState
  }
  case 'BREEZY_DEL_IN_PAGE': {
    const {url, keypath} = action
    const fullPath = [url, 'data', keypath].join('.')
    const nextState = delIn(state, fullPath)

    return nextState
  }
  case 'BREEZY_EXTEND_IN_PAGE': {
    const {url, keypath, value} = action
    const fullPath = [url, 'data', keypath].join('.')
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

export const metaReducer = (state = {}, action) => {
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
  default:
    return state
  }
}

export const controlFlowReducer = (state = {}, action) => {
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

    return {...state, asyncNoOder: [...state.remote, item]}
  }
  default:
    return state
  }
}

export const breezyReducer = function(state = {controlFlows:{}}, action) {
  let meta = metaReducer(state, action)
  let controlFlows = controlFlowReducer(meta.controlFlows, action)

  return {...meta, controlFlows}
}

export const rootReducer = combineReducers({
  breezy: breezyReducer,
  page: pageReducer
})
