test = require('../helpers/helpers').test

QUnit.module "Cache", afterEach: -> Breezy.clearCache()

test "cache values can only be set once", (assert) ->
  Breezy.cache('cachekey','hit')
  assert.equal(Breezy.cache('cachekey'), 'hit')

  Breezy.cache('cachekey','miss')
  assert.equal(Breezy.cache('cachekey'), 'hit')
