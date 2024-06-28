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
