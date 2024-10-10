import type { Action } from '@reduxjs/toolkit'
import { BasicRequestInit } from '.'

/**
 * Tuple of Fetch arguments that Superglue passes to Fetch.
 */
export type FetchArgs = [string, BasicRequestInit]

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
