import { argsForFetch, parseResponse } from './utils/request'
import { getIn } from './utils/immutability'
import parse from 'url-parse'
import 'cross-fetch'
import { uuidv4, isGraft } from './utils/helpers'
import { needsRefresh } from './window'
import {
  urlToPageKey,
  withoutBusters,
  hasBzq,
  urlWithoutBZParams,
  removeBzq
} from './utils/url'
import {
  CLEAR_FLASH,
  SAVE_RESPONSE,
  HANDLE_GRAFT,
  BEFORE_FETCH,
  BREEZY_ERROR,
  BREEZY_GRAFTING_ERROR,
  OVERRIDE_VISIT_SEQ,
  UPDATE_ALL_FRAGMENTS,
  COPY_PAGE,
} from './actions'

export function copyPage({ from, to }) {
  return {
    type: COPY_PAGE,
    payload: {
      from,
      to,
    },
  }
}

export function saveResponse({ pageKey, page }) {
  pageKey = urlToPageKey(pageKey)

  return {
    type: SAVE_RESPONSE,
    payload: {
      pageKey,
      page,
    },
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

export function handleGraft({ pageKey, page }) {
  pageKey = urlToPageKey(pageKey)

  return {
    type: HANDLE_GRAFT,
    payload: {
      pageKey,
      page,
    },
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
    type: BREEZY_ERROR,
    payload: {
      message: err.message,
    },
  }
}

function fetchDeferments(pageKey, defers = []) {
  pageKey = urlToPageKey(pageKey)
  return (dispatch) => {
    const fetches = defers
      .filter(({ type }) => type === 'auto')
      .map(function ({ url }) {
        return dispatch(remote(url, { pageKey })).catch((err) => {
          let parsedUrl = new parse(url, true)
          const keyPath = parsedUrl.query.bzq

          dispatch({
            type: BREEZY_GRAFTING_ERROR,
            payload: {
              url,
              err,
              pageKey,
              keyPath,
            },
          })
        })
      })

    return Promise.all(fetches)
  }
}

function updateAllFragmentsWith(fragments) {
  return {
    type: UPDATE_ALL_FRAGMENTS,
    payload: {
      fragments,
    },
  }
}

function receivedPagetoFragmentList({
  fragments = {},
  data,
  path,
  action,
}) {
  const fragmentNameToNode = {}

  if (action) {
    Object.keys(fragments).forEach((digest) => {
      fragments[digest].forEach((fpath) => {
        if (!fragmentNameToNode[digest]) {
          const start = path.split('.').length
          const actualPath = fpath.split('.').slice(start).join('.')
          const updatedNode = getIn(data, actualPath)
          fragmentNameToNode[digest] = updatedNode
        }
      })
    })
  } else {
    Object.keys(fragments).forEach((digest) => {
      fragments[digest].forEach((fpath) => {
        if (!fragmentNameToNode[digest]) {
          const updatedNode = getIn({ data }, fpath)
          fragmentNameToNode[digest] = updatedNode
        }
      })
    })
  }

  return fragmentNameToNode
}

export function saveAndProcessPage(pageKey, page) {
  return (dispatch) => {
    pageKey = urlToPageKey(pageKey)

    const { defers = [] } = page

    if (isGraft(page)) {
      if (pageKey) {
        dispatch(handleGraft({ pageKey, page }))
      }
    } else {
      dispatch(saveResponse({ pageKey, page }))
    }

    const receivedFragments = receivedPagetoFragmentList(page)

    dispatch(updateAllFragmentsWith(receivedFragments))
    return dispatch(fetchDeferments(pageKey, defers))
  }
}

function handleFetchErr(err, fetchArgs, dispatch) {
  err.fetchArgs = fetchArgs
  err.url = fetchArgs[0]
  err.pageKey = urlToPageKey(fetchArgs[0])
  dispatch(handleError(err))
  throw err
}

//TODO: Provide a connected component for refresh
function buildMeta(pageKey, page, state) {
  const { assets: prevAssets } = state
  const { assets: nextAssets } = page

  //TODO: needs refresh should dispatch, to get a nice, you need to reload your page
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
  pageKey = urlToPageKey(pageKey)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, path, {
      method,
      headers,
      body,
    })
    pageKey = pageKey || getState().breezy.currentPageKey

    dispatch(beforeFetch({ fetchArgs }))

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { breezy, pages = {} } = getState()

        const meta = {
          ...buildMeta(pageKey, json, breezy),
          redirected: rsp.redirected,
          rsp,
          fetchArgs,
        }

        const page = beforeSave(pages[pageKey], json)
        dispatch(saveAndProcessPage(pageKey, page))
        meta.pageKey = pageKey

        return meta
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}

function canNavigate(seqId, { controlFlows }) {
  if (controlFlows['visit'] === seqId) {
    return true
  } else {
    return false
  }
}

export function ensureSingleVisit(fn) {
  return (dispatch, getState) => {
    const seqId = uuidv4()
    dispatch({
      type: OVERRIDE_VISIT_SEQ,
      payload: {
        seqId,
      },
    })

    return fn().then((obj) => {
      const { breezy } = getState()
      return { ...obj, canNavigate: canNavigate(seqId, breezy) }
    })
  }
}

export function visit(
  path,
  {
    method = 'GET',
    headers,
    body = '',
    placeholderKey,
    beforeSave = (prevPage, receivedPage) => receivedPage,
  } = {}
) {
  path = withoutBusters(path)
  let pageKey = urlToPageKey(path)

  return (dispatch, getState) => {
    const currentKey = getState().breezy.currentPageKey
    dispatch(clearFlash({ pageKey: currentKey }))

    if (placeholderKey) {
      placeholderKey = urlToPageKey(placeholderKey)
      const hasPlaceholder = !!getState().pages[placeholderKey]
      if (hasPlaceholder) {
        dispatch(copyPage({ from: placeholderKey, to: pageKey }))
      } else {
        console.warn(
          `Could not find placeholder with key ${placeholderKey} in state. The bzq param will be ignored`
        )

        path = removeBzq(path)
      }
    } else {
      if (hasBzq(path)) {
        console.warn(
          `visit was called with bzq param in the path ${path}, this will be ignore unless you provide a placeholder.`
        )
      }

      path = removeBzq(path)
    }

    const fetchArgs = argsForFetch(getState, path, {
      headers,
      body,
      method,
    })

    return ensureSingleVisit(() => {
      dispatch(beforeFetch({ fetchArgs }))

      return fetch(...fetchArgs)
        .then(parseResponse)
        .then(({ rsp, json }) => {
          const { breezy, pages = {} } = getState()

          const meta = {
            ...buildMeta(pageKey, json, breezy),
            redirected: rsp.redirected,
            rsp,
            fetchArgs,
          }

          if (method !== 'GET') {
            const contentLocation = rsp.headers.get(
              'content-location'
            )

            if (contentLocation) {
              pageKey = urlToPageKey(contentLocation)
            }
          }

          if (rsp.redirected) {
            pageKey = urlToPageKey(rsp.url)
          }

          const page = beforeSave(pages[pageKey], json)
          dispatch(saveAndProcessPage(pageKey, page))
          meta.pageKey = pageKey

          return meta
        })
    })(dispatch, getState).catch((e) =>
      handleFetchErr(e, fetchArgs, dispatch)
    )
  }
}
