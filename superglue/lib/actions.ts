import { createAction } from '@reduxjs/toolkit'
import { BasicRequestInit, FetchArgs, PageKey } from './types'

export const SAVE_RESPONSE = '@@superglue/SAVE_RESPONSE'
export const HANDLE_GRAFT = '@@superglue/HANDLE_GRAFT'

export const SUPERGLUE_ERROR = '@@superglue/ERROR'
export const GRAFTING_ERROR = '@@superglue/GRAFTING_ERROR'
export const GRAFTING_SUCCESS = '@@superglue/GRAFTING_SUCCESS'

export const REMOVE_PAGE = '@@superglue/REMOVE_PAGE'
export const COPY_PAGE = '@@superglue/COPY_PAGE'
export const UPDATE_FRAGMENTS = '@@superglue/UPDATE_FRAGMENTS'

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
