import { urlToPageKey, getIn } from '../utils'
import parse from 'url-parse'
import {
  SAVE_RESPONSE,
  HANDLE_GRAFT,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
  UPDATE_FRAGMENTS,
} from '../actions'
import { remote } from './requests'
import {
  CopyAction,
  VisitResponse,
  SaveResponseAction,
  UpdateFragmentsAction,
  SaveAndProcessPageThunk,
  DefermentThunk,
  HandleGraftAction,
  GraftResponse,
  Page,
  Defer,
  JSONMappable,
} from '../types'
export * from './requests'

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

export function handleGraft({
  pageKey,
  page,
}: {
  pageKey: string
  page: GraftResponse
}): HandleGraftAction {
  pageKey = urlToPageKey(pageKey)

  return {
    type: HANDLE_GRAFT,
    payload: {
      pageKey,
      page,
    },
  }
}

function fetchDeferments(
  pageKey: string,
  defers: Defer[] = []
): DefermentThunk {
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

        // props_at will always be present in a graft response
        // That's why this is marked `as string`
        const keyPath = parsedUrl.query.props_at as string

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

function updateFragmentsUsing(page: Page): UpdateFragmentsAction {
  const changedFragments: Record<string, JSONMappable> = {}
  page.fragments.forEach((fragment) => {
    const { type, path } = fragment
    // A fragment only works on a block in props_template. So using getIn
    // will always return a JSONMappable
    changedFragments[type] = getIn(page, path) as JSONMappable
  })

  return {
    type: UPDATE_FRAGMENTS,
    payload: { changedFragments },
  }
}

export function saveAndProcessPage(
  pageKey: string,
  page: VisitResponse | GraftResponse
): SaveAndProcessPageThunk {
  return (dispatch, getState) => {
    pageKey = urlToPageKey(pageKey)

    const { defers = [] } = page

    if ('action' in page) {
      dispatch(handleGraft({ pageKey, page }))
    } else {
      dispatch(saveResponse({ pageKey, page }))
    }

    const hasFetch = typeof fetch != 'undefined'
    if (hasFetch) {
      return dispatch(fetchDeferments(pageKey, defers)).then(() => {
        if (page.fragments.length > 0) {
          const finishedPage = getState().pages[pageKey]
          dispatch(updateFragmentsUsing(finishedPage))
          return Promise.resolve()
        }
      })
    } else {
      return Promise.resolve()
    }
  }
}
