
QUnit.module "Replace test"

testWithSession "replacing current state", (assert) ->
  done = assert.async()
  doc =
    data: { heading: 'some data' }
    title: 'new title'
    csrf_token: 'new-token'
    assets: ['application-123.js', 'application-123.js']

  assert.equal @$('meta[name="csrf-token"]').getAttribute('content'), 'token'
  assert.equal @document.title, 'title'
  @document.addEventListener 'relax:load', (event) =>
    assert.equal @document.title, 'new title'
    assert.equal @$('meta[name="csrf-token"]').getAttribute('content'), 'new-token'
    assert.propEqual event.data.data, { heading: "some data" } # body is replaced
    done()
  @Relax.replace(doc)

testWithSession "with :title set to a value replaces the title with the value", (assert) ->
  done = assert.async()
  doc =
    data: { heading: 'some data' }
    title: 'new title'
    csrf_token: 'new-token'
    assets: ['application-123.js', 'application-123.js']

  body = @$('body')
  @document.addEventListener 'relax:load', (event) =>
    assert.equal @document.title, 'specified title'
    done()
  @Relax.replace(doc, title: 'specified title')

testWithSession "with :title set to false doesn't replace the title", (assert) ->
  done = assert.async()
  doc =
    data: { heading: 'some data' }
    title: 'new title'
    csrf_token: 'new-token'
    assets: ['application-123.js', 'application-123.js']

  @document.addEventListener 'relax:load', (event) =>
    assert.equal @document.title, 'title'
    done()
  @Relax.replace(doc, title: false)

testWithSession "with different assets refreshes the page", (assert) ->
  done = assert.async()
  doc =
    data: { heading: 'some data' }
    title: 'new title'
    csrf_token: 'new-token'
    assets: ['application-789.js']

  @window.addEventListener 'unload', =>
    assert.ok true
    done()
  @Relax.replace(doc, title: 'specified title')
