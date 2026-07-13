import {
  argsForFetch,
  parseResponse,
  needsRefresh,
  urlToPageKey,
  hasPropsAt,
  propsAtParam,
  removePropsAt,
} from '../utils'
import {
  beforeFetch,
  beforeVisit,
  beforeRemote,
  copyPage,
  superglueError,
  receiveResponse,
} from '../actions'
import { saveAndProcessPage, preparePageForSave } from './page'
import {
  FetchArgs,
  PageResponse,
  SuperglueState,
  Result,
  ErrorResult,
  Dispatch,
  RemoteCreator,
  VisitCreator,
  NavigationAction,
  VisitResult,
  BeforeSave,
} from '../types'
import { createProxy } from '../utils/proxy'
import { SuperglueResponseError } from '../utils/request'

/**
 * Handles a thunk rejection using a discriminated `ErrorResult`
 * (when it was an HTTP failure carried by `SuperglueResponseError`) or
 * rethrow for the caller's `.catch` (network, parse, abort, programming
 * bugs). Either way, the `superglueError` action is dispatched.
 */
function handleFetchErr(
  err: Error,
  _fetchArgs: FetchArgs,
  dispatch: Dispatch
): ErrorResult {
  dispatch(superglueError({ message: err.message }))
  if (err instanceof SuperglueResponseError) {
    return { hasError: true, response: err.response }
  }
  console.error(err)
  throw err
}

function buildMeta(
  pageKey: string,
  page: PageResponse,
  state: SuperglueState,
  rsp: Response,
  fetchArgs: FetchArgs
): Result {
  const { assets: prevAssets } = state
  const { assets: nextAssets } = page

  const meta: Result = {
    hasError: false,
    pageKey,
    page,
    redirected: rsp.redirected,
    rsp,
    fetchArgs,
    needsRefresh: needsRefresh(prevAssets, nextAssets),
  }

  if (page.action !== 'handleStreamResponse') {
    meta.componentIdentifier = page.componentIdentifier
  }

  return meta
}

export class MismatchedComponentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MismatchedComponentError'
  }
}

const defaultBeforeSave: BeforeSave = (prevPage, nextPage) => nextPage

