testWithSession = require('../helpers/helpers').testWithSession

QUnit.module "Breezy.replace"

testWithSession "replacing current state", (assert) ->
  done = assert.async()
  doc =
    data: { heading: 'some data' }
    csrf_token: 'new-token'
    assets: ['application-123.js', 'application-123.js']

  @Breezy.on 'breezy:load', (data) =>
    assert.propEqual data.data, { heading: "some data" } # body is replaced
    done()
  @Breezy.replace(doc)

testWithSession "replace with content with different assets refreshes the page", (assert) ->
  done = assert.async()
  doc =
    data: { heading: 'some data' }
    csrf_token: 'new-token'
    assets: ['application-789.js']

  @window.addEventListener 'unload', =>
    assert.ok true
    done()
  @Breezy.replace(doc)
