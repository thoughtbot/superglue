import { urlToPageKey, getIn, propsAtParam } from '../utils'
import {
  saveResponse,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
  updateFragments,
  handleGraft,
} from '../actions'
import { remote } from './requests'
import {
  VisitResponse,
  SaveAndProcessPageThunk,
  DefermentThunk,
  GraftResponse,
  Defer,
  JSONMappable,
} from '../types'
export * from './requests'

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
        // props_at will always be present in a graft response
        // That's why this is marked `as string`
        const keyPath = propsAtParam(url) as string

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

/**
 * Save and process a rendered view from PropsTemplate. This is the primitive
 * function that `visit` and `remote` calls when it receives a page.
 *
 * If you render a page outside the normal request response cycle, e.g,
 * websocket, you can use this function to save the payload.
 */
export function saveAndProcessPage(
  pageKey: string,
  page: VisitResponse | GraftResponse
): SaveAndProcessPageThunk {
  return (dispatch, getState) => {
    pageKey = urlToPageKey(pageKey)

    const { defers = [] } = page

    if ('action' in page) {
      const prevPage = getState().pages[pageKey]
      dispatch(handleGraft({ pageKey, page }))
      const currentPage = getState().pages[pageKey]

      currentPage.fragments.forEach((fragment) => {
        const { type, path } = fragment
        // A fragment only works on a block in props_template. So using getIn
        // will always return a JSONMappable
        const currentFragment = getIn(currentPage, path) as JSONMappable
        const prevFragment = getIn(prevPage, path) as JSONMappable
        if (!prevFragment) {
          dispatch(
            updateFragments({
              name: type,
              pageKey: pageKey,
              value: currentFragment,
              path,
            })
          )
        } else if (currentFragment !== prevFragment) {
          dispatch(
            updateFragments({
              name: type,
              pageKey: pageKey,
              value: currentFragment,
              previousValue: prevFragment,
              path,
            })
          )
        }
      })
    } else {
      dispatch(saveResponse({ pageKey, page }))
      const currentPage = getState().pages[pageKey]

      currentPage.fragments.forEach((fragment) => {
        const { type, path } = fragment
        const currentFragment = getIn(currentPage, path) as JSONMappable

        dispatch(
          updateFragments({
            name: type,
            pageKey: pageKey,
            value: currentFragment,
            path,
          })
        )
      })
    }

    const hasFetch = typeof fetch != 'undefined'
    if (hasFetch) {
      return dispatch(fetchDeferments(pageKey, defers)).then(() =>
        Promise.resolve()
      )
    } else {
      return Promise.resolve()
    }
  }
}
