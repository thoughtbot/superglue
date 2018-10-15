import parse from 'url-parse'
import {rootReducer} from './reducers'
import {setWindow, unsetWindow, hasWindow} from './window'
import connect from './connector'
import {withoutBZParams} from './utils/url'
import {saveAndProcessPage} from './action_creators'

export {mapStateToProps, mapDispatchToProps, withBrowserBehavior} from './utils/react'
export {breezyReducer, pageReducer, rootReducer} from './reducers'
export {setWindow, unsetWindow}

export function stop () {
  unsetWindow()
}

function pageToInitialState (key, page) {
  return {
    pages: {[key]: page}
  }
}

export function start ({window, baseUrl='', url, initialPage={}}) {
  let nav

  if (window) {
    setWindow(window)
    if (!url) {
      url = window.location.href
    }
  }

  const initialPageKey = withoutBZParams(parse(url).href)
  const csrfToken = initialPage.csrf_token

  return {
    reducer: rootReducer,
    Nav: nav,
    connect: function (store){
      connect(store)

      if(hasWindow()) {
        store.dispatch({
          type: 'BREEZY_HISTORY_CHANGE',
          url:  parse(url).href
        })
      }

      store.dispatch(saveAndProcessPage(
        initialPageKey,
        initialPage
      ))

      store.dispatch({type: 'BREEZY_SET_BASE_URL', baseUrl})
      store.dispatch({type: 'BREEZY_SET_CSRF_TOKEN', csrfToken})
    },
    initialState: pageToInitialState(initialPageKey, initialPage),
    initialPageKey,
  }
}

export default {
  start,
  stop
}
