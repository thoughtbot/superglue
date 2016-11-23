
@testWithSession = (desc, callback) ->
  QUnit.test desc, (assert)->
    iframe = document.getElementById('pl-session')
    iframe.setAttribute('scrolling', 'yes')
    iframe.setAttribute('style', 'visibility: hidden;')
    iframe.setAttribute('src', "fixtures/session")
    document.body.appendChild(iframe)
    stop()

    iframe.onload = =>
      iframe.onload = null

      @window = iframe.contentWindow
      @document = @window.document
      @Relax = @window.Relax
      @location = @window.location
      @history = @window.history
      @Relax.disableRequestCaching()
      @$ = (selector) => @document.querySelector(selector)

      start()
      callback.call(@, assert)


