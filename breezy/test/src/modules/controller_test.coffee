test = require('../helpers/helpers').test
History = require('history')
sinon = require('sinon')
Controller = require('../../../src/controller')
Config = require('../../../src/config')
Snapshot = require('../../../src/snapshot')
Utils = require('../../../src/utils')
_ = require('lodash')

class FakeQueue
  constructor: ->
    @items = []

  push: (item)=>
    @items.push(item)

QUnit.module "Controller", ->

  QUnit.module "request", (hooks) ->
    hooks.afterEach ->
      @controller.reset()
      Config.removeQueue('fake')
      Breezy.reset()

    hooks.beforeEach ->
      Config.addQueue('fake', FakeQueue)
      @history = history = History.createMemoryHistory()
      @controller = controller = new Controller(history)
      controller.history.setInitialState '/',
        data: {}
        csrf_token: 'token'
        transition_cache: true
        assets: ['application-123.js']

      @snapshot = controller.history

    test 'pushes a request object into a specified queue', (assert) ->
      controller = @controller
      controller.request('/foo', queue: 'fake')
      assert.equal controller.queues['fake'].items.length, 1

      request = controller.queues['fake'].items[0]
      assert.equal request.controller, controller
      assert.equal request.url.pathname, '/foo'
      assert.equal request.method, 'GET'
      assert.equal request.pushState, true
      assert.equal request.cacheRequest, true
      assert.propEqual request.header,
         'accept': 'text/javascript, application/x-javascript, application/javascript'
         'x-xhr-referer': '/'
         'x-csrf-token': 'token'
         'x-requested-with': 'XMLHttpRequest'

    test 'with enableTransitionCache, restores a page if there is a restorepoint available', (assert) ->
      #todo: check here for refactor opportunity. esp history.reflectnewurl
      @controller.enableTransitionCache()
      cache =
        data:
          heading: 'Some heading'
          address:
            zip: 11201
        csrf_token: 'token'
        transition_cache: true
        assets: ['application-123.js']
      @snapshot.state['/foo'] = cache

      spy = sinon.spy(@controller.history, 'restore')
      @controller.request('/foo', queue: 'fake')
      assert.ok spy.called
      assert.equal @history.location.pathname, '/foo'

    test 'with disableTransitionCache, will not restore a page even if there is a restorepoint available', (assert) ->
      #todo: check here for refactor opportunity. esp history.reflectnewurl
      @controller.disableRequestCaching()
      cache = {}
      @snapshot.state['/foo'] = cache

      spy = sinon.spy(@controller.history, 'restore')
      @controller.request('/foo', queue: 'fake')
      assert.notOk spy.calledWith(cache)
      assert.equal @history.location.pathname, '/'

