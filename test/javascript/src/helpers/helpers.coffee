ajax = require('superagent')

testWithSession = (desc, callback) ->
  QUnit.test desc, (assert)->
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
      ajax.post('/__zuul/coverage/client')
        .send(@window.__coverage__)
        .end (err, res) ->
          if (err)
            console.log('error in coverage reports')
            console.log(err)
      done()

module.exports = testWithSession
