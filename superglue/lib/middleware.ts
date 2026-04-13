import type { Middleware } from '@reduxjs/toolkit'
import {
  saveResponse,
  removePage,
  saveFragment,
  removeFragments,
  copyPage,
  resetStore,
} from './actions'
import { getConfig } from './config'
import type { RootState } from './types'

const pageFragments = new Map<string, Set<string>>()

export const pageEvictionMiddleware: Middleware<NonNullable<unknown>, RootState> =
  (store) => (next) => (action) => {
    const result = next(action)

    if (resetStore.match(action)) {
      pageFragments.clear()
      return result
    }

    if (saveFragment.match(action)) {
      const { pageKey, fragmentId } = action.payload
      if (!pageFragments.has(pageKey)) {
        pageFragments.set(pageKey, new Set())
      }
      pageFragments.get(pageKey)!.add(fragmentId)
    }

    if (copyPage.match(action)) {
      const { from, to } = action.payload
      const existing = pageFragments.get(from)
      if (existing) {
        pageFragments.set(to, new Set(existing))
      }
    }

    if (saveResponse.match(action)) {
      const { maxPages } = getConfig()
      const pages = store.getState().pages
      const allPageKeys = Object.keys(pages)

      if (allPageKeys.length > maxPages) {
        const sorted = allPageKeys
          .map((key) => ({ key, savedAt: pages[key].savedAt }))
          .sort((a, b) => b.savedAt - a.savedAt)

        const toEvict = sorted.slice(maxPages)
        for (const { key } of toEvict) {
          store.dispatch(removePage({ pageKey: key }))
        }
      }
    }

    if (removePage.match(action)) {
      const { pageKey } = action.payload
      const evictedFragments = pageFragments.get(pageKey)
      pageFragments.delete(pageKey)

      if (evictedFragments && evictedFragments.size > 0) {
        const stillReferenced = new Set<string>()
        for (const [, fragments] of pageFragments) {
          for (const id of fragments) {
            stillReferenced.add(id)
          }
        }

        const orphaned = Array.from(evictedFragments).filter(
          (id) => !stillReferenced.has(id)
        )

        if (orphaned.length > 0) {
          store.dispatch(removeFragments({ fragmentIds: orphaned }))
        }
      }
    }

    return result
  }
