test = require('../helpers/helpers').test
QUnit.module "Grafting API"

test "updating content node and rendering", (assert) ->
  initialState =
    data: {}
    csrf_token: 'token'
    assets: ['application-123.js']

  update1 = contact:
    firstName: 'john'
    address:
      zip: 10002

  Breezy.setInitialState('/', initialState)

  done = assert.async()
  load = 0
  Breezy.on 'breezy:load', (data) =>
    data = data.data
    console.log('load 0')
    load +=1
    if load == 1
      assert.propEqual data, update1
      Breezy.graftByKeypath('data.contact.firstName', 'sully')
    else if load == 2
      assert.strictEqual data.contact.address, update1.contact.address
      assert.notStrictEqual data.contact, update1.contact
      done()

  Breezy.graftByKeypath('data', update1)
