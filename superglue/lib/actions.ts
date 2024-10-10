import { createAction } from '@reduxjs/toolkit'
import {
  FetchArgs,
  PageKey,
  JSONValue,
  GraftResponse,
  VisitResponse,
} from './types'
import { urlToPageKey } from './utils'

export const GRAFTING_ERROR = '@@superglue/GRAFTING_ERROR'
export const GRAFTING_SUCCESS = '@@superglue/GRAFTING_SUCCESS'

export const saveResponse = createAction(
  '@@superglue/SAVE_RESPONSE',
  ({ pageKey, page }: { pageKey: string; page: VisitResponse }) => {
    pageKey = urlToPageKey(pageKey)

    return {
      payload: {
        pageKey,
        page,
      },
    }
  }
)

export const handleGraft = createAction(
  '@@superglue/HANDLE_GRAFT',
  ({ pageKey, page }: { pageKey: string; page: GraftResponse }) => {
    pageKey = urlToPageKey(pageKey)

    return {
      payload: {
        page,
        pageKey,
      },
    }
  }
)

export const superglueError = createAction<{ message: string }>(
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
