let window

export const getWindow = () => window
export const setWindow = (win) => window = win
export const unsetWindow = () => window = null

export const hasWindow = () => typeof window !== 'undefined' && window !== null
export const pageYOffset = () => window && window.pageYOffset
export const pageXOffset = () => window && window.pageXOffset

export const refreshBrowser = () => {
  const window = getWindow()

  if (window !== undefined) {
    window.location.reload()
  }
}

export const needsRefresh = (prevAssets, newAssets) => {
  if (prevAssets && newAssets) {
    const hasNewAssets = !newAssets.every(asset => prevAssets.includes(asset))
    return hasNewAssets && hasWindow()
  } else {
    return false
  }
}
