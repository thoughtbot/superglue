import { GraftResponse, HistoryState, VisitResponse } from '../types'
import { urlToPageKey } from './url'

export function isGraft(page: GraftResponse | VisitResponse): boolean {
  return 'action' in page && page.action === 'graft'
}

export function extractNodeAndPath(page: GraftResponse): {
  node: any
  pathToNode: string
} {
  const { data: node, action, path: pathToNode } = page

  if (action === 'graft') {
    return { node, pathToNode }
  } else {
    const errMsg =
      'Expected page to be a graft response rendered from node filtering.'
    throw new Error(errMsg)
  }
}

export function argsForHistory(path: string): [string, HistoryState] {
  const pageKey = urlToPageKey(path)

  return [
    path,
    {
      superglue: true,
      pageKey,
      posX: 0,
      posY: 0,
    },
  ]
}
