ComponentUrl = require('./component_url.coffee')
Snapshot = require('./snapshot.coffee')
DoublyLinkedList = require('./doubly_linked_list.coffee')
Utils = require('./utils.coffee')
CSRFToken = require('./csrf_token.coffee')
EVENTS = require('./events.coffee')
PAGE_CACHE_SIZE = 20
Config = require('./config.coffee')

class Controller
  constructor: (history)->
    @atomCache = {}
    @queues = {}
    @history = new Snapshot(this, history)
    @transitionCacheEnabled = false
    @requestCachingEnabled = true

  setInitialUrl: (url) =>
    @history.setInitialUrl(url)

  currentPage: =>
    @history.currentPage

  fetchQueue:(name) =>
    @queues[name] ?= new (Config.fetchQueue(name))(@)

  request: (url, options = {}) =>
    queue = @queue = @fetchQueue(options.queue || 'sync')
    options = Utils.reverseMerge options,
      pushState: true

    url = new ComponentUrl url

    if url.crossOrigin()
      @onCrossOriginRequest(url)
      return

    @history.cacheCurrentPage()
    restorePoint = @history.transitionCacheFor(url.absolute)

    if @transitionCacheEnabled and restorePoint and restorePoint.transition_cache
      @history.reflectNewUrl(url)
      @restore(restorePoint)

    options.cacheRequest ?= @requestCachingEnabled
    options.onRequestStart?(url.absolute)

    queue.push(url, options)

  enableTransitionCache: (enable = true) =>
    @transitionCacheEnabled = enable

  disableRequestCaching: (disable = true) =>
    @requestCachingEnabled = not disable
    disable

  restore: (cachedPage, options = {}) =>
    @http?.abort()
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

  # Events
  onLoadEnd: => @http = null

  onLoad: (xhr, url, options) =>
    options.onRequestEnd?(url.absolute)
    nextPage =  @processResponse(xhr)
    if xhr.status == 0
      return

    if nextPage
      if options.async && url.pathname != @currentPage().pathname

        unless options.ignoreSamePathConstraint
          Utils.warn("Async response path is different from current page path")
          return

      if options.pushState
        @history.reflectNewUrl url

      Utils.withDefaults(nextPage, @history.currentBrowserState)

      if nextPage.action != 'graft'
        @history.changePage(nextPage, options)
        Utils.emitter.emit EVENTS.LOAD, @currentPage()
      else
        ##clean this up
        @history.graftByKeypath("data.#{nextPage.path}", nextPage.data)

      @history.constrainPageCacheTo()
    else
      if options.queue == 'async'
        options.onRequestError(xhr)
      else
        @onSyncError(xhr, url, options)

  createRequest: (url, opts)=>
    Utils.createRequest(@, url, opts)

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
