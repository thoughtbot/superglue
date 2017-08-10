testWithSession = require('../helpers/helpers').testWithSession
Remote = require('../../../../src/remote')
sinon = require('sinon')

createTarget = (html) ->
  testDiv = @document.createElement('div')
  testDiv.innerHTML = html
  return testDiv.firstChild

QUnit.module "Remote Attribute", ->
  QUnit.module "#httpRequestType"
  testWithSession "returns GET link with bz-remote set to nothing", (assert) ->
    html = """
      <a href="/test" data-bz-remote></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.httpUrl, '/test'
    assert.equal remote.actualRequestType, 'GET'

  testWithSession "returns a VERB link with bz-remote set to a valid verb", (assert) ->
    html = """
      <a href="/test" data-bz-remote='post'></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.httpUrl, '/test'
    assert.equal remote.actualRequestType, 'POST'

  testWithSession "returns GET link with bz-remote set to an invalid verb", (assert) ->
    html = """
      <a href="/test" data-bz-remote='invalid'></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.httpUrl, '/test'
    assert.equal remote.actualRequestType, 'GET'

  testWithSession "returns the form method by default", (assert) ->
    html = """
      <form data-bz-remote method='post'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.actualRequestType, 'POST'

  testWithSession "uses the data-bz-remote when method is not set", (assert) ->
    html = """
      <form data-bz-remote>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.actualRequestType, 'POST'

  testWithSession "is set to method even if data-bz-remote is set", (assert) ->
    html = """
      <form data-bz-remote='get' method='post'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.actualRequestType, 'POST'

  testWithSession "is set to POST when method is not set and data-bz-remote is present", (assert) ->
    html = """
      <form data-bz-remote>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.actualRequestType, 'POST'

  testWithSession "is set to data-bz-remote when used with a value, and when method is not set", (assert) ->
    html = """
      <form data-bz-remote='get'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.actualRequestType, 'GET'

  QUnit.module "#payload"
  testWithSession "contains a _method when data-bz-remote is set to verbs unsupported by the browser (PUT, DELETE)", (assert) ->
    html = """
      <a href="/test" data-bz-remote='put'></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.httpUrl, '/test'
    assert.equal remote.actualRequestType, 'POST'
    assert.equal remote.payload, "_method=PUT"


  testWithSession " will contain a _method when data-bz-remote on a form is set to verbs unsupported by the browser (PUT, DELETE)", (assert) ->
    html = """
      <form data-bz-remote method='PUT'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    appendSpy = sinon.spy(FormData.prototype, 'append')
    remote = new Remote(target)

    assert.ok appendSpy.calledWith('_method', 'PUT')
    appendSpy.restore()

  QUnit.module "#contentType"

  testWithSession "returns null on normal GET links", (assert) ->
    html = """
      <a href="/test" data-bz-remote></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.contentType, null

  testWithSession "#contentType returns form-urlencoded on non-GET links", (assert) ->
    html = """
      <a href="/test" data-bz-remote='put'></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.contentType, 'application/x-www-form-urlencoded; charset=UTF-8'

  testWithSession "#contentType returns null on forms regardless of verb", (assert) ->
    html = """
      <form data-bz-remote>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.contentType, null

    html = """
      <form data-bz-remote='GET'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.contentType, null

    html = """
      <form data-bz-remote='PUT'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.contentType, null

    html = """
      <form data-bz-remote='DELETE'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.equal remote.contentType, null

  QUnit.module "#isValid"

  testWithSession "returns true with a valid form", (assert) ->
    html = """
      <form data-bz-remote method='post' action='/'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.ok remote.isValid()

  testWithSession "returns false with an invalid form (missing action)", (assert) ->
    html = """
      <form data-bz-remote method='post'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.notOk remote.isValid()

  testWithSession "returns false with an invalid form (missing data-bz-remote)", (assert) ->
    html = """
      <form method='post' action='/'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.notOk remote.isValid()

  testWithSession "returns true with a valid link", (assert) ->
    html = """
      <a href="/test" data-bz-remote='POST'></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.ok remote.isValid()

  testWithSession "returns false with a invalid link (missing data-bz-remote)", (assert) ->
    html = """
      <a href="/test"></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.notOk remote.isValid()

  testWithSession "returns true with bz-remote (sans data-)", (assert) ->
    html = """
      <a href="/test" bz-remote='POST'></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.ok remote.isValid()

  testWithSession "returns false with a invalid link (missing data-bz-remote)", (assert) ->
    html = """
      <a href="/test" data-bz-remote data-bz-push-state=false></a>
    """
    target = createTarget(html)
    remote = new Remote(target)
    assert.notOk remote.pushState

  QUnit.module "#payload"

  testWithSession "captures input fields", (assert) ->
    html = """
      <form data-bz-remote method='post' action='/'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
    """
    target = createTarget(html)
    appendSpy = sinon.spy(FormData.prototype, 'append')
    remote = new Remote(target)
    payload = remote.payload
    assert.ok (payload instanceof FormData)

    assert.ok appendSpy.calledWith('bar', 'fizzbuzz')
    assert.equal remote.httpUrl, '/'
    appendSpy.restore()

  testWithSession "won't include form inputs with bz-remote-noserialize", (assert) ->
    html = """
      <form data-bn-remote method='post' action='/'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz' bz-remote-noserialize>
      </form>
    """

    target = createTarget(html)
    appendSpy = sinon.spy(FormData.prototype, 'append')
    remote = new Remote(target)
    assert.ok appendSpy.neverCalledWith('bar', 'fizzbuzz');

    payload = remote.payload
    assert.ok (payload instanceof FormData)
    assert.equal remote.httpUrl, '/'
    appendSpy.restore()

  testWithSession "ajax errors fire starting with the element", (assert) ->
    done = assert.async()
    html = """
      <a href="/does-not-exist" data-bz-remote data-bz-remote-q='async'></a>
    """
    target = createTarget(html)
    @$('body').appendChild(target)
    target.addEventListener 'breezy:request-error', =>
      assert.ok true
    @document.addEventListener 'breezy:request-error', =>
      assert.ok true
      done()
    target.click()

