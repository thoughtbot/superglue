ComponentUrl = require('./component_url.coffee')
CSRFToken = require('./csrf_token.coffee')
Utils = require('./utils.coffee')
EVENTS = require('./events.coffee')

class Snapshot
  constructor: (@controller, @history) ->
    @pageCache = {}
    @currentBrowserState = null
    @pageCacheSize = 10
    @currentPage = null
    @loadedAssets= null

  onHistoryChange: (location, action) =>
    if action == 'POP' && location.state?.breezy && location.state.url!= @currentBrowserState.url
      previousUrl = new ComponentUrl(@currentBrowserState.url)
      newUrl = new ComponentUrl(location.state.url)

      if restorePoint = @pageCache[newUrl.absolute]
        @cacheCurrentPage()
        @currentPage = restorePoint
        @controller.restore(@currentPage)
      else
        @controller.request location.state.url

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
    currentUrl = new ComponentUrl @currentBrowserState.url

    Utils.merge @currentPage,
      cachedAt: new Date().getTime()
      positionY: window.pageYOffset
      positionX: window.pageXOffset
      url: currentUrl.relative
      pathname: currentUrl.pathname
      transition_cache: true

    @pageCache[currentUrl.absolute] = @currentPage

  rememberCurrentUrlAndState: =>
    @history.replace @currentComponentUrl().pathname, { breezy: true, url: @currentComponentUrl().href }
    @currentBrowserState = @history.location.state

  removeParamFromUrl: (url, parameter) =>
    return url
      .replace(new RegExp('^([^#]*\?)(([^#]*)&)?' + parameter + '(\=[^&#]*)?(&|#|$)' ), '$1$3$5')
      .replace(/^([^#]*)((\?)&|\?(#|$))/,'$1$3$4')

  currentComponentUrl: =>
    new ComponentUrl

  reflectNewUrl: (url) =>
    if (url = new ComponentUrl url).absolute != @currentComponentUrl().href
      preservedHash = if url.hasNoHash() then @currentComponentUrl().hash else ''
      fullUrl = url.pathname + preservedHash
      fullUrl = @removeParamFromUrl(fullUrl, '_breezy_filter')
      fullUrl = @removeParamFromUrl(fullUrl, '__')

      @history.push(fullUrl, { breezy: true, url: url.absolute + preservedHash })

  updateCurrentBrowserState: =>
    @currentBrowserState = @history.location.state

  updateBrowserTitle: =>
    document.title = @currentPage.title if @currentPage.title isnt false

  refreshBrowserForNewAssets: =>
    document.location.reload()

  changePage: (nextPage, options) =>
    if @currentPage and @assetsChanged(nextPage)
      @refreshBrowserForNewAssets()
      return

    @currentPage = nextPage
    @currentPage.title = options.title ? @currentPage.title
    @updateBrowserTitle()

    CSRFToken.update @currentPage.csrf_token if @currentPage.csrf_token?
    @updateCurrentBrowserState()

  assetsChanged: (nextPage) =>
    @loadedAssets ||= @currentPage.assets
    fetchedAssets = nextPage.assets
    fetchedAssets.length isnt @loadedAssets.length or Utils.intersection(fetchedAssets, @loadedAssets).length isnt @loadedAssets.length

  graftByKeypath: (keypath, node, opts={})=>
    for k, v in @pageCache
      @history.pageCache[k] = Utils.graftByKeypath(keypath, node, v, opts)

    @currentPage = Utils.graftByKeypath(keypath, node, @currentPage, opts)
    Utils.triggerEvent EVENTS.LOAD, @currentPage

module.exports = Snapshot
