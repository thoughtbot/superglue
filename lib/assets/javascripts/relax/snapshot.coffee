#= require relax/component_url
#= require relax/csrf_token
#= require relax/utils

class Relax.Snapshot
  constructor: (@controller) ->
    @pageCache = {}
    @currentBrowserState = null
    @pageCacheSize = 20
    @currentPage = null
    @loadedAssets= null

  onHistoryChange: (event) =>
    if event.state?.relax && event.state.url != @currentBrowserState.url
      previousUrl = new Relax.ComponentUrl(@currentBrowserState.url)
      newUrl = new Relax.ComponentUrl(event.state.url)

      if restorePoint = @pageCache[newUrl.absolute]
        @cacheCurrentPage()
        @currentPage = restorePoint
        @controller.restore(@currentPage)
      else
        @controller.request event.target.location.href

  constrainPageCacheTo: (limit = @pageCacheSize) =>
    pageCacheKeys = Object.keys @pageCache

    cacheTimesRecentFirst = pageCacheKeys.map (url) =>
      @pageCache[url].cachedAt
    .sort (a, b) -> b - a

    for key in pageCacheKeys when @pageCache[key].cachedAt <= cacheTimesRecentFirst[limit]
      delete @pageCache[key]

  transitionCacheFor: (url) =>
    return if url is @currentBrowserState.url
    cachedPage = @pageCache[url]
    cachedPage if cachedPage and !cachedPage.transitionCacheDisabled

  pagesCached: (size = @pageCacheSize) =>
    @pageCacheSize = parseInt(size) if /^[\d]+$/.test size

  cacheCurrentPage: =>
    return unless @currentPage
    currentUrl = new Relax.ComponentUrl @currentBrowserState.url

    Relax.Utils.merge @currentPage,
      cachedAt: new Date().getTime()
      positionY: window.pageYOffset
      positionX: window.pageXOffset
      url: currentUrl.relative
      pathname: currentUrl.pathname

    @pageCache[currentUrl.absolute] = @currentPage

  rememberCurrentUrlAndState: =>
    window.history.replaceState { relax: true, url: document.location.href }, '', document.location.href
    @currentBrowserState = window.history.state

  reflectNewUrl: (url) =>
    if (url = new Relax.ComponentUrl url).absolute != document.location.href
      preservedHash = if url.hasNoHash() then document.location.hash else ''
      window.history.pushState { relax: true, url: url.absolute + preservedHash }, '', url.absolute

  updateCurrentBrowserState: =>
    @currentBrowserState = window.history.state

  changePage: (nextPage, options) =>
    if @currentPage and @assetsChanged(nextPage)
      document.location.reload()
      return

    @currentPage = nextPage
    @currentPage.title = options.title ? @currentPage.title
    document.title = @currentPage.title if @currentPage.title isnt false

    Relax.CSRFToken.update @currentPage.csrf_token if @currentPage.csrf_token?
    @updateCurrentBrowserState()

  assetsChanged: (nextPage) =>
    @loadedAssets ||= @currentPage.assets
    fetchedAssets = nextPage.assets
    fetchedAssets.length isnt @loadedAssets.length or Relax.Utils.intersection(fetchedAssets, @loadedAssets).length isnt @loadedAssets.length

  graftByKeypath: (keypath, node, opts={})=>
    for k, v in @pageCache
      @history.pageCache[k] = Relax.Utils.graftByKeypath(keypath, node, v, opts)

    @currentPage = Relax.Utils.graftByKeypath(keypath, node, @currentPage, opts)
    Relax.Utils.triggerEvent Relax.EVENTS.LOAD, @currentPage
