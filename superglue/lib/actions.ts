import { createAction } from '@reduxjs/toolkit'
import {
  FetchArgs,
  PageKey,
  GraftResponse,
  SaveResponse,
  JSONMappable,
} from './types'
import { urlToPageKey } from './utils'

export const GRAFTING_ERROR = '@@superglue/GRAFTING_ERROR'
export const GRAFTING_SUCCESS = '@@superglue/GRAFTING_SUCCESS'

export const saveResponse = createAction(
  '@@superglue/SAVE_RESPONSE',
  ({ pageKey, page }: { pageKey: string; page: SaveResponse }) => {
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
  pageKey: PageKey
}>('@@superglue/HISTORY_CHANGE')

export const setActivePage = createAction<{
  pageKey: PageKey
}>('@@superglue/SET_ACTIVE_PAGE')

export const handleFragmentGraft = createAction(
  '@@superglue/HANDLE_FRAGMENT_GRAFT',
  ({
    fragmentId,
    response,
  }: {
    fragmentId: string
    response: GraftResponse
  }) => {
    return {
      payload: {
        response,
        fragmentId,
      },
    }
  }
)

export const saveFragment = createAction(
  '@@superglue/SAVE_FRAGMENT',
  ({ fragmentId, data }: { fragmentId: string; data: JSONMappable }) => {
    return {
      payload: {
        fragmentId,
        data,
      },
    }
  }
)

export const appendToFragment = createAction(
  '@@superglue/APPEND_TO_FRAGMENT',
  ({ data, fragmentId }: { data: JSONMappable; fragmentId: string }) => {
    return {
      payload: {
        data,
        fragmentId,
      },
    }
  }
)

export const prependToFragment = createAction(
  '@@superglue/PREPEND_TO_FRAGMENT',
  ({ data, fragmentId }: { data: JSONMappable; fragmentId: string }) => {
    return {
      payload: {
        data,
        fragmentId: fragmentId,
      },
    }
  }
)
