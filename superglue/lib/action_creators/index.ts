import { isGraft, urlToPageKey, getIn } from '../utils'
import parse from 'url-parse'
import {
  SAVE_RESPONSE,
  HANDLE_GRAFT,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
  COPY_PAGE,
  UPDATE_FRAGMENTS,
} from '../actions'
import { remote } from './requests'
import {
  Page,
  CopyAction,
  VisitResponse,
  SaveResponseAction,
} from '../types'
export * from './requests'

export function copyPage({
  from,
  to,
}: {
  from: string
  to: string
}): CopyAction {
  return {
    type: COPY_PAGE,
    payload: {
      from,
      to,
    },
  }
}

export function saveResponse({
  pageKey,
  page,
}: {
  pageKey: string
  page: VisitResponse
}): SaveResponseAction {
  pageKey = urlToPageKey(pageKey)

  return {
    type: SAVE_RESPONSE,
    payload: {
      pageKey,
      page,
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

function fetchDeferments(pageKey: string, defers = []) {
  pageKey = urlToPageKey(pageKey)
  return (dispatch) => {
    const fetches = defers
      .filter(({ type }) => type === 'auto')
      .map(function ({
        url,
        successAction = GRAFTING_SUCCESS,
        failAction = GRAFTING_ERROR,
      }) {
        const parsedUrl = new parse(url, true)
        const keyPath = parsedUrl.query.props_at

        return dispatch(remote(url, { pageKey }))
          .then(() => {
            dispatch({
              type: successAction,
              payload: {
                pageKey,
                keyPath,
              },
            })
          })
          .catch((err) => {
            dispatch({
              type: failAction,
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

function updateFragmentsUsing(page) {
  const changedFragments = {}
  page.fragments.forEach((fragment) => {
    const { type, path } = fragment
    changedFragments[type] = getIn(page, path)
  })

  return {
    type: UPDATE_FRAGMENTS,
    payload: { changedFragments },
  }
}

export function saveAndProcessPage(
  pageKey: string,
  page: VisitResponse
) {
  return (dispatch, getState) => {
    pageKey = urlToPageKey(pageKey)

    const { defers = [] } = page

    if (isGraft(page)) {
      dispatch(handleGraft({ pageKey, page }))
    } else {
      dispatch(saveResponse({ pageKey, page }))
    }

    const hasFetch = typeof fetch != 'undefined'
    if (hasFetch) {
      return dispatch(fetchDeferments(pageKey, defers)).then(() => {
        if (page.fragments.length > 0) {
          const finishedPage = getState().pages[pageKey]
          return dispatch(updateFragmentsUsing(finishedPage))
        }
      })
    } else {
      return Promise.resolve()
    }
  }
}
