# The ComponentUrl class converts a basic URL string into an object
# that behaves similarly to document.location.
#
# If an instance is created from a relative URL, the current document
# is used to fill in the missing attributes (protocol, host, port).
uniqueId = ->
  new Date().getTime().toString(36)

class Relax.ComponentUrl
  constructor: (@original = document.location.href) ->
    return @original if @original.constructor is Relax.ComponentUrl
    @_parse()

  withoutHash: -> @href.replace(@hash, '').replace('#', '')

  # Intention revealing function alias
  withoutHashForIE10compatibility: -> @withoutHash()

  hasNoHash: -> @hash.length is 0

  crossOrigin: ->
    @origin isnt (new Relax.ComponentUrl).origin

  formatForXHR: (options = {}) ->
    (if options.cache then @withMimeBust() else @withAntiCacheParam()).withoutHashForIE10compatibility()

  withMimeBust: ->
    new Relax.ComponentUrl(
      if /([?&])__=[^&]*/.test @absolute
        @absolute
      else
        new Relax.ComponentUrl(@withoutHash() + (if /\?/.test(@absolute) then "&" else "?") + "__=0" + @hash)
    )

  withAntiCacheParam: ->
    new Relax.ComponentUrl(
      if /([?&])_=[^&]*/.test @absolute
        @absolute.replace /([?&])_=[^&]*/, "$1_=#{uniqueId()}"
      else
        new Relax.ComponentUrl(@withoutHash() + (if /\?/.test(@absolute) then "&" else "?") + "_=#{uniqueId()}" + @hash)
    )

  _parse: ->
    (@link ?= document.createElement 'a').href = @original
    { @href, @protocol, @host, @hostname, @port, @pathname, @search, @hash } = @link

    if @protocol == ''
      @protocol = document.location.protocol
    if @port == ''
      @port = document.location.port
    if @hostname == ''
      @hostname = document.location.hostname
    if @pathname == ''
      @pathname = '/'

    @origin = [@protocol, '//', @hostname].join ''
    @origin += ":#{@port}" unless @port.length is 0
    @relative = [@pathname, @search, @hash].join ''
    @absolute = @href
