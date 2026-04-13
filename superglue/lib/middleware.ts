import type { Middleware } from '@reduxjs/toolkit'
import { saveResponse, removePage } from './actions'
import { getConfig } from './config'
import type { RootState } from './types'

export const pageEvictionMiddleware: Middleware<NonNullable<unknown>, RootState> =
  (store) => (next) => (action) => {
    const result = next(action)

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

    return result
  }
