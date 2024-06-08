import { urlToPageKey } from './url'

export function isGraft(page) {
  return page.action === 'graft'
}

export function extractNodeAndPath(page) {
  const { data: node, action, path: pathToNode } = page

  if (action === 'graft') {
    return { node, pathToNode }
  } else {
    const errMsg =
      'Expected page to be a graft response rendered from node filtering.'
    throw new Error(errMsg)
  }
}

export function argsForHistory(path) {
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
