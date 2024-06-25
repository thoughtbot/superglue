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
  BEFORE_FETCH,
  BEFORE_VISIT,
  BEFORE_REMOTE,
  SUPERGLUE_ERROR,
} from '../actions'
import { copyPage, saveAndProcessPage } from './index'

function beforeVisit(payload) {
  return {
    type: BEFORE_VISIT,
    payload,
  }
}

function beforeRemote(payload) {
  return {
    type: BEFORE_REMOTE,
    payload,
  }
}

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
    const currentPageKey = getState().superglue.currentPageKey

    dispatch(beforeRemote({ currentPageKey, fetchArgs }))
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

        const willReplaceCurrent = pageKey == currentPageKey
        const existingId = pages[currentPageKey]?.componentIdentifier
        const receivedId = json.componentIdentifier

        if (
          willReplaceCurrent &&
          !!existingId &&
          existingId != receivedId
        ) {
          console.warn(
            `You're about replace an existing page located at pages["${currentPageKey}"]
that has the componentIdentifier "${existingId}" with the contents of a
received page that has a componentIdentifier of "${receivedId}".

This can happen if you're using data-sg-remote or remote but your response
redirected to a completely different page. Since remote requests do not
navigate or change the current page component, your current page component may
receive a shape that is unexpected and cause issues with rendering.

Consider using data-sg-visit, the visit function, or redirect_back.`
          )
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
  abort: () => {
    // noop
  },
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
    action,
  } = {}
) {
  path = withoutBusters(path)
  let pageKey = urlToPageKey(path)

  return (dispatch, getState) => {
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
        `visit was called with props_at param in the path ${path}, this will be ignored unless you provide a placeholder.`
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

    const currentPageKey = getState().superglue.currentPageKey
    dispatch(beforeVisit({ currentPageKey, fetchArgs }))
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

        const isGet = fetchArgs[1].method === 'GET'

        meta.suggestedAction = 'push'

        if (!rsp.redirected && !isGet) {
          meta.suggestedAction = 'replace'
        }

        if (revisit && isGet) {
          if (rsp.redirected) {
            meta.suggestedAction = 'replace'
          } else {
            meta.suggestedAction = 'none'
          }
        }

        if (action) {
          meta.suggestedAction = action
        }

        pageKey = urlToPageKey(rsp.url)

        if (!isGet && !rsp.redirected) {
          pageKey = currentPageKey
        }

        const contentLocation = rsp.headers.get('content-location')
        if (contentLocation) {
          pageKey = urlToPageKey(contentLocation)
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
