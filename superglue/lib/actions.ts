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

/**
 * A redux action you can dispatch to copy a page from one pageKey to another. Its
 * a very useful way to create optimistic updates with a URL change. For example:
 *
 * ```
 * import { copyPage, remote } from '@thoughtbot/superglue'
 *
 * dispatch(copyPage({ from: originalKey, to: targetKey}))
 *
 * ... make edits to target page and finally
 *
 * navigateTo(targetKey)
 * ```
 */
export const copyPage = createAction<{ from: PageKey; to: PageKey }>(
  '@@superglue/COPY_PAGE'
)

/**
 * A redux action you can dispatch to remove a page from your store.
 *
 * ```
 * import { removePage } from '@thoughtbot/superglue'
 *
 * dispatch(removePage({ pageKey: '/delete_me_please"}))
 * ```
 */
export const removePage = createAction<{ pageKey: PageKey }>(
  '@@superglue/REMOVE_PAGE'
)

/**
 * A redux action called before a `fetch` takes place. It will fire in `remote`
 * and `visit`. You can hook into this event in your redux slices like this:
 *
 * ```
 * import { beforeFetch } from '@thoughtbot/superglue'
 *
 * export const exampleSlice = createSlice({
 *  name: 'Example',
 *  initialState: {},
 *  extraReducers: (builder) => {
 *    builder.addCase(beforeFetch, (state, action) => {
 * ```
 */
export const beforeFetch = createAction<{ fetchArgs: FetchArgs }>(
  '@@superglue/BEFORE_FETCH'
)

/**
 * A redux action called before a `visit` takes place. You can hook into this event
 * in your redux slices like this:
 *
 * ```
 * import { beforeVisit } from '@thoughtbot/superglue'
 *
 * export const exampleSlice = createSlice({
 *  name: 'Example',
 *  initialState: {},
 *  extraReducers: (builder) => {
 *    builder.addCase(beforeVisit, (state, action) => {
 * ```
 */
export const beforeVisit = createAction<{
  currentPageKey: PageKey
  fetchArgs: FetchArgs
}>('@@superglue/BEFORE_VISIT')

/**
 * A redux action called before `remote` takes place. You can hook into this event
 * in your redux slices like this:
 *
 * ```
 * import { beforeRemote } from '@thoughtbot/superglue'
 *
 * export const exampleSlice = createSlice({
 *  name: 'Example',
 *  initialState: {},
 *  extraReducers: (builder) => {
 *    builder.addCase(beforeRemote, (state, action) => {
 * ```
 */
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
