Utils = require('../utils.coffee')

class Sync
  constructor: (delegate)->
    @delegate = delegate
    @http = null

  push: (url, options) ->
    Utils.emitter.emit('breezy:visit')
    @http?.abort()
    @http = Utils.createRequest(@delegate, url, options)
    @http.onloadend = =>
      @http = null
    @http.onerror = =>
      options.onRequestError(@http, url, options)
    @http.send(options.payload)

module.exports = Sync
