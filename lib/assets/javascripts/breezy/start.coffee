#= require breezy/controller
#= require breezy/remote
#= require breezy/utils

EVENTS =
  BEFORE_CHANGE:  'breezy:click'
  ERROR:          'breezy:request-error'
  FETCH:          'breezy:request-start'
  RECEIVE:        'breezy:request-end'
  LOAD:           'breezy:load'
  RESTORE:        'breezy:restore'

controller = new Breezy.Controller(window.history)
progressBar = controller.progressBar

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
  remote = new Breezy.Remote(target)
  return unless remote.isValid()
  ev.preventDefault()
  controller.request remote.httpUrl, remote.toOptions()

browserSupportsCustomEvents =
  document.addEventListener and document.createEvent

initializeBreezy = ->
  ProgressBarAPI.enable()
  window.addEventListener 'hashchange', controller.history.rememberCurrentUrlAndState, false
  window.addEventListener 'popstate', controller.history.onHistoryChange, false
  Breezy.Utils.documentListenerForLinks 'click', remoteHandler
  document.addEventListener "submit", remoteHandler

if Breezy.Utils.browserSupportsBreezy()
  visit = controller.request
  initializeBreezy()
else
  visit = (url = document.location.href) -> document.location.href = url

Breezy.controller = controller
Breezy.graftByKeypath = controller.history.graftByKeypath
Breezy.visit = visit
Breezy.replace = controller.replace
Breezy.cache = controller.cache
Breezy.pagesCached = controller.history.pagesCached
Breezy.enableTransitionCache = controller.enableTransitionCache
Breezy.disableRequestCaching = controller.disableRequestCaching
Breezy.ProgressBar = ProgressBarAPI
Breezy.supported = Breezy.Utils.browserSupportsBreezy()
Breezy.EVENTS = Breezy.Utils.clone(EVENTS)
Breezy.currentPage = controller.currentPage
