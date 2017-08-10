testWithSession = require('../helpers/helpers').testWithSession
CSRFToken = require('../../../src/csrf_token')
QUnit.module "CSRF Token"

createTarget = (html) ->
  testDiv = @document.createElement('div')
  testDiv.innerHTML = html
  return testDiv.firstChild

QUnit.module "CSRFToken"

testWithSession "#get returns the current CSRF token", (assert) ->
  tokenTag = @document.querySelector 'meta[name="csrf-token"]'
  tokenTag.setAttribute 'content', 'someToken123'

  token = CSRFToken.get(@document).token
  assert.equal token, 'someToken123'

testWithSession "#update sets a new CSRF token on the page", (assert) ->
  tokenTag = @document.querySelector 'meta[name="csrf-token"]'
  tokenTag.setAttribute 'content', 'someToken123'

  csrf = new CSRFToken
  token = CSRFToken.get(@document).token
  assert.equal token, 'someToken123'

  CSRFToken.update('newToken123', @document)
  token = CSRFToken.get(@document).token
  assert.equal token, 'newToken123'
