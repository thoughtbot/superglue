ComponentUrl = require('./component_url.coffee')
Controller = require('./controller.coffee')
CSRFToken = require('./csrf_token.coffee')
DoublyLinkedList = require('./doubly_linked_list.coffee')
ParallelQueue = require('./parallel_queue.coffee')
Remote = require('./remote.coffee')
Snapshot = require('./snapshot.coffee')
Utils = require('./utils.coffee')
EVENTS = require('./events.coffee')
History = require('history')
Config = require('./config.coffee')
Async = require('./queue/async.coffee')
Sync = require('./queue/sync.coffee')

Config.addQueue 'sync', Sync
Config.addQueue 'async', Async

if window?
  history = History.createBrowserHistory()
else
  history = History.createMemoryHistory()


controller = new Controller(history)
controller.setInitialUrl(document.location.href)

progressBar = controller.progressBar
controller.onSyncError = (xhr, url, options) ->
  crossOriginRedirectUrl = (xhr) ->
    redirect = xhr.getResponseHeader('Location')
    crossOrigin = (new ComponentUrl(redirect)).crossOrigin()

    if redirect? and crossOrigin
      redirect
  document.location.href = crossOriginRedirectUrl(xhr) or url.absolute

controller.onCrossOriginRequest = (url) ->
  document.location.href = url.absolute

controller.getRefererUrl = ->
  document.location.href

ProgressBarAPI = {}

pageChangePrevented = (url, target) ->
  !Utils.triggerEvent EVENTS.BEFORE_CHANGE, url: url, target

remoteHandler = (ev) ->
  target = ev.target
  remote = new Remote(target)
  return unless remote.isValid()
  ev.preventDefault()
  options = remote.toOptions()
  return if pageChangePrevented(remote.httpUrl.absolute, options.target)
  controller.request remote.httpUrl, options

browserSupportsCustomEvents =
  document.addEventListener and document.createEvent

initializeBreezy = ->
  history.listen(controller.history.onHistoryChange)

  Utils.documentListenerForLinks 'click', remoteHandler
  document.addEventListener "submit", remoteHandler

if Utils.browserSupportsBreezy()
  visit = controller.request
  initializeBreezy()
else
  visit = (url = document.location.href) -> document.location.href = url

setup = (obj) ->
  obj.controller = controller
  obj.graftByKeypath = controller.history.graftByKeypath
  obj.visit = visit
  obj.replace = controller.replace
  obj.cache = controller.cache
  obj.pagesCached = controller.history.pagesCached
  obj.enableTransitionCache = controller.enableTransitionCache
  obj.disableRequestCaching = controller.disableRequestCaching
  obj.ProgressBar = ProgressBarAPI
  obj.supported = Utils.browserSupportsBreezy()
  obj.EVENTS = Utils.clone(EVENTS)
  obj.currentPage = controller.currentPage
  obj.ComponentUrl = ComponentUrl
  obj.Controller = Controller
  obj.DoublyLinkedList = DoublyLinkedList
  obj.ParallelQueue = ParallelQueue
  obj.Remote = Remote
  obj.Snapshot = Snapshot
  obj.Utils = Utils
  obj.on = Utils.emitter.on.bind(Utils.emitter)
  obj.emitter = Utils.emitter
  obj.Grafter = Utils.Grafter
  obj.CSRFToken = CSRFToken
  obj

platform = window ? exports
platform.Breezy = setup({})
