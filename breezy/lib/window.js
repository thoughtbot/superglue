let window

export const getWindow = () => window
export const setWindow = (win) => (window = win)
export const unsetWindow = () => (window = null)

export const hasWindow = () =>
  typeof window !== 'undefined' && window !== null

export function refreshBrowser() {
  const window = getWindow()

  if (window !== undefined) {
    window.location.reload()
  }
}

export function needsRefresh(prevAssets, newAssets) {
  if (prevAssets && newAssets) {
    const hasNewAssets = !newAssets.every((asset) =>
      prevAssets.includes(asset)
    )
    return hasNewAssets && hasWindow()
  } else {
    return false
  }
}
