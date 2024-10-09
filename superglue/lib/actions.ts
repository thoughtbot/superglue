import { createAction } from '@reduxjs/toolkit'
import { BasicRequestInit, FetchArgs, PageKey } from './types'

export const BEFORE_REMOTE = '@@superglue/BEFORE_REMOTE'

export const SAVE_RESPONSE = '@@superglue/SAVE_RESPONSE'
export const HANDLE_GRAFT = '@@superglue/HANDLE_GRAFT'

export const SUPERGLUE_ERROR = '@@superglue/ERROR'
export const GRAFTING_ERROR = '@@superglue/GRAFTING_ERROR'
export const GRAFTING_SUCCESS = '@@superglue/GRAFTING_SUCCESS'

export const HISTORY_CHANGE = '@@superglue/HISTORY_CHANGE'
export const SET_CSRF_TOKEN = '@@superglue/SET_CSRF_TOKEN'
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
