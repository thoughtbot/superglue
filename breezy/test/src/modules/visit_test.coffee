{ test, testWithSession } = require('../helpers/helpers')
sinon = require('sinon')
QUnit.module "Visit/Remote", afterEach: -> @Breezy.reset()

# todo, add setBaseurl tests
#
initialState =
  data:
    heading: 'Some heading'
    address:
      zip: 11201
  csrf_token: 'token'
  assets: ['application-123.js', 'application-123.js']

if window?
  test = testWithSession

test "#visit, a successful visit", (assert) ->
  done = assert.async()
  breezyClickFired = requestFinished = requestStarted = false
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')

  options =
    onRequestStart: ->
      requestStarted = true
    onRequestEnd: ->
      requestFinished = true
      assert.ok requestStarted
    onRequestError: ->
      assert.ok false, 'this should not happen'
      done()

  @Breezy.on 'breezy:load', (data) =>
    assert.ok requestFinished
    assert.propEqual data.data, { heading: "Some heading 2" }
    state = breezy: true, url: "/app/success"
    assert.propEqual @Breezy.controller.history.currentBrowserState, state
    done()

  @Breezy.visit('/app/success', options)

# test "#visit to content with new assets does nothing, the web version would generate a redirect", (assert) ->
#   @Breezy.config.setBaseUrl('http://localhost:9876')
#   @Breezy.setInitialState('/', initialState)
#   done = assert.async()
#
#   options =
#     onRequestEnd: ->
#       assert.ok true
#     onRequestError: ->
#       assert.ok false, 'this should not happen'
#       done()
#
#   @Breezy.on 'breezy:load', (data)->
#     assert.ok true
#     done()
#
#   @Breezy.visit('/app/success_with_new_assets', options)
#
test "#remote, error responses should call the error callback", (assert) ->
  done = assert.async()
  breezyClickFired = requestFinished = requestStarted = false

  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')

  options =
    onRequestStart: ->
      requestStarted = true
    onRequestEnd: ->
      assert.ok false, 'this should not happen'
      done()
    onRequestError: =>
      assert.ok requestStarted
      state = breezy: true, url: "/"
      assert.propEqual @Breezy.controller.history.currentBrowserState, state
      done()

  @Breezy.on 'breezy:load', (data)->
    assert.ok false, 'this should not happen'
    done()

  @Breezy.remote('/app/does_not_exist', options)

# test "visits with different-origin URL, does nothing on node", (assert) ->
#   @Breezy.config.setBaseUrl('http://localhost:9876')
#   @Breezy.setInitialState('http://foobar.com', initialState)
#   done = assert.async()
#   @Breezy.on 'breezy:load', (data)=>
#     assert.ok true
#     done()
#   @Breezy.visit("http://localhost:9876/success")

test "#visits do not pushState when URL is the same", (assert) ->
  done = assert.async()
  #todo, add a some logging to requests in the queue if error
  @Breezy.config.setBaseUrl('http://localhost:9876')
  @Breezy.setInitialState(pathname: '/', state: initialState)
  history = @Breezy.controller.history.history
  load = 0
  @Breezy.on 'breezy:load', =>
    load += 1
    if load is 1
      assert.equal history.length, originalHistoryLength + 1
      setTimeout (=> @Breezy.visit('/app/session#test')), 0
    else if load is 2
      setTimeout (=>
        assert.equal history.length, originalHistoryLength + 1
        done()
      ), 0
  originalHistoryLength = history.length
  @Breezy.visit('/app/session')

test "visits to content with Breezy.cache stores caches correctly", (assert) ->
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')
  done = assert.async()
  @Breezy.on 'breezy:load', (data) =>
    assert.equal(data.data.footer, 'some cached content')
    assert.equal(@Breezy.cache('cachekey'), 'some cached content')
    done()

  options =
    onRequestError: ->
      assert.ok false, 'this should not happen'
      done()

  @Breezy.visit('/app/success_with_russian_doll', options)

test "visits to content with a Breezy.graft response will graft data appropriately", (assert) ->
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')

  done = assert.async()
  @Breezy.on 'breezy:load', (data) =>
    assert.propEqual data.data,
      address:
        zip: 91210
      heading: "Some heading"

    done()

  options =
    onRequestError: ->
      assert.ok false, 'this should not happen'
      done()
  @Breezy.visit('/app/success_with_graft', options)

test "visits to content with an async Breezy.visit will kick off an async request for new content", (assert) ->
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')
  done = assert.async()
  load = 0

  @Breezy.on 'breezy:load', (data) ->
    if load == 0
      assert.propEqual data.data,
        address: {}
        heading: "Some heading 2"
      load += 1
    else if load == 1
      assert.propEqual data.data,
        address:
          zip: 91210
        heading: "Some heading 2"
      done()

  @Breezy.visit('/app/success_with_async_render')


test "visits", (assert) ->
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')
  done = assert.async()

  @Breezy.on 'breezy:load', (data) ->
    assert.propEqual data.data,
      heading: "Some heading 2"
    done()

  @Breezy.visit('app/success')

test "visits", (assert) ->
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')
  done = assert.async()

  @Breezy.on 'breezy:load', (data) ->
    assert.propEqual data.data,
      heading: "Some heading 2"
    done()

  @Breezy.visit('/app/success')

test "visits", (assert) ->
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')
  done = assert.async()

  @Breezy.on 'breezy:load', (data) ->
    assert.propEqual data.data,
      heading: "Some heading 2"
    done()

  @Breezy.visit('http://localhost:9876/app/success')

# # test "visits.... this should not happen with url in the default stuff", (assert) ->
# #   Breezy.setInitialState('http://localhost:9876', initialState)
# #   done = assert.async()
# #
# #   Breezy.on 'breezy:load', (data) ->
# #     assert.propEqual data.data,
# #       heading: "Some heading 2"
# #     done()
# #
# #   Breezy.visit('http://localhost:9876/success')
#
test "#visits using an absolute URL are successful", (assert) ->
  @Breezy.setInitialState(pathname: '/', state: initialState)
  @Breezy.config.setBaseUrl('http://localhost:9876')
  done = assert.async()

  @Breezy.on 'breezy:load', (data) ->
    assert.propEqual data.data,
      heading: "Some heading 2"
    done()

  @Breezy.visit('http://localhost:9876/app/success')
