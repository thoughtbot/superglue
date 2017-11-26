import {persist} from './action_creators'
import {parseResponse} from './utils/request'
import {uuidv4} from './utils/helpers'
import {needsRefresh, refreshBrowser} from './window'

export function visit(getState, dispatch, fetchArgs) {
  const seqId = uuidv4()
  const url = fetchArgs[0]
  dispatch({type: 'BREEZY_OVERRIDE_VISIT_SEQ', seqId})
  dispatch({type: 'BREEZY_PAGE_CHANGE'})

  return fetch(...fetchArgs)
    .then(parseResponse)
    .then(({rsp, page}) => {
      const controlFlows = getState().breezy.controlFlows
      if (controlFlows['visit'] === seqId ) {
        dispatch(persist({url, page, dispatch}))

        const state = getState()
        const prevAssets = state.breezy.assets
        const newAssets = page.assets
        const redirectedUrl = rsp.headers.get('x-xhr-redirected-to')

        return {
          url: redirectedUrl || url,
          page,
          screen: page.screen,
          needsRefresh: needsRefresh(prevAssets, newAssets)
        }
      } else {
        return dispatch({type: 'BREEZY_NOOP'})
      }
    })
}

function dispatchCompleted(getState, dispatch) {
  const inQ = getState().breezy.controlFlows.asyncInOrder //todo: rename async to async in order

  for (var i = 0, l = inQ.length; i < l; i++) {
    let item = inQ[i]
    if (item.done) {
      dispatch(item.action)
    } else {
      break
    }
  }

  dispatch({type: 'BREEZY_ASYNC_IN_ORDER_DRAIN', index: i})
}

export function asyncInOrder(getState, dispatch, fetchArgs) {
  const seqId = uuidv4()
  const url = fetchArgs[0]

  dispatch({
    type: 'BREEZY_ASYNC_IN_ORDER_QUEUE_ITEM',
    seqId
  })

  const req = fetch(...fetchArgs)
    .then(parseResponse)
    .then((page) => {
      const action = persist({url, page, dispatch})
      dispatch({
        type: 'BREEZY_ASYNC_IN_ORDER_UPDATE_QUEUED_ITEM',
        action,
        seqId,
      })
      dispatchCompleted(getState, dispatch)
    })

  return req
}

export function asyncNoOrder(getState, dispatch, fetchArgs) {
  const seqId = uuidv4()
  const url = fetchArgs[0]

  dispatch({
    type: 'BREEZY_ASYNC_NO_ORDER_QUEUE_ITEM',
    seqId
  })

  const req = fetch(...fetchArgs)
    .then(parseResponse)
    .then((page) => {
      const action = persist({url, page, dispatch})
      const inQ = getState().breezy.controlFlows.asyncNoOrder
      const hasSeq = inQ.includes(seqId)
      if(hasSeq) {
        dispatch(action)
      }
    })

  return req
}

export function addToFailedQueue({rsp, fetchArgs}) {
  dispatch({
    type: 'BREEZY_QUEUED_FAILED_FETCH',
    fetchArgs
  })
}

// setInterval(()=>{
//   const failedFetches = [...store.breezy.queues['failed']]
//   failedFetches.forEach((args) => {
//     asyncNoOrder(...args).catch((err) => {
//       addToFailedQueue({[err.rsp], args})
//     })
//   })
//
// }, 1000)

export const registeredControlFlows = {
  visit,
  asyncInOrder,
  asyncNoOrder
}
