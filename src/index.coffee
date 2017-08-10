Controller = require('./controller')
Remote = require('./remote')
Snapshot = require('./snapshot')
Utils = require('./utils')
EVENTS = require('./events')
History = require('history')
Config = require('./config')
Async = require('./queue/async')
Sync = require('./queue/sync')

Config.addQueue 'sync', Sync
Config.addQueue 'async', Async

if window?
  if Utils.browserSupportsBreezy()
    history = History.createBrowserHistory()
    controller = new Controller(history, Utils.directBrowserToUrl)
    visit = controller.request

    Remote.listenForEvents(document, controller.request)
  else
    visit = (url = document.location.href) -> document.location.href = url
else
  history = History.createMemoryHistory()
progressBar = controller.progressBar
ProgressBarAPI = {}
  controller = new Controller(history, Utils.noop)
  visit = controller.request

setup = (obj) ->
  obj.controller = controller
  obj.graftByKeypath = controller.history.graftByKeypath
  obj.visit = visit
  obj.config = Config
  obj.replace = controller.replace
  obj.cache = controller.cache
  obj.pagesCached = controller.history.pagesCached
  obj.enableTransitionCache = controller.enableTransitionCache
  obj.disableRequestCaching = controller.disableRequestCaching
  obj.ProgressBar = ProgressBarAPI
  obj.EVENTS = Utils.clone(EVENTS)
  obj.currentPage = controller.currentPage
  obj.on = Utils.emitter.on.bind(Utils.emitter)
  obj.emitter = Utils.emitter
  obj.warn = Utils.warn
  obj.clearCache = controller.clearCache
  obj.setInitialState = controller.setInitialState.bind(controller)
  obj.reset = ->
    Utils.emitter.removeAllListeners('breezy:load')
    Config.setBaseUrl('')
    controller.reset()
  obj

platform = window ? exports
platform.Breezy = setup({})
