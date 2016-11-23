QUnit.module "Navigation"

testWithSession "a successful visit", (assert) ->
  done = assert.async()

  relaxClickFired = requestFinished = requestStared = false
  @document.addEventListener 'relax:click', =>
    assert.equal @$('meta[name="csrf-token"]').getAttribute('content'), 'token'
    relaxClickFired = true

  @document.addEventListener 'relax:request-start', =>
    requestStared = true

  @document.addEventListener 'relax:request-end', =>
    state = relax: true, url: "#{location.protocol}//#{location.host}/fixtures/session"
    assert.propEqual @history.state, state
    assert.ok relaxClickFired
    assert.ok requestStared
    requestFinished = true

  @document.addEventListener 'relax:load', (event) =>
    assert.ok requestFinished
    assert.propEqual event.data.data, { heading: "Some heading 2" }
    state = relax: true, url: "#{location.protocol}//#{location.host}/fixtures/success"
    assert.propEqual @history.state, state
    assert.equal @location.href, state.url
    assert.equal @$('meta[name="csrf-token"]').getAttribute('content'), 'token'
    done()

  @Relax.visit('success')

testWithSession "asset refresh", (assert) ->
  done = assert.async()
  @window.addEventListener 'unload', =>
    assert.ok true
    done()
  @Relax.visit('success_with_new_assets')

testWithSession "error fallback", (assert) ->
  done = assert.async()

  unloadFired = false
  @window.addEventListener 'unload', =>
    unloadFired = true
    setTimeout =>
      try
        assert.equal @window.location.href, "#{@window.location.protocol}//#{@window.location.host}/does_not_exist"
      catch e
        throw e unless /denied/.test(e.message) # IE
      done()
    , 0
  @Relax.visit('/does_not_exist')


testWithSession "with different-origin URL, forces a normal redirection", (assert) ->
  done = assert.async()
  @window.addEventListener 'unload', =>
    assert.ok true
    done()
  @Relax.visit("http://example.com")

testWithSession "calling preventDefault on the before-change event cancels the visit", (assert) ->
  done = assert.async()
  @document.addEventListener 'relax:click', (event) ->
    event.preventDefault()
    assert.ok true
    setTimeout (-> done?()), 0
  @document.addEventListener 'relax:request-start', =>
    done new Error("visit wasn't cancelled")
    done = null
  @Relax.visit('success')

testWithSession "doesn't pushState when URL is the same", (assert) ->
  done = assert.async()
  # Get rid of history.back() sideeffect
  @history.pushState({}, "", "session");

  load = 0
  @document.addEventListener 'relax:load', =>
    load += 1
    if load is 1
      assert.equal @history.length, @originalHistoryLength
      setTimeout (=> @Relax.visit('session#test')), 0
    else if load is 2
      setTimeout (=>
        assert.equal @history.length, @originalHistoryLength + 1
        done()
      ), 0
  @originalHistoryLength = @history.length
  @Relax.visit('session')

testWithSession "with #anchor and history.back()", (assert) ->
  done = assert.async()
  hashchange = 0
  load = 0

  @window.addEventListener 'hashchange', =>
    hashchange += 1
  @document.addEventListener 'relax:load', =>
    load += 1
    if load is 1
      assert.equal hashchange, 1
      setTimeout (=> @history.back()), 0
  @document.addEventListener 'relax:restore', =>
    assert.equal hashchange, 1
    done()
  @location.href = "#{@location.href}#change"
  setTimeout (=> @Relax.visit('success#permanent')), 0

testWithSession "js responses with Relax.cache caches correctly", (assert) ->
  done = assert.async()
  @window.addEventListener 'relax:load', (event) =>
    assert.equal(event.data.data.footer, 'some cached content')
    assert.equal(@Relax.cache('cachekey'), 'some cached content')
    done()
  @Relax.visit('success_with_russian_doll')

testWithSession "the async option allows request to run seperate from the main XHR", (assert) ->
  done = assert.async()
  @document.addEventListener 'relax:load', =>
    assert.equal @Relax.controller.http, null
    done()

  @Relax.visit('session', async: true)

testWithSession "the async options will use a parallel queue that onloads in order", (assert) ->
  done = assert.async()

  response = '''
    (function() {
      return {
        data: { heading: 'Some heading' },
        title: 'title',
        csrf_token: 'token',
        assets: ['application-123.js', 'application-123.js']
      };
    })();
  '''
  xhr = sinon.useFakeXMLHttpRequest()
  @window.XMLHttpRequest = xhr
  requests = []
  xhr.onCreate = (xhr) ->
    requests.push(xhr)

  @Relax.visit('/', async: true)
  @Relax.visit('/', async: true)
  assert.equal @Relax.controller.pq.dll.length, 2
  requests[1].respond(200, { "Content-Type": "application/javascript" }, response)

  assert.equal @Relax.controller.pq.dll.length, 2
  requests[0].respond(200, { "Content-Type": "application/javascript" }, response)

  assert.equal @Relax.controller.pq.dll.length, 0
  done()

testWithSession "the async options will use a parallel queue that onloads in order 2", (assert) ->
  done = assert.async()
  response = '''
    (function() {
      return {
        data: { heading: 'Some heading' },
        title: 'title',
        csrf_token: 'token',
        assets: ['application-123.js', 'application-123.js']
      };
    })();
  '''
  xhr = sinon.useFakeXMLHttpRequest()
  @window.XMLHttpRequest = xhr
  requests = []
  xhr.onCreate = (xhr) ->
    requests.push(xhr)

  @Relax.visit('/', async: true)
  @Relax.visit('/', async: true)
  assert.equal @Relax.controller.pq.dll.length, 2
  requests[0].respond(200, { "Content-Type": "application/javascript" }, response)

  assert.equal @Relax.controller.pq.dll.length, 1
  requests[1].respond(200, { "Content-Type": "application/javascript" }, response)

  assert.equal @Relax.controller.pq.dll.length, 0
  done()

testWithSession "relax grafting", (assert) ->
  done = assert.async()
  @window.addEventListener 'relax:load', (event) =>
    assert.propEqual event.data.data,
      address:
        zip: 91210
      heading: "Some heading"

    done()
  @Relax.visit('success_with_graft')

testWithSession "relax async renders", (assert) ->
  done = assert.async()
  load = 0

  @window.addEventListener 'relax:load', (event) =>
    if load == 0
      assert.propEqual event.data.data,
        address: {}
        heading: "Some heading 2"
      load += 1
    else if load == 1
      assert.propEqual event.data.data,
        address:
          zip: 91210
        heading: "Some heading 2"
      done()
  @Relax.visit('success_with_async_render')
