import { AllAction, FetchArgs } from './actions'
import {
  EnhancedStore,
  Tuple,
  StoreEnhancer,
  AnyAction,
} from '@reduxjs/toolkit'
import { ThunkAction } from '@reduxjs/toolkit'
import { ThunkDispatch } from '@reduxjs/toolkit'

export * from './actions'

export interface ParsedResponse {
  rsp: Response
  json: PageResponse
}

export type Defer = {
  url: string
  type: 'auto' | 'manual'
  path: string
}

export type VisitResponse = {
  data: {
    [key: string]: unknown
  }
  componentIdentifier: string
  assets: string[]
  csrfToken?: string
  fragments: Fragment[]
  defers: Defer[]

  renderedAt: number
  restoreStrategy:
    | 'fromCacheOnly'
    | 'revisitOnly'
    | 'fromCacheAndRevisitInBackground'
}

export type Page = VisitResponse & {
  savedAt: number
  pageKey: string
}

export type GraftResponse = VisitResponse & {
  action: 'graft'
  path: string
}

export type PageResponse = GraftResponse | VisitResponse

export type Fragment = {
  type: string
  path: string
}

export type AllPages = {
  [key: string]: Page
}

// It should be possible to make this all NOT optional
export type SuperglueState = {
  currentPageKey?: string
  pathname?: string
  search?: string
  hash?: string
  csrfToken?: string
  assets?: string[]
}

export type RootState = {
  superglue: SuperglueState
  pages: AllPages
}

export type PageOwnProps = {
  pageKey: string
  navigateTo: (
    path: string,
    { action, ownProps }: { action: string; ownProps: unknown }
  ) => boolean
  visit: Visit
  remote: Remote
  [key: string]: unknown
}

export type Content = PageOwnProps & {
  pageKey: string
  fragments: Fragment[]
  csrfToken?: string
}

interface BaseProps {
  method?: string
  body?: BodyInit
  headers?: HeadersInit
  beforeSave?: (
    prevPage: VisitResponse,
    receivedPage: VisitResponse
  ) => VisitResponse
}

export interface RemoteProps extends BaseProps {
  pageKey?: string
}

export interface VisitProps extends BaseProps {
  revisit?: boolean
  placeholderKey?: string
}

export interface Meta {
  pageKey: string
  page: VisitResponse
  redirected: boolean
  rsp: Response
  fetchArgs: FetchArgs
  componentIdentifier: string
  needsRefresh: boolean
  suggestedAction?: 'push' | 'replace' | 'none'
}
// I can do Visit['props'] or better yet Visit['options']
export type Visit = (pageKey: string, props: VisitProps) => Promise<Meta>

export type Remote = (pageKey: string, props: RemoteProps) => Promise<Meta>

export type Dispatch = ThunkDispatch<RootState, undefined, AllAction>

export type SuperglueStore = EnhancedStore<
  RootState,
  AllAction | AnyAction,
  Tuple<
    [
      StoreEnhancer<{
        dispatch: Dispatch
      }>,
      StoreEnhancer
    ]
  >
>

export interface Handlers {
  onClick: (event: Event & KeyboardEvent) => void
  onSubmit: (event: Event) => void
}

export type UJSHandlers = ({
  ujsAttributePrefix,
  visit,
  remote,
}: {
  ujsAttributePrefix: string
  visit: Visit
  remote: Remote
}) => Handlers

export interface HistoryState {
  superglue: true
  pageKey: string
  posX: number
  posY: number
}

export type SaveAndProcessPageThunk = ThunkAction<
  Promise<void>,
  RootState,
  never,
  AllAction
>

export type MetaThunk = ThunkAction<Promise<Meta>, RootState, never, AllAction>

export type DefermentThunk = ThunkAction<
  Promise<void[]>,
  RootState,
  never,
  AllAction
>
