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
  beforeFetch,
  beforeVisit,
  beforeRemote,
  copyPage,
  superglueError,
} from '../actions'
import { saveAndProcessPage } from './index'
import {
  FetchArgs,
  VisitResponse,
  PageResponse,
  Page,
  SuperglueState,
  Meta,
  Dispatch,
  RemoteCreator,
  VisitCreator,
  SuggestedAction,
} from '../types'

function handleFetchErr(
  err: Error,
  fetchArgs: FetchArgs,
  dispatch: Dispatch
): never {
  dispatch(superglueError({ message: err.message }))
  throw err
}

function buildMeta(
  pageKey: string,
  page: VisitResponse,
  state: SuperglueState,
  rsp: Response,
  fetchArgs: FetchArgs
): Meta {
  const { assets: prevAssets } = state
  const { assets: nextAssets } = page

  return {
    pageKey,
    page,
    redirected: rsp.redirected,
    rsp,
    fetchArgs,
    componentIdentifier: page.componentIdentifier,
    needsRefresh: needsRefresh(prevAssets, nextAssets),
  }
}

export class MismatchedComponentError extends Error {
  constructor(existingId: string, receivedId: string, currentPageKey: string) {
    const message = `You are about to replace an existing page located at pages["${currentPageKey}"]
that has the componentIdentifier "${existingId}" with the contents of a
received page that has a componentIdentifier of "${receivedId}".

This can happen if you're using data-sg-remote or remote but your response
redirected to a completely different page. Since remote requests do not
navigate or change the current page component, your current page component may
receive a shape that is unexpected and cause issues with rendering.

Consider using data-sg-visit, the visit function, or redirect_back to the same page. Or if you're
sure you want to proceed, use force: true.
`
    super(message)
    this.name = 'MismatchedComponentError'
  }
}

export const remote: RemoteCreator = (
  path,
  {
    method = 'GET',
    headers,
    body,
    pageKey: targetPageKey,
    force = false,
    beforeSave = (prevPage: Page, receivedPage: PageResponse) => receivedPage,
  } = {}
) => {
  path = withoutBusters(path)
  targetPageKey = targetPageKey && urlToPageKey(targetPageKey)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, path, {
      method,
      headers,
      body,
    })
    const currentPageKey = getState().superglue.currentPageKey

    dispatch(beforeRemote({ currentPageKey, fetchArgs }))
    dispatch(beforeFetch({ fetchArgs }))

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { superglue, pages = {} } = getState()

        let pageKey
        if (targetPageKey === undefined) {
          const isGet = fetchArgs[1].method === 'GET'
          pageKey = calculatePageKey(rsp, isGet, currentPageKey)
        } else {
          pageKey = targetPageKey
        }

        const meta = buildMeta(pageKey, json, superglue, rsp, fetchArgs)
        const existingId = pages[pageKey]?.componentIdentifier
        const receivedId = json.componentIdentifier

        if (!!existingId && existingId != receivedId && !force) {
          throw new MismatchedComponentError(
            existingId,
            receivedId,
            currentPageKey
          )
        }

        const page = beforeSave(pages[pageKey], json)
        return dispatch(saveAndProcessPage(pageKey, page)).then(() => meta)
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}

let lastVisitController = {
  abort: () => {
    // noop
  },
}

export const visit: VisitCreator = (
  path,
  {
    method = 'GET',
    headers,
    body,
    placeholderKey,
    beforeSave = (prevPage: Page, receivedPage: PageResponse) => receivedPage,
    revisit = false,
  } = {}
) => {
  path = withoutBusters(path)

  return (dispatch, getState) => {
    placeholderKey = placeholderKey && urlToPageKey(placeholderKey)
    const hasPlaceholder = !!(
      placeholderKey && getState().pages[placeholderKey]
    )

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

    const currentPageKey = getState().superglue.currentPageKey
    dispatch(beforeVisit({ currentPageKey, fetchArgs }))
    dispatch(beforeFetch({ fetchArgs }))

    lastVisitController.abort()
    lastVisitController = controller

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { superglue, pages = {} } = getState()
        const isGet = fetchArgs[1].method === 'GET'
        const pageKey = calculatePageKey(rsp, isGet, currentPageKey)
        if (placeholderKey && hasPlaceholder) {
          dispatch(copyPage({ from: placeholderKey, to: pageKey }))
        }

        const meta = buildMeta(pageKey, json, superglue, rsp, fetchArgs)

        meta.suggestedAction = calculateNavAction(
          meta,
          rsp,
          isGet,
          pageKey,
          currentPageKey,
          revisit
        )

        const page = beforeSave(pages[pageKey], json)
        return dispatch(saveAndProcessPage(pageKey, page)).then(() => meta)
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}

function calculateNavAction(
  meta: Meta,
  rsp: Response,
  isGet: boolean,
  pageKey: string,
  currentPageKey: string,
  revisit: boolean
) {
  let suggestedAction: SuggestedAction = 'push'
  if (!rsp.redirected && !isGet) {
    suggestedAction = 'replace'
  }
  const isSamePage = pageKey == currentPageKey
  if (isSamePage) {
    suggestedAction = 'none'
  }
  if (revisit && isGet) {
    if (rsp.redirected) {
      suggestedAction = 'replace'
    } else {
      suggestedAction = 'none'
    }
  }

  return suggestedAction
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