# test 'request calls oncrossoriginrequest when url is cross origin', (assert) ->
#   Config.addQueue('fake', FakeQueue)
#   history = History.createMemoryHistory()
#   controller = new Controller(history, spy)
#   controller.history.setInitialUrl('/')
#   controller.history.currentPage = {}
#
#   spy = sinon.spy()
#   controller.request('http://www.example.com', queue: 'fake')
#   assert.ok spy.called
#
#   controller.reset()
#   Config.removeQueue('fake')

    test 'request starts the progress bar when the queue is sync(default)', (assert) ->
      oldQueue = Config.fetchQueue('sync')
      Config.addQueue('sync', FakeQueue)
      history = History.createMemoryHistory()
      controller = new Controller(history)
      controller.history.setInitialState '/',
        data: {}
        csrf_token: 'token'
        transition_cache: true
        assets: ['application-123.js']

      spy = sinon.spy(controller.progressBar, 'start')

      controller.request('/foo')
      assert.ok spy.called

      Config.addQueue('sync', oldQueue)
      controller.reset()


  QUnit.module "cache", (hooks) ->
    hooks.afterEach -> Breezy.reset()

    test 'sets once and returns the cache value', (assert) ->
      Config.addQueue('fake', FakeQueue)
      history = History.createMemoryHistory()
      controller = new Controller(history)

      controller.cache('foobar', 123)
      assert.equal controller.cache('foobar', 321), 123

  QUnit.module "restore", (hooks) ->
    hooks.afterEach ->
      Breezy.reset()

    hooks.beforeEach ->
      Config.addQueue('fake', FakeQueue)
      @history = history = History.createMemoryHistory()
      @controller = controller = new Controller(history)
      controller.enableTransitionCache()
      controller.history.setInitialState '/',
        data: {}
        csrf_token: 'token'
        transition_cache: true
        assets: ['application-123.js']

    test 'stops the progressbar, change page, and emit a restore then load event', (assert) ->
    #todo: check here for refactor opportunity. esp history.reflectnewurl
      done = assert.async()

      nextPage =
        data:
          heading: 'Some heading'
          address:
            zip: 11201
        csrf_token: 'token'
        transition_cache: true
        assets: ['application-123.js']


      @controller.history.state['/foo'] = nextPage
      calls = 0

      Utils.on 'breezy:restore', =>
        calls += 1

      Utils.on 'breezy:load', =>
        assert.equal calls, 1
        assert.equal @history.location.pathname, '/foo'
        assert.equal @controller.history.currentPage(), nextPage
        done()

      @controller.history.restore('/foo')

  QUnit.module "onLoad", (hooks) ->
    hooks.afterEach ->
      Breezy.reset()

    hooks.beforeEach ->
      Config.addQueue('fake', FakeQueue)
      requestEndCalled = requestErrorCalled = false
      @history = history = History.createMemoryHistory()
      @controller = controller = new Controller(history)
      controller.enableTransitionCache()
      controller.history.setInitialState '/',
        data: {}
        csrf_token: 'token'
        transition_cache: true
        assets: ['application-123.js']

      @response = ->
        status: 200
        header:
          'content-type': 'text/javascript'
        body:  """
          (function() {
            return {
              data: { heading: 'Some heading 2' },
              title: 'title 2',
              csrf_token: 'token',
              assets: ['application-123.js']
            };
          })();
        """
        ignoreSamePathContraint: false
        queue: 'sync'
        url: '/'
        pushState: true
        onRequestEnd: ->{}
        onRequestError: ->{}

    test 'calls the passed callbacks on success from the server', (assert) ->
      requestEndCalled = requestErrorCalled = false
      rsp = @response()
      rsp.onRequestEnd = -> requestEndCalled = true
      rsp.onRequestError = -> requestErrorCalled = true

      @controller.onLoad(rsp)
      assert.ok requestEndCalled
      assert.notOk requestErrorCalled

    test 'calls on error callback on server errors', (assert) ->
      requestEndCalled = requestErrorCalled = false
      rsp = @response()
      rsp.onRequestEnd = -> requestEndCalled = true
      rsp.onRequestError = -> requestErrorCalled = true

      rsp.status = 400
      @controller.onLoad(rsp)
      assert.ok requestEndCalled
      assert.ok requestErrorCalled

    test 'does nothing on a rsp status of 0 or 204', (assert) ->
      requestEndCalled = requestErrorCalled = false
      rsp = @response()
      rsp.onRequestEnd = -> requestEndCalled = true
      rsp.onRequestError = -> requestErrorCalled = true

      rsp.status = 204
      @controller.onLoad(rsp)
      assert.notOk requestEndCalled
      assert.notOk requestErrorCalled

    test 'pushes state when pushstate is true', (assert) ->
      requestEndCalled = requestErrorCalled = false
      rsp = @response()
      rsp.onRequestEnd = -> requestEndCalled = true
      rsp.onRequestError = -> requestErrorCalled = true

      rsp.url = '/foobar'
      rsp.pushState = true

      @controller.onLoad(rsp)
      assert.equal @history.location.pathname, '/foobar'

    test 'does not pushes state when pushstate is false', (assert) ->
      requestEndCalled = requestErrorCalled = false
      rsp = @response()
      rsp.onRequestEnd = -> requestEndCalled = true
      rsp.onRequestError = -> requestErrorCalled = true

      rsp.url = '/foobar'
      rsp.pushState = false

      @controller.onLoad(rsp)
      assert.equal @history.location.pathname, '/'

    test 'warns if the async path is different from he current path', (assert) ->
      spy = sinon.spy(Utils, 'warn')
      requestEndCalled = requestErrorCalled = false
      rsp = @response()
      rsp.onRequestEnd = -> requestEndCalled = true
      rsp.onRequestError = -> requestErrorCalled = true
      rsp.queue = 'async'

      rsp.url = '/foobar'
      rsp.pushState = false

      @controller.onLoad(rsp)
      assert.ok spy.calledWith('Async response path is different from current page path')
