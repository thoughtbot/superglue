export function needsRefresh(
  prevAssets: string[],
  newAssets: string[]
): boolean {
  if (prevAssets && newAssets) {
    const hasNewAssets = !newAssets.every((asset) =>
      prevAssets.includes(asset)
    )
    return hasNewAssets
  } else {
    return false
  }
}
