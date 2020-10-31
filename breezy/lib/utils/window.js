let fetch

export const getFetch = () => fetch
export const setFetch = (f) => (fetch = f)
export const unsetFetch = () => (fetch = null)

export function needsRefresh(prevAssets, newAssets) {
  if (prevAssets && newAssets) {
    const hasNewAssets = !newAssets.every((asset) =>
      prevAssets.includes(asset)
    )
    return hasNewAssets
  } else {
    return false
  }
}
