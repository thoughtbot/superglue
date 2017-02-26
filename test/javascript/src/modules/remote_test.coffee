QUnit.module "Remote Attribute"

createTarget = (html) ->
  testDiv = @document.createElement('div')
  testDiv.innerHTML = html
  return testDiv.firstChild

testWithSession "#httpRequestType returns GET link with rx-remote set to nothing", (assert) ->
  html = """
    <a href="/test" data-rx-remote></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.httpUrl, '/test'
  assert.equal remote.actualRequestType, 'GET'

testWithSession "#httpRequestType returns a VERB link with rx-remote set to a valid verb", (assert) ->
  html = """
    <a href="/test" data-rx-remote='post'></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.httpUrl, '/test'
  assert.equal remote.actualRequestType, 'POST'

testWithSession "#httpRequestType returns GET link with rx-remote set to an invalid verb", (assert) ->
  html = """
    <a href="/test" data-rx-remote='invalid'></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.httpUrl, '/test'
  assert.equal remote.actualRequestType, 'GET'

testWithSession "#httpRequestType returns the form method by default", (assert) ->
  html = """
    <form data-rx-remote method='post'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.actualRequestType, 'POST'

testWithSession "#httpRequestType uses the data-rx-remote when method is not set", (assert) ->
  html = """
    <form data-rx-remote>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.actualRequestType, 'POST'

testWithSession "#httpRequestType is set to method even if data-rx-remote is set", (assert) ->
  html = """
    <form data-rx-remote='get' method='post'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.actualRequestType, 'POST'

testWithSession "#httpRequestType is set to POST when method is not set and data-rx-remote is present", (assert) ->
  html = """
    <form data-rx-remote>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.actualRequestType, 'POST'

testWithSession "#httpRequestType is set to data-rx-remote when used with a value, and when method is not set", (assert) ->
  html = """
    <form data-rx-remote='get'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.actualRequestType, 'GET'

testWithSession "#payload will contain a _method when data-rx-remote is set to verbs unsupported by the browser (PUT, DELETE)", (assert) ->
  html = """
    <a href="/test" data-rx-remote='put'></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.httpUrl, '/test'
  assert.equal remote.actualRequestType, 'POST'
  assert.equal remote.payload, "_method=PUT"


testWithSession "#payload will contain a _method when data-rx-remote on a form is set to verbs unsupported by the browser (PUT, DELETE)", (assert) ->
  html = """
    <form data-rx-remote method='PUT'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  appendSpy = sinon.spy(@window.FormData.prototype, 'append')
  remote = new @Relax.Remote(target)

  assert.ok appendSpy.calledWith('_method', 'PUT')

testWithSession "#contentType returns null", (assert) ->
  html = """
    <a href="/test" data-rx-remote></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.contentType, null

testWithSession "#contentType returns form-urlencoded on non-GET links", (assert) ->
  html = """
    <a href="/test" data-rx-remote='put'></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.contentType, 'application/x-www-form-urlencoded; charset=UTF-8'


testWithSession "#contentType returns null on forms regardless of verb", (assert) ->
  html = """
    <form data-rx-remote>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.contentType, null

  html = """
    <form data-rx-remote='GET'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.contentType, null

  html = """
    <form data-rx-remote='PUT'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.contentType, null

  html = """
    <form data-rx-remote='DELETE'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.equal remote.contentType, null

testWithSession "#isValid returns true with a valid form", (assert) ->
  html = """
    <form data-rx-remote method='post' action='/'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.ok remote.isValid()

testWithSession "#isValid returns false with an invalid form (missing action)", (assert) ->
  html = """
    <form data-rx-remote method='post'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.notOk remote.isValid()

testWithSession "#isValid returns false with an invalid form (missing data-rx-remote)", (assert) ->
  html = """
    <form method='post' action='/'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.notOk remote.isValid()

testWithSession "#isValid returns true with a valid link", (assert) ->
  html = """
    <a href="/test" data-rx-remote='POST'></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.ok remote.isValid()

testWithSession "#isValid returns false with a invalid link (missing data-rx-remote)", (assert) ->
  html = """
    <a href="/test"></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.notOk remote.isValid()

testWithSession "#isValid returns true with rx-remote (sans data-)", (assert) ->
  html = """
    <a href="/test" rx-remote='POST'></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.ok remote.isValid()

testWithSession "#payload captures input fields", (assert) ->
  html = """
    <form data-rx-remote method='post' action='/'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
    </form>
  """
  target = createTarget(html)
  appendSpy = sinon.spy(@window.FormData.prototype, 'append')
  remote = new @Relax.Remote(target)
  payload = remote.payload
  assert.ok (payload instanceof @window.FormData)

  assert.ok appendSpy.calledWith('bar', 'fizzbuzz')
  assert.equal remote.httpUrl, '/'

testWithSession "#payload won't include form inputs with rx-remote-noserialize", (assert) ->
  html = """
    <form data-bn-remote method='post' action='/'>
      <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz' rx-remote-noserialize>
    </form>
  """

  target = createTarget(html)
  appendSpy = sinon.spy(@window.FormData.prototype, 'append')
  remote = new @Relax.Remote(target)
  assert.ok appendSpy.neverCalledWith('bar', 'fizzbuzz');

  payload = remote.payload
  assert.ok (payload instanceof @window.FormData)
  assert.equal remote.httpUrl, '/'

testWithSession "ajax errors fire starting with the element", (assert) ->
  done = assert.async()
  html = """
    <a href="/does-not-exist" data-rx-remote data-rx-remote-async=true></a>
  """
  target = createTarget(html)
  @$('body').appendChild(target)
  target.addEventListener 'relax:request-error', =>
    assert.ok true
  @document.addEventListener 'relax:request-error', =>
    assert.ok true
    done()
  target.click()

testWithSession "#isValid returns false with a invalid link (missing data-rx-remote)", (assert) ->
  html = """
    <a href="/test" data-rx-remote data-rx-push-state=false></a>
  """
  target = createTarget(html)
  remote = new @Relax.Remote(target)
  assert.notOk remote.pushState

