import { FetchArgs } from './actions'

export * from './actions'

export interface ParsedResponse {
  rsp: Response
  json: any
}

export type Defer = {
  url: string
  type: 'auto' | 'manual'
  path: string
}

export type VisitResponse = {
  data: any
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
  action: string
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

export type SuperglueState = {
  currentPageKey: string
  pathname: string
  search: string
  hash: string
  csrfToken?: string
  assets: string[]
}

export type RootState = {
  superglue: SuperglueState
  pages: AllPages
  [key: string]: any
}

export type PageOwnProps = {
  pageKey: string
  navigateTo: () => void
  visit: () => void
  remote: () => void
}

export type PageComponentProps = PageOwnProps & {
  fragments: Fragment[]
  csrfToken?: string
  [key: string]: any
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
