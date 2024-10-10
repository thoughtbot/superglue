import { createAction } from '@reduxjs/toolkit'
import { FetchArgs, PageKey, JSONValue, Page, GraftResponse } from './types'
import { urlToPageKey } from './utils'

export const SAVE_RESPONSE = '@@superglue/SAVE_RESPONSE'

export const GRAFTING_ERROR = '@@superglue/GRAFTING_ERROR'
export const GRAFTING_SUCCESS = '@@superglue/GRAFTING_SUCCESS'

export const handleGraft = createAction(
  '@@superglue/HANDLE_GRAFT',
  function prepare({
    pageKey,
    page,
  }: {
    pageKey: PageKey
    page: GraftResponse
  }) {
    pageKey = urlToPageKey(pageKey)

    return {
      payload: {
        page,
        pageKey,
      },
    }
  }
)

export const superglueError = createAction<{ message: String }>(
  '@@superglue/ERROR'
)

export const updateFragments = createAction<{
  changedFragments: Record<string, JSONValue>
}>('@@superglue/UPDATE_FRAGMENTS')

export const copyPage = createAction<{ from: PageKey; to: PageKey }>(
  '@@superglue/COPY_PAGE'
)

export const removePage = createAction<{ pageKey: PageKey }>(
  '@@superglue/REMOVE_PAGE'
)

export const beforeFetch = createAction<{ fetchArgs: FetchArgs }>(
  '@@superglue/BEFORE_FETCH'
)

export const beforeVisit = createAction<{
  currentPageKey: PageKey
  fetchArgs: FetchArgs
}>('@@superglue/BEFORE_VISIT')

export const beforeRemote = createAction<{
  currentPageKey: PageKey
  fetchArgs: FetchArgs
}>('@@superglue/BEFORE_REMOTE')

export const setCSRFToken = createAction<{
  csrfToken: string | undefined
}>('@@superglue/SET_CSRF_TOKEN')

export const historyChange = createAction<{
  pathname: string
  search: string
  hash: string
}>('@@superglue/HISTORY_CHANGE')