export const remote: RemoteCreator = (
  path,
  {
    pageKey: targetPageKey,
    force = false,
    beforeSave = defaultBeforeSave,
    ...rest
  } = {}
) => {
  targetPageKey = targetPageKey && urlToPageKey(targetPageKey)

  return (dispatch, getState, extra) => {
    const fetchArgs = argsForFetch(getState, path, rest, extra)
    const currentPageKey = getState().superglue.currentPageKey

    dispatch(beforeRemote({ currentPageKey, fetchArgs }))
    dispatch(beforeFetch({ fetchArgs }))

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { superglue, pages = {}, fragments } = getState()

        let pageKey
        if (targetPageKey === undefined) {
          const isGet = fetchArgs[1].method === 'GET'
          pageKey = calculatePageKey(rsp, isGet, currentPageKey)
        } else {
          pageKey = targetPageKey
        }

        const meta = buildMeta(pageKey, json, superglue, rsp, fetchArgs)

        if (json.action !== 'handleStreamResponse') {
          const existingId = pages[pageKey]?.componentIdentifier
          const receivedId = json.componentIdentifier
          if (!!existingId && existingId != receivedId && !force) {
            const message = `You cannot replace or update an existing page
located at pages["${currentPageKey}"] that has a componentIdentifier
of "${existingId}" with the contents of a page response that has a
componentIdentifier of "${receivedId}".

This can happen if you're using data-sg-remote or remote but your
response redirected to a page with a different componentIdentifier
than the target page.             

This limitation exists because the resulting page shape from grafting
"${receivedId}"'s "${propsAtParam(path)}" into "${existingId}" may not be
compatible with the page component associated with "${existingId}".

Consider using data-sg-visit, the visit function, or redirect_back to
the same page. Or if you're sure you want to proceed, use force: true.
          `
            throw new MismatchedComponentError(message)
          }
        }

        dispatch(
          receiveResponse({
            pageKey,
            response: JSON.parse(JSON.stringify(json)),
          })
        )

        let page = json

        if (json.action === 'savePage' || json.action === 'graft') {
          page = preparePageForSave(json, pages[pageKey], fragments, beforeSave)
        }

        return dispatch(saveAndProcessPage(pageKey, page)).then(() => meta)
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}

export const visit: VisitCreator = (
  path,
  {
    placeholderKey,
    beforeSave = defaultBeforeSave,
    revisit = false,
    ...rest
  } = {}
) => {
  return (dispatch, getState, extra) => {
    const currentPageKey = getState().superglue.currentPageKey
    placeholderKey =
      (placeholderKey && urlToPageKey(placeholderKey)) || currentPageKey
    const hasPlaceholder = placeholderKey in getState().pages

    if (hasPropsAt(path) && !hasPlaceholder) {
      console.warn(
        `Could not find placeholder with key ${placeholderKey} in state. The props_at param will be ignored`
      )
      path = removePropsAt(path)
    }

    const controller = new AbortController()
    const { signal } = controller
    const fetchArgs = argsForFetch(
      getState,
      path,
      {
        ...rest,
        signal,
      },
      extra
    )

    dispatch(beforeVisit({ currentPageKey, fetchArgs }))
    dispatch(beforeFetch({ fetchArgs }))

    extra.lastVisitController.abort(
      'Aborting the previous `visit`. There can be one visit at a time. Use `remote` if there is a need for async requests.'
    )
    extra.lastVisitController = controller

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { superglue, pages = {}, fragments } = getState()
        const isGet = fetchArgs[1].method === 'GET'
        const pageKey = calculatePageKey(rsp, isGet, currentPageKey)

        const meta = buildMeta(pageKey, json, superglue, rsp, fetchArgs)

        if (json.action !== 'handleStreamResponse') {
          if (placeholderKey && hasPropsAt(path) && hasPlaceholder) {
            const existingId = pages[placeholderKey]?.componentIdentifier
            const receivedId = json.componentIdentifier
            if (!!existingId && existingId != receivedId) {
              const message = `You received a page response with a
componentIdentifier "${receivedId}" that is different than the
componentIdentifier "${existingId}" located at ${placeholderKey}.

This can happen if you're using data-sg-visit or visit with a
props_at param, but the response redirected to a page with a
different componentIdentifier than the target page. 

This limitation exists because the resulting page shape from grafting
"${receivedId}"'s "${propsAtParam(path)}" into "${existingId}" may not be
compatible with the page component associated with "${existingId}".

Check that you're rendering a page with a matching
componentIdentifier, or consider using redirect_back_with_props_at
to the same page.
            `
              throw new MismatchedComponentError(message)
            }
            dispatch(copyPage({ from: placeholderKey, to: pageKey }))
          }
        }
        const visitMeta: VisitResult = {
          ...meta,
          navigationAction: calculateNavAction(
            meta,
            rsp,
            json,
            isGet,
            pageKey,
            currentPageKey,
            revisit
          ),
        }

        dispatch(
          receiveResponse({
            pageKey,
            response: JSON.parse(JSON.stringify(json)),
          })
        )

        const existingPage = createProxy(
          pages[pageKey],
          { current: fragments },
          new Set(),
          new WeakMap()
        )

        let page = json

        if (json.action === 'savePage' || json.action === 'graft') {
          page = JSON.parse(
            JSON.stringify(beforeSave(existingPage, json))
          ) as PageResponse
        }

        return dispatch(saveAndProcessPage(pageKey, page)).then(() => visitMeta)
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}

function calculateNavAction(
  meta: Result,
  rsp: Response,
  json: PageResponse,
  isGet: boolean,
  pageKey: string,
  currentPageKey: string,
  revisit: boolean
) {
  let navigationAction: NavigationAction = 'push'

  if (json.action === 'handleStreamResponse') {
    return 'none'
  }

  if (!rsp.redirected && !isGet) {
    navigationAction = 'replace'
  }
  const isSamePage = pageKey == currentPageKey
  if (isSamePage) {
    navigationAction = 'none'
  }
  if (revisit && isGet) {
    if (rsp.redirected) {
      navigationAction = 'replace'
    } else {
      navigationAction = 'none'
    }
  }

  return navigationAction
}

function calculatePageKey(
  rsp: Response,
  isGet: boolean,
  currentPageKey: string
) {
  let pageKey = urlToPageKey(rsp.url)
  if (!isGet && !rsp.redirected) {
    pageKey = currentPageKey
  }

  const contentLocation = rsp.headers.get('content-location')
  if (contentLocation) {
    pageKey = urlToPageKey(contentLocation)
  }
  return pageKey
}
