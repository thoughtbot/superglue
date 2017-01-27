#= require relax/controller
#= require relax/remote
#= require relax/utils

EVENTS =
  BEFORE_CHANGE:  'relax:click'
  ERROR:          'relax:request-error'
  FETCH:          'relax:request-start'
  RECEIVE:        'relax:request-end'
  LOAD:           'relax:load'
  RESTORE:        'relax:restore'

controller = new Relax.Controller
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
  remote = new Relax.Remote(target)
  return unless remote.isValid()
  ev.preventDefault()
  controller.request remote.httpUrl, remote.toOptions()

browserSupportsCustomEvents =
  document.addEventListener and document.createEvent

initializeRelax = ->
  ProgressBarAPI.enable()
  window.addEventListener 'hashchange', controller.history.rememberCurrentUrlAndState, false
  window.addEventListener 'popstate', controller.history.onHistoryChange, false
  Relax.Utils.documentListenerForLinks 'click', remoteHandler
  document.addEventListener "submit", remoteHandler

if Relax.Utils.browserSupportsRelax()
  visit = controller.request
  initializeRelax()
else
  visit = (url = document.location.href) -> document.location.href = url

Relax.controller = controller
Relax.graftByKeypath = controller.history.graftByKeypath
Relax.visit = visit
Relax.replace = controller.replace
Relax.cache = controller.cache
Relax.pagesCached = controller.history.pagesCached
Relax.enableTransitionCache = controller.enableTransitionCache
Relax.disableRequestCaching = controller.disableRequestCaching
Relax.ProgressBar = ProgressBarAPI
Relax.supported = Relax.Utils.browserSupportsRelax()
Relax.EVENTS = Relax.Utils.clone(EVENTS)

