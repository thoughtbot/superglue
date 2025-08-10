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
  SaveAndProcessPageThunk,
  DefermentThunk,
  Defer,
  JSONMappable,
  PageResponse,
  Page,
} from '../types'
import { handleStreamResponse } from './stream'
import { createProxy } from '../utils/proxy'
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

function addPlaceholdersToDeferredNodes(
  existingPage: Page,
  page: PageResponse
): PageResponse {
  const { defers = [] } = existingPage

  const prevDefers = defers.map(({ path }) => {
    const node = getIn(existingPage, path)
    const copy = JSON.stringify(node)
    return [path, JSON.parse(copy)]
  })

  return prevDefers.reduce((memo, [path, node]) => {
    return setIn(page, path, node)
  }, page)
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
  page: PageResponse
): SaveAndProcessPageThunk {
  return (dispatch, getState) => {
    pageKey = urlToPageKey(pageKey)
    let nextPage = page

    const state = getState()
    if (page.action === 'savePage' && state.pages[pageKey]) {
      const existingPage = createProxy(
        state.pages[pageKey],
        { current: state.fragments },
        new Set(),
        new WeakMap()
      )

      nextPage = JSON.parse(
        JSON.stringify(addPlaceholdersToDeferredNodes(existingPage, nextPage))
      ) as PageResponse
    }

    page.fragments.reverse().forEach((fragment) => {
      const { id, path } = fragment
      const node = getIn(nextPage, path) as JSONMappable
      nextPage = setIn(page, path, { __id: id })

      dispatch(
        saveFragment({
          fragmentId: id,
          data: node,
        })
      )
    })

    if (nextPage.action === 'graft') {
      if (typeof nextPage.fragmentContext === 'string') {
        dispatch(
          handleFragmentGraft({
            fragmentId: nextPage.fragmentContext,
            response: nextPage,
          })
        )
      } else {
        dispatch(handleGraft({ pageKey, page: nextPage }))
      }
    } else if (nextPage.action === 'handleStreamResponse') {
      // We resolve the promise here because fragment responses
      // have deferment disabled.
      dispatch(handleStreamResponse(nextPage))
      return Promise.resolve()
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
