parse = require('url-parse')

uniqueId = ->
  new Date().getTime().toString(36)

class ComponentUrl
  constructor: (@original) ->
    return @original if @original?.constructor is ComponentUrl
    @_parse()

  withoutHash: -> @href.replace(@hash, '').replace('#', '')

  # Intention revealing function alias
  withoutHashForIE10compatibility: -> @withoutHash()

  hasNoHash: -> @hash.length is 0

  crossOrigin: ->
    if window?
      @origin isnt (new ComponentUrl(document.location.href)).origin
    else
      false

  formatForXHR: (options = {}) ->
    (if options.cache then @withMimeBust() else @withAntiCacheParam()).withoutHashForIE10compatibility()

  withMimeBust: ->
    new ComponentUrl(
      if /([?&])__=[^&]*/.test @absolute
        @absolute
      else
        new ComponentUrl(@withoutHash() + (if /\?/.test(@absolute) then "&" else "?") + "__=0" + @hash)
    )

  withAntiCacheParam: ->
    new ComponentUrl(
      if /([?&])_=[^&]*/.test @absolute
        @absolute.replace /([?&])_=[^&]*/, "$1_=#{uniqueId()}"
      else
        new ComponentUrl(@withoutHash() + (if /\?/.test(@absolute) then "&" else "?") + "_=#{uniqueId()}" + @hash)
    )

  _parse: ->
    { @href, @protocol, @host, @hostname, @port, @pathname, @query, @hash } = parse(@original)

    @origin = [@protocol, '//', @hostname].join ''
    @origin += ":#{@port}" unless @port.length is 0
    @pathToHash = [@pathname, @query, @hash].join ''
    @absolute = @href

module.exports = ComponentUrl
