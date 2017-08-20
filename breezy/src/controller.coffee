ComponentUrl = require('./component_url')
Snapshot = require('./snapshot')
DoublyLinkedList = require('./doubly_linked_list')
Utils = require('./utils')
EVENTS = require('./events')
PAGE_CACHE_SIZE = 20
Config = require('./config')
ProgressBar = require('./progress_bar')
Request = require('./request_response').request

class Controller
  constructor: (history, onCrossOriginRequest = ->{})->
    @atomCache = {} #todo rename me....
    @queues = {}
    @history = new Snapshot(this, history)
    @unlisten = history.listen(@history.onHistoryChange)

    @transitionCacheEnabled = false
    @requestCachingEnabled = true
    @progressBar = new ProgressBar
    @onCrossOriginRequest = onCrossOriginRequest

  reset: ->
    @transitionCacheEnabled = false
    @atomCache = {}
    @queues = {}
    @unlisten()
    @history.reset()

  setInitialState: ({pathname, state }) =>
    @history.setInitialState(pathname, state)

  currentLocation: =>
    #todo rename me..
    @history.history.location

  fetchQueue:(name) =>
    @queues[name] ?= new (Config.fetchQueue(name))

  handleRemote:(opts) =>
    if opts.action?
      Utils.dispatch(opts)
    else
      @request(opts.href, opts)

  remote: (href, options = {}) =>
    options.queue = 'async'
    @request(href, options)

  visit: (href, options = {}) =>
    options.onRequestError = (xhr)->
      Utils.goToErrorPage(xhr, href)
    options.pushState = true
    options.queue = 'sync'
    @request(href, options)

  request: (url, options = {}) =>
    options = Utils.reverseMerge options,
      onProgress: -> {}
      onRequestStart: -> {}
      onRequestError: -> {}
      onRequestEnd: -> {}
      onProgress: -> {}
      pushState: true
      queue: 'sync'

    queue = @queue = @fetchQueue(options.queue)
    url = new ComponentUrl url, Config.fetchBaseUrl()

    if url.crossOrigin()
      @onCrossOriginRequest(url)
      return

    if options.queue == 'sync'
      @progressBar.start()

    if @transitionCacheEnabled
      restored = @history.restore(url.pathname)
      if restored
        @progressBar.done()

    options.cacheRequest ?= @requestCachingEnabled
    options.onRequestStart?(url.absolute)

    queue.push(@createRequest(url, options))

  createRequest: (url, options)=>
    jsAccept = 'text/javascript, application/x-javascript, application/javascript'

    req =
      controller: @
      url: url
      header:
        'accept': jsAccept
        'x-xhr-referer': @currentLocation().pathname
        'x-requested-with': 'XMLHttpRequest'
      payload: options.payload
      method: options.requestMethod || 'GET'
      onRequestError: options.onRequestError
      onProgress: options.onProgress
      onRequestEnd: options.onRequestEnd
      cacheRequest: options.cacheRequest
      pushState: options.pushState
      queue: options.queue

    if options.silent?
      req.header['x-silent'] =  options.silent

    if options.contentType?
      req.header['content-type'] =  options.contentType

    if @history.csrfToken?
      req.header['x-csrf-token'] = @history.csrfToken

    new Request req

  enableTransitionCache: (enable = true) =>
    @transitionCacheEnabled = enable

  disableRequestCaching: (disable = true) =>
    @requestCachingEnabled = not disable
    disable

  cache: (key, value) =>
    return @atomCache[key] if value == null
    @atomCache[key] ||= value

  clearCache: (key, value) =>
    @atomCache = {}

  onProgress: (event)=>
    @progressBar.advanceFromEvent(event)

  onLoad: (rsp) =>
    #todo: investigate: react-native might not need the following line.
    redirectedUrl = rsp.header['x-xhr-redirected-to']
    url = new ComponentUrl(redirectedUrl || rsp.url)

    if rsp.status == 204
      return

    rsp.onRequestEnd?(url.absolute)
    nextPage =  @processResponse(rsp)

    if nextPage
      if rsp.queue != 'sync' && url.pathname != @currentLocation().pathname

        unless rsp.ignoreSamePathConstraint
          Utils.warn("Async response path is different from current page path")

      if nextPage.action != 'graft'
        key = new ComponentUrl(rsp.url).pathname
        @history.savePage(key, nextPage, rsp.pushState)
        @history.load(key)
      else
        #todo: clean this up
        @history.graftByKeypath("data.#{nextPage.path}", nextPage.data)

      @progressBar.done()
      @history.constrainPageCacheTo()
    else
      rsp.onRequestError(rsp)

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
