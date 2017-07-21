testWithSession = require('../helpers/helpers.coffee')
QUnit.module "Cache"

testWithSession "cache can only be set once", (assert) ->
  @Breezy.cache('cachekey','hit')
  assert.equal(@Breezy.cache('cachekey'), 'hit')

  @Breezy.cache('cachekey','miss')
  assert.equal(@Breezy.cache('cachekey'), 'hit')
