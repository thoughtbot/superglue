import { ThunkAction } from 'redux-thunk'
import { VisitResponse, GraftResponse, RootState } from '.'
import { AnyAction, UnknownAction } from 'redux'

export interface SaveResponseAction extends AnyAction {
  type: '@@superglue/SAVE_RESPONSE'
  payload: {
    pageKey: string
    page: VisitResponse
  }
}

export interface HandleGraftAction extends AnyAction {
  type: '@@superglue/HANDLE_GRAFT'
  payload: {
    pageKey: string
    page: GraftResponse
  }
}

export interface CopyAction extends AnyAction {
  type: '@@superglue/COPY_PAGE'
  payload: {
    from: string
    to: string
  }
}

export interface RemovePageAction extends AnyAction {
  type: '@@superglue/REMOVE_PAGE'
  payload: {
    pageKey: string
  }
}

export interface UpdateFragmentsAction extends AnyAction {
  type: '@@superglue/UPDATE_FRAGMENTS'
  payload: {
    changedFragments: any
  }
}

export interface SetCSRFToken extends AnyAction {
  type: '@@superglue/SET_CSRF_TOKEN'
  payload: {
    csrfToken: string
  }
}

export interface HistoryChange extends AnyAction {
  type: '@@superglue/HISTORY_CHANGE'
  payload: {
    pathname: string
    search: string
    hash: string
  }
}

export type FetchArgs = [string, RequestInit]

export interface BeforeVisit extends AnyAction {
  type: '@@superglue/BEFORE_VISIT'
  payload: {
    fetchArgs: [string, RequestInit]
    currentPageKey: string
  }
}

export interface BeforeRemote extends AnyAction {
  type: '@@superglue/BEFORE_REMOTE'
  payload: {
    fetchArgs: [string, RequestInit]
    currentPageKey: string
  }
}

export interface BeforeFetch extends AnyAction {
  type: '@@superglue/BEFORE_FETCH'
  payload: {
    fetchArgs: [string, RequestInit]
  }
}

export interface HandleError extends AnyAction {
  type: '@@superglue/ERROR'
  payload: {
    message: string
  }
}

export type LifecycleAction =
  | BeforeFetch
  | HandleError
  | BeforeVisit
  | BeforeRemote

export type PageReducerAction =
  | SaveResponseAction
  | HandleGraftAction
  | CopyAction
  | RemovePageAction
  | UpdateFragmentsAction

export type SuperglueReducerAction =
  | SaveResponseAction
  | SetCSRFToken
  | HistoryChange

export type AllAction =
  | PageReducerAction
  | SuperglueReducerAction
  | LifecycleAction
