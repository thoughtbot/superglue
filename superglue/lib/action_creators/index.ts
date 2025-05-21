import { urlToPageKey, getIn, setIn, propsAtParam } from '../utils'
import {
  saveResponse,
  GRAFTING_ERROR,
  GRAFTING_SUCCESS,
  handleGraft,
  saveFragment,
  handleFragmentGraft,
} from '../actions'
import { remote } from './requests'
import {
  SaveResponse,
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
  page: SaveResponse | GraftResponse
): SaveAndProcessPageThunk {
  return (dispatch) => {
    pageKey = urlToPageKey(pageKey)

    let nextPage = page

    page.fragments.reverse().forEach((fragment) => {
      const { type, path } = fragment
      const node = getIn(nextPage, path) as JSONMappable
      nextPage = setIn(page, path, { __id: type })

      dispatch(
        saveFragment({
          fragmentKey: type,
          fragment: node,
        })
      )
    })

    if ('action' in nextPage && typeof nextPage.action === 'string') {
      if (typeof nextPage.fragmentContext === 'string') {
        dispatch(
          handleFragmentGraft({
            fragmentKey: nextPage.fragmentContext,
            response: nextPage,
          })
        )
      } else {
        dispatch(handleGraft({ pageKey, page: nextPage }))
      }
    } else {
      dispatch(saveResponse({ pageKey, page: nextPage }))
    }

    const hasFetch = typeof fetch != 'undefined'
    if (hasFetch) {
      return dispatch(fetchDeferments(pageKey, nextPage.defers)).then(() =>
        Promise.resolve()
      )
    } else {
      return Promise.resolve()
    }
  }
}
