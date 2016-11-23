QUnit.module "Cache"

testWithSession "cache can only be set the first time", (assert) ->
  @Relax.cache('cachekey','hit')
  assert.equal(@Relax.cache('cachekey'), 'hit')

  @Relax.cache('cachekey','miss')
  assert.equal(@Relax.cache('cachekey'), 'hit')
