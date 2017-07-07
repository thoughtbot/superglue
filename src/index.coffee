ComponentUrl = require('./component_url.coffee')
Controller = require('./controller.coffee')
CSRFToken = require('./csrf_token.coffee')
DoublyLinkedList = require('./doubly_linked_list.coffee')
ParallelQueue = require('./parallel_queue.coffee')
Remote = require('./remote.coffee')
Snapshot = require('./snapshot.coffee')
Utils = require('./utils.coffee')
EVENTS = require('./events.coffee')

controller = new Controller(window.history)
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

ProgressBarAPI =
  enable: ->
    progressBar.install()
  disable: ->
    progressBar.uninstall()
  setDelay: (value) -> progressBar.setDelay(value)
  start: (options) -> progressBar.start(options)
  advanceTo: (value) -> progressBar.advanceTo(value)
  done: -> progressBar.done()

remoteHandler = (ev) ->
  target = ev.target
  remote = new Remote(target)
  return unless remote.isValid()
  ev.preventDefault()
  controller.request remote.httpUrl, remote.toOptions()

browserSupportsCustomEvents =
  document.addEventListener and document.createEvent

initializeBreezy = ->
  ProgressBarAPI.enable()
  window.addEventListener 'hashchange', controller.history.rememberCurrentUrlAndState, false
  window.addEventListener 'popstate', controller.history.onHistoryChange, false
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
  obj.Grafter = Utils.Grafter
  obj.CSRFToken = CSRFToken
  obj

platform = window ? exports
platform.Breezy = setup({})
