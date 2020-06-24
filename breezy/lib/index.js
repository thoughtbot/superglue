import parse from 'url-parse'
import { rootReducer } from './reducers'
import { setWindow, unsetWindow, hasWindow } from './window'
import { connect, disconnect } from './connector'
import { urlToPageKey } from './utils/url'
import { saveAndProcessPage } from './action_creators'
import {
  HISTORY_CHANGE,
  SET_CSRF_TOKEN,
  SET_BASE_URL,
} from './actions'

export {
  mapStateToProps,
  mapDispatchToProps,
  enhanceVisitWithBrowserBehavior,
} from './utils/react'
export {
  breezyReducer,
  pageReducer,
  rootReducer,
  updateFragments,
} from './reducers'
export { getIn } from './utils/immutability.js'
export { setWindow, unsetWindow }
export { urlToPageKey }
export function stop() {
  unsetWindow()
  disconnect()
}

function pageToInitialState(key, page) {
  return {
    pages: { [key]: page },
  }
}

export function start({ window, initialPage, baseUrl, url }) {
  if (window) {
    setWindow(window)
    // reconder the naming of URL to path
    if (!url) {
      url = window.location.href
    }
  }

  const initialPageKey = urlToPageKey(parse(url).href)
  const { csrfToken } = initialPage
  const location = parse(url)
  const { pathname, query, hash } = location

  return {
    reducer: rootReducer,
    connect: function (store) {
      connect(store)
      if (hasWindow()) {
        store.dispatch({
          type: HISTORY_CHANGE,
          payload: {
            pathname: location.pathname,
            search: location.query,
            hash: location.hash,
          },
        })
      }

      store.dispatch(saveAndProcessPage(initialPageKey, initialPage))

      store.dispatch({ type: SET_BASE_URL, payload: { baseUrl } })
      store.dispatch({ type: SET_CSRF_TOKEN, payload: { csrfToken } })
    },
    initialState: pageToInitialState(initialPageKey, initialPage),
    initialPageKey,
  }
}

export default {
  start,
  stop,
}
