import { createAction } from '@reduxjs/toolkit'
import { FetchArgs, PageKey, JSONValue } from './types'

export const SAVE_RESPONSE = '@@superglue/SAVE_RESPONSE'
export const HANDLE_GRAFT = '@@superglue/HANDLE_GRAFT'

export const GRAFTING_ERROR = '@@superglue/GRAFTING_ERROR'
export const GRAFTING_SUCCESS = '@@superglue/GRAFTING_SUCCESS'

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
