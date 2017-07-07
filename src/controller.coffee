ParallelQueue = require('./parallel_queue.coffee')
ComponentUrl = require('./component_url.coffee')
ProgressBar = require('./progress_bar.coffee')
Snapshot = require('./snapshot.coffee')
DoublyLinkedList = require('./doubly_linked_list.coffee')
Utils = require('./utils.coffee')
CSRFToken = require('./csrf_token.coffee')
EVENTS = require('./events.coffee')
PAGE_CACHE_SIZE = 20

class Controller
  constructor: (history)->
    @atomCache = {}
    @history = new Snapshot(this, history)
    @transitionCacheEnabled = false
    @requestCachingEnabled = true

    @progressBar = new ProgressBar 'html'
    @pq = new ParallelQueue
    @http = null

    @history.rememberCurrentUrlAndState()

  currentPage: =>
    @history.currentPage

  request: (url, options = {}) =>
    options = Utils.reverseMerge options,
      pushState: true

    url = new ComponentUrl url
    return if @pageChangePrevented(url.absolute, options.target)

    if url.crossOrigin()
      @onCrossOriginRequest(url)
      return

    @history.cacheCurrentPage()
    if @progressBar? and !options.async
      @progressBar?.start()
    restorePoint = @history.transitionCacheFor(url.absolute)

    if @transitionCacheEnabled and restorePoint and restorePoint.transition_cache
      @history.reflectNewUrl(url)
      @restore(restorePoint)
      options.showProgressBar = false

    options.cacheRequest ?= @requestCachingEnabled
    options.showProgressBar ?= true

    Utils.triggerEvent EVENTS.FETCH, url: url.absolute, options.target

    if options.async
      options.showProgressBar = false
      req = @createRequest(url, options)
      req.onError = ->
        Utils.triggerEvent EVENTS.ERROR, null, options.target
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
    Utils.triggerEvent EVENTS.RESTORE
    Utils.triggerEvent EVENTS.LOAD, cachedPage

  replace: (nextPage, options = {}) =>
    Utils.withDefaults(nextPage, @history.currentBrowserState)
    @history.changePage(nextPage, options)
    Utils.triggerEvent EVENTS.LOAD, @currentPage()

  pageChangePrevented: (url, target) =>
    !Utils.triggerEvent EVENTS.BEFORE_CHANGE, url: url, target

  cache: (key, value) =>
    return @atomCache[key] if value == null
    @atomCache[key] ||= value

  # Events
  onLoadEnd: => @http = null

  onLoad: (xhr, url, options) =>
    Utils.triggerEvent EVENTS.RECEIVE, url: url.absolute, options.target
    nextPage =  @processResponse(xhr)
    if xhr.status == 0
      return

    if nextPage
      if options.async && url.pathname != @currentPage().pathname

        unless options.ignoreSamePathConstraint
          @progressBar?.done()
          Utils.warn("Async response path is different from current page path")
          return

      if options.pushState
        @history.reflectNewUrl url

      Utils.withDefaults(nextPage, @history.currentBrowserState)

      if nextPage.action != 'graft'
        @history.changePage(nextPage, options)
        Utils.triggerEvent EVENTS.LOAD, @currentPage()
      else
        ##clean this up
        @history.graftByKeypath("data.#{nextPage.path}", nextPage.data)

      if options.showProgressBar
        @progressBar?.done()
      @history.constrainPageCacheTo()
    else
      if options.async
        @onAsyncError(xhr, url, options)
      else
        @progressBar?.done()
        @onSyncError(xhr, url, options)

  onProgress: (event) =>
    @progressBar.advanceFromEvent(event)

  onAsyncError: (xhr, url, options) =>
    Utils.triggerEvent EVENTS.ERROR, xhr, options.target

  createRequest: (url, opts)=>
    jsAccept = 'text/javascript, application/x-javascript, application/javascript'
    requestMethod = opts.requestMethod || 'GET'

    xhr = new XMLHttpRequest
    xhr.open requestMethod, url.formatForXHR(cache: opts.cacheRequest), true
    xhr.setRequestHeader 'Accept', jsAccept
    xhr.setRequestHeader 'X-XHR-Referer', @getRefererUrl()
    xhr.setRequestHeader 'X-Silent', opts.silent if opts.silent
    xhr.setRequestHeader 'X-Requested-With', 'XMLHttpRequest'
    xhr.setRequestHeader 'Content-Type', opts.contentType if opts.contentType

    csrfToken = CSRFToken.get().token
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
      @onSyncError(xhr, url, options)
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


module.exports = Controller
