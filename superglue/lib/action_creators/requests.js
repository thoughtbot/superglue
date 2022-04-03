import {
  argsForFetch,
  parseResponse,
  needsRefresh,
  urlToPageKey,
  withoutBusters,
  hasPropsAt,
  removePropsAt,
} from '../utils'
import {
  CLEAR_FLASH,
  BEFORE_FETCH,
  SUPERGLUE_ERROR,
} from '../actions'
import { copyPage, saveAndProcessPage } from './index'

function beforeFetch(payload) {
  return {
    type: BEFORE_FETCH,
    payload,
  }
}

function handleError(err) {
  return {
    type: SUPERGLUE_ERROR,
    payload: {
      message: err.message,
    },
  }
}

function handleFetchErr(err, fetchArgs, dispatch) {
  err.fetchArgs = fetchArgs
  err.url = fetchArgs[0]
  err.pageKey = urlToPageKey(fetchArgs[0])
  dispatch(handleError(err))
  throw err
}

function buildMeta(pageKey, page, state) {
  const { assets: prevAssets } = state
  const { assets: nextAssets } = page

  return {
    pageKey,
    page,
    componentIdentifier: page.componentIdentifier,
    needsRefresh: needsRefresh(prevAssets, nextAssets),
  }
}

export function clearFlash({ pageKey }) {
  return {
    type: CLEAR_FLASH,
    payload: {
      pageKey,
    },
  }
}

export function remote(
  path,
  {
    method = 'GET',
    headers,
    body = '',
    pageKey,
    beforeSave = (prevPage, receivedPage) => receivedPage,
  } = {}
) {
  path = withoutBusters(path)
  pageKey = pageKey && urlToPageKey(pageKey)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, path, {
      method,
      headers,
      body,
    })
    pageKey = pageKey || getState().superglue.currentPageKey

    dispatch(beforeFetch({ fetchArgs }))

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { superglue, pages = {} } = getState()

        const meta = {
          ...buildMeta(pageKey, json, superglue),
          redirected: rsp.redirected,
          rsp,
          fetchArgs,
        }

        const page = beforeSave(pages[pageKey], json)
        return dispatch(saveAndProcessPage(pageKey, page)).then(
          () => {
            meta.pageKey = pageKey
            return meta
          }
        )
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}

let lastVisitController = {
  abort: () => {},
}

export function visit(
  path,
  {
    method = 'GET',
    headers,
    body = '',
    placeholderKey,
    beforeSave = (prevPage, receivedPage) => receivedPage,
    revisit = false,
  } = {}
) {
  path = withoutBusters(path)
  let pageKey = urlToPageKey(path)

  return (dispatch, getState) => {
    const currentKey = getState().superglue.currentPageKey
    dispatch(clearFlash({ pageKey: currentKey }))

    placeholderKey = placeholderKey && urlToPageKey(placeholderKey)
    const hasPlaceholder = !!getState().pages[placeholderKey]

    if (placeholderKey && hasPlaceholder) {
      dispatch(copyPage({ from: placeholderKey, to: pageKey }))
    }

    if (placeholderKey && !hasPlaceholder) {
      console.warn(
        `Could not find placeholder with key ${placeholderKey} in state. The props_at param will be ignored`
      )
      path = removePropsAt(path)
    }

    if (!placeholderKey && hasPropsAt(path)) {
      console.warn(
        `visit was called with props_at param in the path ${path}, this will be ignore unless you provide a placeholder.`
      )
      path = removePropsAt(path)
    }

    const controller = new AbortController()
    const { signal } = controller
    const fetchArgs = argsForFetch(getState, path, {
      headers,
      body,
      method,
      signal,
    })

    dispatch(beforeFetch({ fetchArgs }))

    lastVisitController.abort()
    lastVisitController = controller

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { superglue, pages = {} } = getState()

        const meta = {
          ...buildMeta(pageKey, json, superglue),
          redirected: rsp.redirected,
          rsp,
          fetchArgs,
        }

        meta.suggestedAction = 'push'
        if (!rsp.redirected && fetchArgs[1].method != 'GET') {
          meta.suggestedAction = 'replace'
        }

        if (revisit && fetchArgs[1].method == 'GET') {
          if (rsp.redirected) {
            meta.suggestedAction = 'replace'
          } else {
            meta.suggestedAction = 'none'
          }
        }

        if (method !== 'GET') {
          const contentLocation = rsp.headers.get('content-location')

          if (contentLocation) {
            pageKey = urlToPageKey(contentLocation)
          }
        }

        if (rsp.redirected) {
          pageKey = urlToPageKey(rsp.url)
        }

        const page = beforeSave(pages[pageKey], json)
        return dispatch(saveAndProcessPage(pageKey, page)).then(
          () => {
            meta.pageKey = pageKey
            return meta
          }
        )
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}
