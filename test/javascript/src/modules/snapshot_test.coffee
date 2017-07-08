QUnit.module "Snapshot"

testWithSession "without transition cache", (assert) ->
  done = assert.async()
  load = 0
  restoreCalled = false
  @document.addEventListener 'breezy:load', =>
    load += 1
    if load is 1
      setTimeout (=>
        @Breezy.visit('/app/session')), 0
    else if load is 2
      assert.notOk restoreCalled
      location = @window.location
      state = breezy: true, url: "#{location.protocol}//#{location.host}/app/session"
      assert.propEqual @history.state.state, state
      done()
  @document.addEventListener 'breezy:restore', =>
    restoreCalled = true
  @Breezy.visit('/app/success')

testWithSession "with same URL, skips transition cache", (assert) ->
  done = assert.async()
  restoreCalled = false
  @document.addEventListener 'breezy:restore', =>
    restoreCalled = true
  @document.addEventListener 'breezy:load', =>
    assert.notOk restoreCalled
    done()
  @Breezy.enableTransitionCache()
  @Breezy.visit('/app/session')

testWithSession "transition cache can be disabled with an override", (assert) ->
  done = assert.async()
  restoreCalled = false
  @document.addEventListener 'breezy:restore', =>
    restoreCalled = true
  @document.addEventListener 'breezy:load', =>
    assert.notOk restoreCalled
    done()
  @Breezy.enableTransitionCache()
  @Breezy.visit('/app/success_with_transition_cache_override')


testWithSession "history.back() will use the cache if avail", (assert) ->
  done = assert.async()
  change = 0
  fetchCalled = false
  @document.addEventListener 'breezy:load', =>
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

  @document.addEventListener 'breezy:restore', =>
    restoreCalled = true

  @document.addEventListener 'breezy:load', =>
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
