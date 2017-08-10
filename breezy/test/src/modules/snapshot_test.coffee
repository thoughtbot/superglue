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

  QUnit.module "#setInitialUrl"

  test 'sets the inital location state', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialUrl('/')
    assert.propEqual history.location.state, { breezy: true, url: '/' }

  QUnit.module "#cacheCurrentPage"
  test 'sets the pageCache', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    snapshot.setInitialUrl('/')

    snapshot.currentPage =
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: ['application-123.js']

    assert.propEqual snapshot.pageCache, {}
    snapshot.cacheCurrentPage()
    snapshot.pageCache['/']['cachedAt'] = 123
    snapshot.pageCache['/']['positionX'] = 0
    snapshot.pageCache['/']['positionY'] = 0

    assert.ok _.isEqual snapshot.pageCache['/'],
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: [ 'application-123.js' ]
      cachedAt: 123
      positionY: 0
      positionX: 0
      url: '/'
      pathname: '/'
      transition_cache: true

  QUnit.module "#transitionCacheFor"

  test 'returns nothing if on the current page', (assert) ->
    Breezy.reset()
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialUrl('/')
    snapshot.currentPage =
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: ['application-123.js']
    snapshot.cacheCurrentPage()
    transitionCache = snapshot.transitionCacheFor('/')

    assert.notOk transitionCache?

  test 'returns the cached page if loading a different page', (assert) ->
    Breezy.reset()
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialUrl('/')
    snapshot.currentPage =
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: ['application-123.js']
    snapshot.cacheCurrentPage()
    snapshot.currentBrowserState = {breezy: true, url: '/foobar'}

    transitionCache = snapshot.transitionCacheFor('/')
    transitionCache.cachedAt = 0
    transitionCache.positionX = 0
    transitionCache.positionY = 0

    cache =
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: [ 'application-123.js' ]
      positionY: 0
      positionX: 0
      cachedAt: 0
      url: '/'
      pathname: '/'
      transition_cache: true

    assert.ok _.isEqual(transitionCache, cache)

  QUnit.module "#reflectNewUrl"

  test 'pushes a new location', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialUrl('/')

    assert.propEqual history.location.state, { breezy: true, url: '/' }
    assert.propEqual history.length, 1
    snapshot.reflectNewUrl('/foobar')
    assert.propEqual history.location.state, { breezy: true, url: '/foobar' }
    assert.propEqual history.length, 2

  test 'does not push a new location when the url is the same', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialUrl('/')

    assert.propEqual history.location.state, { breezy: true, url: '/' }
    assert.propEqual history.length, 1
    snapshot.reflectNewUrl('/')
    assert.propEqual history.location.state, { breezy: true, url: '/' }
    assert.propEqual history.length, 1

  QUnit.module "#changePage"

  test 'sets the current page and the browser state', (assert) ->
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    assert.notOk history.location.state?
    snapshot.setInitialUrl('/')

    snapshot.currentPage =
      data: {}
      csrf_token: 'token'
      assets: ['application-123.js']
    snapshot.cacheCurrentPage()
    snapshot.currentBrowserState = {breezy: true, url: '/foobar'}

    assert.equal controller.csrfToken, ''

    nextPage =
      data:
        heading: 'Some heading'
        address:
          zip: 11201
      csrf_token: 'token'
      assets: ['application-123.js']

    history.location.state = {breezy: true, url: '/next'}
    snapshot.changePage(nextPage)
    assert.equal snapshot.currentPage, nextPage
    assert.propEqual snapshot.currentBrowserState, {breezy: true, url: '/next'}

  QUnit.module "#constrainPageCacheTo"

  test 'trims the pageCache ordered by cachedAt', (assert) ->
    Breezy.reset()
    history = History.createMemoryHistory()
    controller = new FakeController
    snapshot = new Snapshot(controller, history)
    snapshot.pageCache =
      '/': { cachedAt: 100}
      '/1': { cachedAt: 101}
      '/2': { cachedAt: 102}
      '/3': { cachedAt: 103}
      '/4': { cachedAt: 104}

    numOfPagesCached = Object.keys(snapshot.pageCache).length
    assert.equal numOfPagesCached, 5

    snapshot.constrainPageCacheTo(2)

    numOfPagesCached = Object.keys(snapshot.pageCache).length
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
    @Breezy.visit('/app/session')

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
