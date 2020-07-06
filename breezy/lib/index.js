import parse from 'url-parse'
import { rootReducer } from './reducers'
import { urlToPageKey } from './utils/url'
import { saveAndProcessPage } from './action_creators'
import { setFetch, unsetFetch } from './window'
import {
  HISTORY_CHANGE,
  SET_CSRF_TOKEN,
  SET_BASE_URL,
} from './actions'

export {
  mapStateToProps,
  mapDispatchToProps,
  mapDispatchToPropsIncludingVisitAndRemote,
  enhanceVisitWithBrowserBehavior,
} from './utils/react'
export {
  breezyReducer,
  pageReducer,
  rootReducer,
  updateFragments,
} from './reducers'
export { getIn } from './utils/immutability.js'
export { urlToPageKey }

export function stop() {
  unsetFetch()
}

function pageToInitialState(key, page) {
  return {
    pages: { [key]: page },
  }
}

export function start({ initialPage, fetch, baseUrl, path }) {
  const initialPageKey = urlToPageKey(parse(path).href)
  const { csrfToken } = initialPage
  const location = parse(url)
  const { pathname, query, hash } = location
  setFetch(fetch)

  return {
    reducer: rootReducer,
    prepareStore: function (store) {
      store.dispatch({
        type: HISTORY_CHANGE,
        payload: {
          pathname: location.pathname,
          search: location.query,
          hash: location.hash,
        },
      })
      store.dispatch(saveAndProcessPage(initialPageKey, initialPage))
      store.dispatch({ type: SET_BASE_URL, payload: { baseUrl } })
      store.dispatch({ type: SET_CSRF_TOKEN, payload: { csrfToken } })
    },
    initialState: pageToInitialState(initialPageKey, initialPage),
    initialPageKey,
    stop,
  }
}
