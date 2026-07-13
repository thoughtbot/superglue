import type { Action } from '@reduxjs/toolkit'
import { ThunkAction } from '@reduxjs/toolkit'
import { RootState, ExtraArgument } from './store'
import { Result, ErrorResult, VisitResult, VisitProps, RemoteProps } from './requests'
import { PageKey } from './page'

export type SaveAndProcessPageThunk = ThunkAction<
  Promise<void>,
  RootState,
  ExtraArgument,
  Action
>

export type MetaThunk = ThunkAction<
  Promise<Result | ErrorResult>,
  RootState,
  ExtraArgument,
  Action
>
export type VisitMetaThunk = ThunkAction<
  Promise<VisitResult | ErrorResult>,
  RootState,
  ExtraArgument,
  Action
>

export type DefermentThunk = ThunkAction<
  Promise<void[]>,
  RootState,
  ExtraArgument,
  Action
>

/**
 * VisitCreator is a Redux action creator that returns a thunk. Use this to build
 * the {@link Visit} function. Typically it's already generated in `application_visit.js`
 */
export type VisitCreator = (
  input: string | PageKey,
  options?: VisitProps
) => VisitMetaThunk

/**
 * RemoteCreator is a Redux action creator that returns a thunk. Use this to build
 * the {@link Remote} function. Typically it's already generated in `application_visit.js`
 */
export type RemoteCreator = (
  input: string | PageKey,
  options?: RemoteProps
) => MetaThunk
