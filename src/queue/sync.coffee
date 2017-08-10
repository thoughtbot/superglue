Utils = require('../utils')

class Sync
  constructor: ->
    @http = null

  push: (req) ->
    Utils.emitter.emit('breezy:visit')
    @http?.abort()
    @http = Utils.createRequest(req)
    @http.send(req.payload)
    @http.on('progress', req.onProgress)
    @http.end (err, rsp) =>
      @http = null

      if err || !rsp.ok
        req.onRequestError(rsp, req.url, req)
      else
        req.respond(@optsForRespond(rsp))

  optsForRespond: (rsp) ->
    status: rsp.status
    header: rsp.header
    body: rsp.text

module.exports = Sync
