import { VisitResponse, GraftResponse } from '.'
import type { Action } from '@reduxjs/toolkit'
import { BasicRequestInit } from '.'

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
    changedFragments: Record<string, unknown>
  }
}

export interface SetCSRFToken extends Action {
  type: '@@superglue/SET_CSRF_TOKEN'
  payload: {
    csrfToken: string
  }
}

/**
 * Tuple of Fetch arguments that Superglue passes to Fetch.
 */
export type FetchArgs = [string, BasicRequestInit]

export interface BeforeVisit extends Action {
  type: '@@superglue/BEFORE_VISIT'
  payload: {
    fetchArgs: [string, BasicRequestInit]
    currentPageKey: string
  }
}

export interface BeforeRemote extends Action {
  type: '@@superglue/BEFORE_REMOTE'
  payload: {
    fetchArgs: [string, BasicRequestInit]
    currentPageKey: string
  }
}

export interface HandleError extends Action {
  type: '@@superglue/ERROR'
  payload: {
    message: string
  }
}

type USER_SPECIFIED_STRING = string

export interface GraftingSuccessAction extends Action {
  type: '@@superglue/GRAFTING_SUCCESS' | USER_SPECIFIED_STRING
  payload: {
    pageKey: string
    keyPath: string
  }
}

export interface GraftingErrorAction extends Action {
  type: '@@superglue/GRAFTING_ERROR' | USER_SPECIFIED_STRING
  payload: {
    pageKey: string
    url: string
    err: unknown
    keyPath: string
  }
}

export type LifecycleAction = HandleError | BeforeVisit | BeforeRemote

export type PageReducerAction =
  | SaveResponseAction
  | HandleGraftAction
  | GraftingSuccessAction
  | GraftingErrorAction
  | CopyAction
  | RemovePageAction
  | UpdateFragmentsAction

export type SuperglueReducerAction = SaveResponseAction | SetCSRFToken

export type AllAction =
  | PageReducerAction
  | GraftingSuccessAction
  | GraftingErrorAction
  | SuperglueReducerAction
  | LifecycleAction
  | Action
