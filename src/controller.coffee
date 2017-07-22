ComponentUrl = require('./component_url.coffee')
Snapshot = require('./snapshot.coffee')
DoublyLinkedList = require('./doubly_linked_list.coffee')
Utils = require('./utils.coffee')
CSRFToken = require('./csrf_token.coffee')
EVENTS = require('./events.coffee')
PAGE_CACHE_SIZE = 20
Config = require('./config.coffee')
ProgressBar = require('./progress_bar.coffee')

class Response
  constructor: ({@url, @ignoreSamePathConstraint, @onRequestError, @onRequestEnd, @pushState})->

class Request
  constructor: ({@controller, @url,
    @header,
    @payload,
    @method,
    @onProgress,
    @onRequestError,
    @onRequestEnd,
    @pushState,
    @cacheRequest,
    @ignoreSamePathConstraint
  }) ->
      @response = new Response
        onRequestError: @onRequestError
        url: @url
        onRequestEnd: @onRequestEnd
        pushState: @pushState
        ignoreSamePathConstraint: @ignoreSamePathConstraint

  respond: ({status, header, body})->
    @response.url = @url
    @response.status = status
    @response.header = header
    @response.body = body
    @controller.onLoad(@response)

class Controller
  constructor: (history)->
    @atomCache = {}
    @queues = {}
    @history = new Snapshot(this, history)
    @transitionCacheEnabled = false
    @requestCachingEnabled = true
    @progressBar = new ProgressBar

  setInitialUrl: (url) =>
    @history.setInitialUrl(url)

  currentPage: =>
    @history.currentPage

  fetchQueue:(name) =>
    @queues[name] ?= new (Config.fetchQueue(name))

  request: (url, options = {}) =>
    options = Utils.reverseMerge options,
      pushState: true
      queue: 'sync'

    queue = @queue = @fetchQueue(options.queue)
    url = new ComponentUrl url

    if url.crossOrigin()
      @onCrossOriginRequest(url)
      return

    @history.cacheCurrentPage()
    if options.queue == 'sync'
      @progressBar.start()
    restorePoint = @history.transitionCacheFor(url.absolute)

    if @transitionCacheEnabled and restorePoint and restorePoint.transition_cache
      @history.reflectNewUrl(url)
      @restore(restorePoint)

    options.cacheRequest ?= @requestCachingEnabled
    options.onRequestStart?(url.absolute)

    queue.push(@createRequest(url, options))

  createRequest: (url, options)=>
    jsAccept = 'text/javascript, application/x-javascript, application/javascript'
    csrfToken = CSRFToken.get().token

    req =
      controller: @
      url: url
      header:
        'accept': jsAccept
        'x-xhr-referer': @getRefererUrl()
        'x-requested-with': 'XMLHttpRequest'
      payload: options.payload
      method: options.requestMethod || 'GET'
      onRequestError: options.onRequestError
      onRequestEnd: options.onRequestEnd
      cacheRequest: options.cacheRequest
      pushState: options.pushState

    if options.silent?
      req.header['x-silent'] =  options.silent

    if options.contentType?
      req.header['content-type'] =  options.contentType

    if csrfToken?
      req.header['x-csrf-token'] = csrfToken

    new Request req

  enableTransitionCache: (enable = true) =>
    @transitionCacheEnabled = enable

  disableRequestCaching: (disable = true) =>
    @requestCachingEnabled = not disable
    disable

  restore: (cachedPage, options = {}) =>
    @progressBar.done()
    @history.changePage(cachedPage, options)

    Utils.emitter.emit EVENTS.RESTORE
    Utils.emitter.emit EVENTS.LOAD, cachedPage

  replace: (nextPage, options = {}) =>
    Utils.withDefaults(nextPage, @history.currentBrowserState)
    @history.changePage(nextPage, options)
    Utils.emitter.emit EVENTS.LOAD, @currentPage()

  cache: (key, value) =>
    return @atomCache[key] if value == null
    @atomCache[key] ||= value

  onProgress: (event)=>
    @progressBar.advanceFromEvent(event)

  onLoad: (rsp) =>
    #react-native might not need the following line.
    redirectedUrl = rsp.header['x-xhr-redirected-to']
    url = new ComponentUrl(redirectedUrl || rsp.url)

    rsp.onRequestEnd?(url.absolute)
    nextPage =  @processResponse(rsp)
    if rsp.status == 0 || rsp.status == 204
      return

    if nextPage
      if rsp.async && url.pathname != @currentPage().pathname # fix rsp.async

        unless rsp.ignoreSamePathConstraint
          @progressBar.done()
          Utils.warn("Async response path is different from current page path")
          return

      if rsp.pushState
        @history.reflectNewUrl url

      Utils.withDefaults(nextPage, @history.currentBrowserState)

      if nextPage.action != 'graft'
        @history.changePage(nextPage)
        Utils.emitter.emit EVENTS.LOAD, @currentPage()
      else
        ##clean this up
        @history.graftByKeypath("data.#{nextPage.path}", nextPage.data)

      @progressBar.done()
      @history.constrainPageCacheTo()
    else
      rsp.onRequestError(rsp) # unify this

  processResponse: (rsp) ->
    if @hasValidResponse(rsp)
      return @responseContent(rsp.body)

  hasValidResponse: (xhr) ->
    not @clientOrServerError(xhr) and @validContent(xhr) and not @downloadingFile(xhr)

  responseContent: (body) ->
    new Function("'use strict'; return " + body)()

  clientOrServerError: (xhr) ->
    400 <= xhr.status < 600

  validContent: (rsp) ->
    contentType = rsp.header['content-type']
    jsContent = /^(?:text\/javascript|application\/x-javascript|application\/javascript)(?:;|$)/

    contentType? and contentType.match jsContent

  downloadingFile: (xhr) ->
    (disposition = xhr.header['content-disposition'])? and
      disposition.match /^attachment/


module.exports = Controller
