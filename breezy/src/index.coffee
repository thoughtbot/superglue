Controller = require('./controller')
Remote = require('./remote')
Store = require('./store')
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
    visit = controller.visit

    Remote.listenForEvents(document, controller.handleRemote)
  else
    visit = (url = document.location.href) -> document.location.href = url
else
  history = History.createMemoryHistory()
  controller = new Controller(history, Utils.noop)
  remote = controller.request

setup = (obj) ->
  obj.controller = controller
  obj.graftByKeypath = controller.store.graftByKeypath
  obj.visit = controller.visit
  obj.remote = controller.remote
  obj.request = controller.request
  obj.config = Config
  obj.cache = controller.cache
  obj.pagesCached = controller.store.pagesCached
  obj.enableTransitionCache = controller.enableTransitionCache
  obj.disableRequestCaching = controller.disableRequestCaching
  obj.EVENTS = Utils.clone(EVENTS)
  obj.on = Utils.emitter.on.bind(Utils.emitter)
  obj.emitter = Utils.emitter
  obj.dispatch = Utils.dispatch
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
