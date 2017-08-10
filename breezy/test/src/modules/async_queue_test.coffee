sinon = require('sinon')
test = require('../helpers/helpers').test
AsyncQueue = require('../../../src/queue/async')
Request = require('../../../src/request_response').request
Utils = require('../../../src/utils')

onLoads = []

stubUtils = ->
  onLoads = []
  sinon.stub Utils, 'createRequest', ->
    end: (callback) ->
      wrap =->
        callback(null, ok: true)
      onLoads.push(wrap)
    send: ->{}
    abort: ->{}

fakeReq = ->
  new Request
    controller: {onLoad: ->{}}
    url: {formatForXHR: ->{''}}
    header:
      'x-requested-with': 'XMLHttpRequest'
    payload: {}
    method: 'GET'
    onRequestError: ->{}
    onRequestEnd: ->{}
    cacheRequest: ->{}
    pushState: ->{}
    respond: ->{}

QUnit.module "AsyncQueue", ->
  QUnit.module "#push"

  test "adds a XHR to the queue", (assert) ->
    stub = stubUtils()
    q = new AsyncQueue
    q.push fakeReq()

    assert.equal q.dll.length, 1
    stub.restore()

  test "#drain resets the queue and any existing XHRs will not onload", (assert) ->
    q = new AsyncQueue
    q.push fakeReq()

    assert.equal q.dll.length, 1
    q.drain()

    assert.equal q.dll.length, 0

  QUnit.module "a finished request"

  test "attempts to process any items ahead of it, but stop if the item is not done", (assert) ->
    stub = stubUtils()
    q = new AsyncQueue
    q.push fakeReq()
    q.push fakeReq()

    onLoads[1]()
    assert.equal q.dll.length, 2

    onLoads[0]()
    assert.equal q.dll.length, 0
    stub.restore()

  test "attempts to process any items ahead of it, and continue if the item is done", (assert) ->
    stub = stubUtils()
    q = new AsyncQueue
    q.push fakeReq()
    q.push fakeReq()

    onLoads[0]()
    assert.equal q.dll.length, 1

    onLoads[1]()
    assert.equal q.dll.length, 0
    stub.restore()

