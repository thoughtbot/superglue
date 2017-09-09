{ test, testWithSession } = require('../helpers/helpers')
History = require('history')
Snapshot = require('../../../src/snapshot')
_ = require('lodash')

class FakeController
  constructor: ->
    @csrfToken = ''
  restore: -> {}
  request: -> {}

QUnit.module "Snapshot", ->

  QUnit.module "#setInitialState"

  test 'sets the inital location state', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialState '/foobar',
      data: {}
      csrf_token: 'token'
      transition_cache: true
      assets: ['application-123.js']

    assert.propEqual history.location.pathname, '/foobar'
    assert.propEqual snapshot.state.length, 1

  QUnit.module "#savePage"
  test 'saves the page in the state', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    snapshot.setInitialState '/foobar',
      data: {}
      csrf_token: 'token'
      transition_cache: true
      assets: ['application-123.js']

    nextPage =
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: ['application-123.js']

    snapshot.savePage('/baz', nextPage)
    snapshot.state['/baz'].cachedAt = 123

    assert.ok _.isEqual snapshot.state['/baz'],
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: [ 'application-123.js' ]
      cachedAt: 123
      positionY: 0
      positionX: 0
      url: '/baz'
      pathname: '/baz'
      transition_cache: true
      joints: {}

    assert.equal history.location.pathname, '/foobar'

  test 'pushes state if specified', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    snapshot.setInitialState '/foobar',
      data: {}
      csrf_token: 'token'
      transition_cache: true
      assets: ['application-123.js']

    nextPage =
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: ['application-123.js']

    assert.equal history.location.pathname, '/foobar'
    snapshot.savePage('/baz', nextPage, true)
    assert.equal history.location.pathname, '/baz'


  QUnit.module "#pageFor"

  test 'returns nothing if on the current page', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    snapshot.setInitialState '/foobar',
      data: {}
      csrf_token: 'token'
      transition_cache: true
      assets: ['application-123.js']

    page = snapshot.pageFor('/foobar')
    page.cachedAt = 123

    assert.ok _.isEqual page,
      data: {}
      csrf_token: 'token'
      assets: [ 'application-123.js' ]
      cachedAt: 123
      positionY: 0
      positionX: 0
      url: '/foobar'
      pathname: '/foobar'
      transition_cache: true
      joints: {}

  QUnit.module "#reflectNewUrl"

  test 'pushes a new location', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialState '/foobar',
      data: {}
      csrf_token: 'token'
      transition_cache: true
      assets: ['application-123.js']

    assert.propEqual history.location.pathname, '/foobar'
    assert.propEqual history.length, 1
    snapshot.reflectNewUrl('/baz')
    assert.propEqual history.location.pathname, '/baz'
    assert.propEqual history.length, 2

  test 'does not push a new location when the url is the same', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialState '/foobar',
      data: {}
      csrf_token: 'token'
      transition_cache: true
      assets: ['application-123.js']

    assert.propEqual history.location.pathname, '/foobar'
    assert.propEqual history.length, 1
    snapshot.reflectNewUrl('/foobar')
    assert.propEqual history.location.pathname, '/foobar'
    assert.propEqual history.length, 1

  QUnit.module "#constrainPageCacheTo"

  test 'trims the pageCache ordered by cachedAt', (assert) ->
    Breezy.reset()
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    snapshot.state =
      '/': { cachedAt: 100}
      '/1': { cachedAt: 101}
      '/2': { cachedAt: 102}
      '/3': { cachedAt: 103}
      '/4': { cachedAt: 104}

    numOfPagesCached = Object.keys(snapshot.state).length
    assert.equal numOfPagesCached, 5

    snapshot.constrainPageCacheTo(2)

    numOfPagesCached = Object.keys(snapshot.state).length
    assert.equal numOfPagesCached, 2

  QUnit.module "Restore event"

  testWithSession "fires when there is a transition cache hit and transitionCacheEnabled", (assert) ->
    done = assert.async()
    load = 0
    restoreCalled = false
    @Breezy.enableTransitionCache()
    @Breezy.on 'breezy:restore', =>
      restoreCalled = true
    @Breezy.on 'breezy:load', =>
      load += 1
      if load is 1
        assert.notOk restoreCalled
        setTimeout (=>
          @Breezy.visit('/app/session')), 0
      else if load is 2
        assert.ok restoreCalled
        done()
    @Breezy.visit('/app/success')

  testWithSession "does not fires when the transition cache is disabled (default)", (assert) ->
    done = assert.async()
    load = 0
    restoreCalled = false
    @Breezy.on 'breezy:restore', =>
      restoreCalled = true
    @Breezy.on 'breezy:load', =>
      load += 1
      if load is 1
        assert.notOk restoreCalled
        setTimeout (=>
          @Breezy.visit('/app/session')), 0
      else if load is 2
        assert.notOk restoreCalled
        done()
    @Breezy.visit('/app/success')

  testWithSession "does not fire on when there is no existing transition cache", (assert) ->
    done = assert.async()
    restoreCalled = false
    @Breezy.on 'breezy:restore', =>
      restoreCalled = true
    @Breezy.on 'breezy:load', =>
      assert.notOk restoreCalled
      done()
    @Breezy.enableTransitionCache()
    @Breezy.visit('/app/success') #different url than session

  testWithSession "transition cache can be disabled with an override in the response", (assert) ->
    done = assert.async()
    load = 0
    restoreCalled = false
    @Breezy.enableTransitionCache()
    @Breezy.on 'breezy:restore', =>
      restoreCalled = true

    @Breezy.on 'breezy:load', =>
      load += 1
      if load is 1
        restoreCalled = false
        setTimeout (=>
          @Breezy.visit('/app/success')), 0
      else if load is 2
        restoreCalled = false
        setTimeout (=>
          @Breezy.visit('/app/success_with_transition_cache_override')), 0
       else if load is 3
         assert.notOk restoreCalled
         done()
    @Breezy.visit('/app/success_with_transition_cache_override')

  testWithSession "history.back() will use the cache if avail", (assert) ->
    done = assert.async()
    change = 0
    fetchCalled = false
    @Breezy.on 'breezy:load', =>
      console.log('breezy load')
      change += 1
      if change is 1
        @document.addEventListener 'breezy:request-start', -> fetchCalled = true
        setTimeout =>
          @history.back()
        , 0
      else if change is 2
        assert.notOk fetchCalled
        done()
    @Breezy.visit('/app/success')

  testWithSession "history.back() will miss the cache if there's no cache", (assert) ->
    done = assert.async()
    change = 0
    restoreCalled = false

    @Breezy.on 'breezy:restore', =>
      restoreCalled = true

    @Breezy.on 'breezy:load', =>
      change += 1
      if change is 1
        setTimeout =>
          @history.back()
        , 0
      else if change is 2
        assert.equal restoreCalled, false
        done()
    @Breezy.pagesCached(0)
    @Breezy.visit('/app/success')

  QUnit.module "#graftByJoint"
  test 'updates all joints across pages', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    snapshot.setInitialState '/foobar',
      data:
        header:
          cart:
            total: 30
      csrf_token: 'token'
      transition_cache: true
      assets: ['application-123.js']
      joints:
        info: ['header.cart']

    nextPage =
      data:
        profile:
          header:
            cart:
              total: 10
      csrf_token: 'token'
      assets: ['application-123.js']
      joints:
        info: ['profile.header.cart']

    snapshot.savePage('/baz', nextPage)
    pages = Object.values(snapshot.state)

    snapshot.graftByJoint('info', total: 5)
    assert.equal pages[0].data.header.cart.total, pages[1].data.profile.header.cart.total
