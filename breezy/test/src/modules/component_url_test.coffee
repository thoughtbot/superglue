test = require('../helpers/helpers').test
ComponentUrl = require('../../../src/component_url')
Config = require('../../../src/config')

QUnit.module "Component URL", ->
  QUnit.module 'new'

  test "parses a href", (assert) ->
    url = 'https://www.example.com:3000/test?q=foobar#section'
    component_url = new ComponentUrl(url)
    assert.equal component_url.href, 'https://www.example.com:3000/test?q=foobar#section'
    assert.equal component_url.protocol, 'https:'
    assert.equal component_url.host, 'www.example.com:3000'
    assert.equal component_url.hostname, 'www.example.com'
    assert.equal component_url.port, '3000'
    assert.equal component_url.pathname, '/test'
    assert.equal component_url.query, '?q=foobar'
    assert.equal component_url.hash, '#section'
    assert.equal component_url.origin, 'https://www.example.com:3000'
    assert.equal component_url.pathToHash, '/test?q=foobar#section'
    assert.equal component_url.absolute, 'https://www.example.com:3000/test?q=foobar#section'

  test "parses a pathname", (assert) ->
    url = 'test?q=foobar#section'
    component_url = new ComponentUrl(url, 'http://www.test.com')
    assert.equal component_url.href, 'http://www.test.com/test?q=foobar#section'
    assert.equal component_url.protocol, 'http:'
    assert.equal component_url.host, 'www.test.com'
    assert.equal component_url.hostname, 'www.test.com'
    assert.equal component_url.port, ''
    assert.equal component_url.pathname, '/test'
    assert.equal component_url.query, '?q=foobar'
    assert.equal component_url.hash, '#section'
    assert.equal component_url.origin, 'http://www.test.com'
    assert.equal component_url.pathToHash, '/test?q=foobar#section'
    assert.equal component_url.absolute, 'http://www.test.com/test?q=foobar#section'

  QUnit.module '#formatForXHR'
  test "returns a url without a hash and without cache", (assert) ->
    url = 'https://www.example.com:3000/test?q=foobar#section'
    component_url = new ComponentUrl(url)
    assert.equal component_url.formatForXHR().indexOf('https://www.example.com:3000/test?q=foobar&_='), 0

  test "returns a cachable url with a mime buster when passed a cache true", (assert) ->
    url = 'https://www.example.com:3000/test?q=foobar#section'
    component_url = new ComponentUrl(url)
    assert.equal component_url.formatForXHR(cache: true), 'https://www.example.com:3000/test?q=foobar&__=0'
