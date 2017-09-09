ComponentUrl = require('./component_url')
Utils = require('./utils')
EVENTS = require('./events')
Config = require('./config')

class Store
  constructor: (@controller, @history) ->
    @state = {}
    @stateSize = 10
    @loadedAssets = null
    @csrfToken = null
    @lastPath = null

  reset: =>
    @state = {}
    @stateSize = 10
    @loadedAssets = null
    @csrfToken = null

  onHistoryChange: (location, action) =>
    if action == 'POP' && location.state?.breezy && location.state.pathname!= @lastPath
      previousUrl = new ComponentUrl(@history.location.pathname)
      newUrl = new ComponentUrl(location.pathname)
      restored = @restore(newUrl)
      if !restored
        @controller.request location.pathname

  setInitialState: (pathname, state) =>
    url = new ComponentUrl pathname
    @setInitialUrl(pathname)
    page = @savePage(url.pathname, state)
    Utils.emitter.emit EVENTS.LOAD, page

  constrainPageCacheTo: (limit = @stateSize) =>
    stateKeys = Object.keys @state

    cacheTimesRecentFirst = stateKeys.map (url) =>
      @state[url].cachedAt
    .sort (a, b) -> b - a

    for key in stateKeys when @state[key].cachedAt <= cacheTimesRecentFirst[limit]
      delete @state[key]

  pageFor: (url) =>
    url = new ComponentUrl url
    @state[url.pathname]

  pagesCached: (size = @stateSize) =>
    @stateSize = parseInt(size) if /^[\d]+$/.test size

  restore: (url) =>
    url = new ComponentUrl url
    restorePoint = @pageFor(url.pathname)

    if restorePoint && !restorePoint.transition_cache == false
      @reflectNewUrl(url.pathname)
      Utils.emitter.emit EVENTS.RESTORE
      Utils.emitter.emit EVENTS.LOAD, restorePoint
      true
    else
      false

  remove: (url) =>
    url = new ComponentUrl url
    delete @state[url.pathname]

  load: (url) =>
    url = new ComponentUrl url
    page = @pageFor(url.pathname)
    Utils.emitter.emit EVENTS.LOAD, page

  handleGraft: (page) =>
    currentUrl = @currentUrl()
    @csrfToken = page.csrf_token if page? && page.csrf_token?

    Utils.reverseMerge page, joints: []

    for joint, keypaths in page.joints
      for path in keypaths
        updatedNode = Utils.getIn(path, page.data)
        @graftByTrack(track, path, updatedNode)

    currentPage = @state[currentUrl.pathname]
    @state[currentUrl.pathname].data = Utils.set(currentPage.data, page.path, page.data)

    return @state[currentUrl.pathname]


  savePage: (url, page, pushState = false) =>
    if @refreshBrowserForNewAssets(page)
      return

    if pushState
      @reflectNewUrl url

    currentUrl = new ComponentUrl url
    @csrfToken = page.csrf_token if page? && page.csrf_token?
    Utils.reverseMerge page,
      cachedAt: new Date().getTime()
      positionY: window?.pageYOffset
      positionX: window?.pageXOffset
      url: currentUrl.pathToHash
      pathname: currentUrl.pathname
      transition_cache: true
      joints: {}

    for joint, keypaths in page.joints
      for path in keypaths
        updatedNode = Utils.getIn(path, page.data)
        @graftByJoint(joint, path, node)

    @state[currentUrl.pathname] = page

    return page

  setInitialUrl: (href) =>
    url = new ComponentUrl(href)
    @history.replace url.pathname, {breezy: true, pathname: url.pathname }

  currentUrl: () =>
    new ComponentUrl(@history.location.pathname)

  removeParamFromUrl: (url, parameter) =>
    return url
      .replace(new RegExp('^([^#]*\?)(([^#]*)&)?' + parameter + '(\=[^&#]*)?(&|#|$)' ), '$1$3$5')
      .replace(/^([^#]*)((\?)&|\?(#|$))/,'$1$3$4')

  reflectNewUrl: (url) =>
    #todo: add somemore test for this one, has no hash??
    currentComponentUrl = new ComponentUrl(@history.location.pathname)
    nextUrl = new ComponentUrl url
    if nextUrl.pathname != currentComponentUrl.pathname
      url = new ComponentUrl(nextUrl, Config.fetchBaseUrl())
      preservedHash = if url.hasNoHash() then currentComponentUrl.hash else ''
      fullUrl = url.pathname + preservedHash
      fullUrl = @removeParamFromUrl(fullUrl, '_breezy_filter')
      fullUrl = @removeParamFromUrl(fullUrl, '__')
      @lastPath = url.pathname
      @history.push(fullUrl, { breezy: true, pathname: url.pathname })

  refreshBrowserForNewAssets: (nextPage) =>
    if window? and @assetsChanged(nextPage)
      document.location.reload()
      true
    else
      false

  currentPage: =>
    key = @history.location.pathname
    @state[key]

  assetsChanged: (nextPage) =>
    if !@loadedAssets
      @loadedAssets ||= nextPage.assets
      return false

    fetchedAssets = nextPage.assets
    fetchedAssets.length isnt @loadedAssets.length or Utils.intersection(fetchedAssets, @loadedAssets).length isnt @loadedAssets.length

  graftByKeypath: (keypath, node, opts={})=>
    for k, v of @state
      @state[k] = Utils.set(v, keypath, node, opts)
    Utils.emitter.emit EVENTS.LOAD, @currentPage()

  graftByJoint: (joint, node, opts={}) =>
    for k, v of @state
      paths = v.joints[joint] || []

      for path in paths
        @state[k].data = Utils.set(v.data, path, node, opts)

module.exports = Store
