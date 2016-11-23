#= require relax/doubly_linked_list
#= require relax/snapshot
#= require relax/progress_bar
#= require relax/parallel_queue
#= require relax/component_url

PAGE_CACHE_SIZE = 20

class Relax.Controller
  constructor: ->
    @atomCache = {}
    @history = new Relax.Snapshot(this)
    @transitionCacheEnabled = false
    @requestCachingEnabled = true

    @progressBar = new Relax.ProgressBar 'html'
    @pq = new Relax.ParallelQueue
    @http = null

    @history.rememberCurrentUrlAndState()

  currentPage: =>
    @history.currentPage

  request: (url, options = {}) =>
    options = Relax.Utils.reverseMerge options,
      pushState: true

    url = new Relax.ComponentUrl url
    return if @pageChangePrevented(url.absolute)

    if url.crossOrigin()
      document.location.href = url.absolute
      return

    @history.cacheCurrentPage()
    if @progressBar? and !options.async
      @progressBar?.start()
    restorePoint = @history.transitionCacheFor(url.absolute)

    if @transitionCacheEnabled and restorePoint
      @history.reflectNewUrl(url)
      @restore(restorePoint)
      options.showProgressBar = false

    options.cacheRequest ?= @requestCachingEnabled
    options.showProgressBar ?= true

    Relax.Utils.triggerEvent Relax.EVENTS.FETCH, url: url.absolute

    if options.async
      options.showProgressBar = false
      req = @createRequest(url, options)
      req.onError = ->
        Relax.Utils.triggetEvent Relax.EVENTS.ERROR, null, options.target
      @pq.push(req)
      req.send(options.payload)
    else
      @pq.drain()
      @http?.abort()
      @http = @createRequest(url, options)
      @http.send(options.payload)

  enableTransitionCache: (enable = true) =>
    @transitionCacheEnabled = enable

  disableRequestCaching: (disable = true) =>
    @requestCachingEnabled = not disable
    disable

  restore: (cachedPage, options = {}) =>
    @http?.abort()
    @history.changePage(cachedPage, options)

    @progressBar?.done()
    Relax.Utils.triggerEvent Relax.EVENTS.RESTORE
    Relax.Utils.triggerEvent Relax.EVENTS.LOAD, cachedPage

  replace: (nextPage, options = {}) =>
    Relax.Utils.withDefaults(nextPage, @history.currentBrowserState)
    @history.changePage(nextPage, options)
    Relax.Utils.triggerEvent Relax.EVENTS.LOAD, @currentPage()

  crossOriginRedirect: =>
    redirect = @http.getResponseHeader('Location')
    crossOrigin = (new Relax.ComponentUrl(redirect)).crossOrigin()

    if redirect? and crossOrigin
      redirect

  pageChangePrevented: (url) =>
    !Relax.Utils.triggerEvent Relax.EVENTS.BEFORE_CHANGE, url: url

  cache: (key, value) =>
    return @atomCache[key] if value == null
    @atomCache[key] ||= value

  # Events
  onLoadEnd: => @http = null

  onLoad: (xhr, url, options) =>
    Relax.Utils.triggerEvent Relax.EVENTS.RECEIVE, url: url.absolute
    nextPage =  @processResponse(xhr)
    if xhr.status == 0
      return

    if nextPage
      if options.async && url.pathname != @currentPage().pathname

        unless options.ignoreSamePathConstraint
          @progressBar?.done()
          console.warn("Async response path is different from current page path")
          return

      if options.pushState
        @history.reflectNewUrl url

      Relax.Utils.withDefaults(nextPage, @history.currentBrowserState)

      if nextPage.action != 'graft'
        @history.changePage(nextPage, options)
        Relax.Utils.triggerEvent Relax.EVENTS.LOAD, @currentPage()
      else
        ##clean this up
        @history.graftByKeypath("data.#{nextPage.path}", nextPage.data)

      if options.showProgressBar
        @progressBar?.done()
      @history.constrainPageCacheTo()
    else
      if options.async
        Relax.Utils.triggerEvent Relax.EVENTS.ERROR, xhr, options.target
      else
        @progressBar?.done()
        document.location.href = @crossOriginRedirect() or url.absolute

  onProgress: (event) =>
    @progressBar.advanceFromEvent(event)

  onError: (url) =>
    document.location.href = url.absolute

  createRequest: (url, opts)=>
    jsAccept = 'text/javascript, application/x-javascript, application/javascript'
    requestMethod = opts.requestMethod || 'GET'

    xhr = new XMLHttpRequest
    xhr.open requestMethod, url.formatForXHR(cache: opts.cacheRequest), true
    xhr.setRequestHeader 'Accept', jsAccept
    xhr.setRequestHeader 'X-XHR-Referer', document.location.href
    xhr.setRequestHeader 'X-Silent', opts.silent if opts.silent
    xhr.setRequestHeader 'X-Requested-With', 'XMLHttpRequest'
    xhr.setRequestHeader 'Content-Type', opts.contentType if opts.contentType

    csrfToken = Relax.CSRFToken.get().token
    xhr.setRequestHeader('X-CSRF-Token', csrfToken) if csrfToken

    if !opts.silent
      xhr.onload = =>
        self = ` this `
        redirectedUrl = self.getResponseHeader 'X-XHR-Redirected-To'
        actualUrl = redirectedUrl || url
        @onLoad(self, actualUrl, opts)
    else
      xhr.onload = =>
        @progressBar?.done()

    xhr.onprogress = @onProgress if @progressBar and opts.showProgressBar
    xhr.onloadend = @onLoadEnd
    xhr.onerror = =>
      @onError(url)
    xhr

  processResponse: (xhr) ->
    if @hasValidResponse(xhr)
      return @responseContent(xhr)

  hasValidResponse: (xhr) ->
    not @clientOrServerError(xhr) and @validContent(xhr) and not @downloadingFile(xhr)

  responseContent: (xhr) ->
    new Function("'use strict'; return " + xhr.responseText )()

  clientOrServerError: (xhr) ->
    400 <= xhr.status < 600

  validContent: (xhr) ->
    contentType = xhr.getResponseHeader('Content-Type')
    jsContent = /^(?:text\/javascript|application\/x-javascript|application\/javascript)(?:;|$)/

    contentType? and contentType.match jsContent

  downloadingFile: (xhr) ->
    (disposition = xhr.getResponseHeader('Content-Disposition'))? and
      disposition.match /^attachment/


