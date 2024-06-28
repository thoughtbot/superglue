import { VisitResponse, GraftResponse } from '.'
import { Action } from 'redux'

export interface SaveResponseAction extends Action {
  type: '@@superglue/SAVE_RESPONSE'
  payload: {
    pageKey: string
    page: VisitResponse
  }
}

export interface HandleGraftAction extends Action {
  type: '@@superglue/HANDLE_GRAFT'
  payload: {
    pageKey: string
    page: GraftResponse
  }
}

export interface CopyAction extends Action {
  type: '@@superglue/COPY_PAGE'
  payload: {
    from: string
    to: string
  }
}

export interface RemovePageAction extends Action {
  type: '@@superglue/REMOVE_PAGE'
  payload: {
    pageKey: string
  }
}

export interface UpdateFragmentsAction extends Action {
  type: '@@superglue/UPDATE_FRAGMENTS'
  payload: {
    changedFragments: {
      [key: string]: any
    }
  }
}

export interface SetCSRFToken extends Action {
  type: '@@superglue/SET_CSRF_TOKEN'
  payload: {
    csrfToken: string
  }
}

export interface HistoryChange extends Action {
  type: '@@superglue/HISTORY_CHANGE'
  payload: {
    pathname: string
    search: string
    hash: string
  }
}

export type FetchArgs = [string, RequestInit]

export interface BeforeVisit extends Action {
  type: '@@superglue/BEFORE_VISIT'
  payload: {
    fetchArgs: [string, RequestInit]
    currentPageKey: string
  }
}

export interface BeforeRemote extends Action {
  type: '@@superglue/BEFORE_REMOTE'
  payload: {
    fetchArgs: [string, RequestInit]
    currentPageKey: string
  }
}

export interface BeforeFetch extends Action {
  type: '@@superglue/BEFORE_FETCH'
  payload: {
    fetchArgs: [string, RequestInit]
  }
}

export interface HandleError extends Action {
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
