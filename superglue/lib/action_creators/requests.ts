import {
  argsForFetch,
  parseResponse,
  needsRefresh,
  urlToPageKey,
  withoutBusters,
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
  NavigationAction,
  VisitMeta,
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
  constructor(message: string) {
    super(message)
    this.name = 'MismatchedComponentError'
  }
}

export const remote: RemoteCreator = (
  path,
  {
    pageKey: targetPageKey,
    force = false,
    beforeSave = (prevPage: Page, receivedPage: PageResponse) => receivedPage,
    ...rest
  } = {}
) => {
  path = withoutBusters(path)
  targetPageKey = targetPageKey && urlToPageKey(targetPageKey)

  return (dispatch, getState) => {
    const fetchArgs = argsForFetch(getState, path, rest)
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

        const page = beforeSave(pages[pageKey], json)
        return dispatch(saveAndProcessPage(pageKey, page)).then(() => meta)
      })
      .catch((e) => handleFetchErr(e, fetchArgs, dispatch))
  }
}

let lastVisitController = {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  abort: (_reason: string) => {
    // noop
  },
}

export const visit: VisitCreator = (
  path,
  {
    placeholderKey,
    beforeSave = (prevPage: Page, receivedPage: PageResponse) => receivedPage,
    revisit = false,
    ...rest
  } = {}
) => {
  path = withoutBusters(path)

  return (dispatch, getState) => {
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
    const fetchArgs = argsForFetch(getState, path, {
      ...rest,
      signal,
    })

    dispatch(beforeVisit({ currentPageKey, fetchArgs }))
    dispatch(beforeFetch({ fetchArgs }))

    lastVisitController.abort(
      'Aborting the previous `visit`. There can be one visit at a time. Use `remote` if there is a need for async requests.'
    )
    lastVisitController = controller

    return fetch(...fetchArgs)
      .then(parseResponse)
      .then(({ rsp, json }) => {
        const { superglue, pages = {} } = getState()
        const isGet = fetchArgs[1].method === 'GET'
        const pageKey = calculatePageKey(rsp, isGet, currentPageKey)
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

        const meta = buildMeta(pageKey, json, superglue, rsp, fetchArgs)

        const visitMeta: VisitMeta = {
          ...meta,
          navigationAction: calculateNavAction(
            meta,
            rsp,
            isGet,
            pageKey,
            currentPageKey,
            revisit
          ),
        }

        const page = beforeSave(pages[pageKey], json)
        return dispatch(saveAndProcessPage(pageKey, page)).then(() => visitMeta)
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
  let navigationAction: NavigationAction = 'push'
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
