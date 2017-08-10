ajax = require('superagent')

type = (obj) ->
  if obj == undefined or obj == null
    return String obj
  classToType = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
    '[object Object]': 'object'
  }
  return classToType[Object.prototype.toString.call(obj)]


test = (desc, options = {}, callback) ->
  if type(options) == 'function'
    callback = options
    options = {}

  if options.skip
    QUnit.skip desc, (assert) ->
      @Breezy = Breezy
      callback.call(@, assert)
  else
    QUnit.test desc, (assert) ->
      @Breezy = Breezy
      callback.call(@, assert)

testWithSession = (desc, callback) ->
  test desc, skip: !window?, (assert)->
    iframe = document.getElementById('session')
    iframe.setAttribute('scrolling', 'yes')
    iframe.setAttribute('style', 'visibility: hidden;')
    iframe.setAttribute('src', "/app/session")
    document.body.appendChild(iframe)
    done = assert.async()

    iframe.onload = =>
      iframe.onload = null

      @window = iframe.contentWindow
      @document = @window.document
      @Breezy = @window.Breezy
      @location = @window.location
      @history = @window.history
      @Breezy.disableRequestCaching()
      @$ = (selector) => @document.querySelector(selector)

      callback.call(@, assert)
      done()

module.exports =
  testWithSession: testWithSession
  test: test

