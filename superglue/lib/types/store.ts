import type { Action } from '@reduxjs/toolkit'
import { EnhancedStore, Tuple, StoreEnhancer } from '@reduxjs/toolkit'
import { ThunkDispatch } from '@reduxjs/toolkit'
import { JSONMappable } from './json'
import { PageKey, FlashState, Page } from './page'
import { AllFragments } from './fragment'
import { FetchArgs } from './actions'
import { Config } from '../config'

/**
 * The store where all page responses are stored indexed by PageKey. You are encouraged
 * to mutate the Pages in this store.
 */
export type AllPages<T = JSONMappable> = Record<PageKey, Page<T>>

/**
 * A read only state that contains meta information about
 * the current page.
 */
export interface SuperglueState {
  /** The {@link PageKey} (url pathname + search) of the current page. This can be pass to {@link Remote}.*/
  currentPageKey: PageKey
  /** The query string object of the current url.*/
  search: Record<string, string | undefined>
  /** The Rails csrfToken that you can use for forms.*/
  csrfToken?: string
  /** The tracked asset digests.*/
  assets: string[]
  /** Flag that says if a visit is currently in flight */
  isVisiting: boolean
}

/**
 * The root state for a Superglue application. It occupies
 * 2 keys in your app.
 */
export interface RootState<T = JSONMappable> {
  /** Contains readonly metadata about the current page */
  superglue: SuperglueState
  /** Every {@link PageResponse} that superglue recieves is stored here.*/
  pages: AllPages<T>
  fragments: AllFragments
  flash: FlashState
  [name: string]: unknown
}

/** @internal */
export interface ExtraArgument {
  config: Config
  lastVisitController: { abort: (reason: string) => void }
}

export type Dispatch = ThunkDispatch<RootState, ExtraArgument, Action>

/**
 * A Store created with Redux Toolkit's `configureStore` setup with reducers
 * from Superglue. If you are using superglue_rails this would have been
 * generated for you in `store.js` and setup correctly in application.js
 */
export type SuperglueStore = EnhancedStore<
  RootState,
  Action,
  Tuple<
    [
      StoreEnhancer<{
        dispatch: Dispatch
      }>,
      StoreEnhancer
    ]
  >
>

/** A variation of RequestInit except the headers must be a regular object */
export interface BasicRequestInit extends RequestInit {
  headers?: {
    [key: string]: string
  }
}
