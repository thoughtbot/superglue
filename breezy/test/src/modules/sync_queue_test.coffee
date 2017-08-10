sinon = require('sinon')
test = require('../helpers/helpers').test
SyncQueue = require('../../../src/queue/sync')
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
    on: ->{}

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
    onProgress: ->{}
    cacheRequest: ->{}
    pushState: ->{}
    respond: ->{}

QUnit.module "SyncQueue", ->

  QUnit.module "#push"

  test "has no effect on the queue size", (assert) ->
    stub = stubUtils()
    q = new SyncQueue

    q.push fakeReq()
    first = q.http

    q.push fakeReq()
    last = q.http
    assert.notEqual first, last

    stub.restore()

  test "fires off a visit event", (assert) ->
    done = assert.async()
    q = new SyncQueue

    Utils.on 'breezy:visit', ->
      assert.ok true
      done()

    q.push fakeReq()
