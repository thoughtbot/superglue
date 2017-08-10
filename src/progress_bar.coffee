EVENTS = require('./events')
Utils = require('./utils')

class ProgressBar
  constructor: ->
    @value = 0
    @speed = 300
    @delay = 400
    @active = null
    @install()

  install: ->
    if @active
      return

    @active = true
    @_update()

  uninstall: ->
    if !@active
      return

    @active = false

  start: ({delay} = {})->
    clearTimeout(@displayTimeout)
    if @delay
      @display = false
      @displayTimeout = setTimeout =>
        @display = true
      , @delay
    else
      @display = true

    if @value > 0
      @_reset()

    @advanceTo(5)

  advanceTo: (value) ->
    if value > @value <= 100
      @value = value
      @_update()

      if @value is 100
        @_stopTrickle()
      else if @value > 0
        @_startTrickle()

  advanceFromEvent: (event) =>
    percent = if event.lengthComputable
      event.loaded / event.total * 100
    else
      @value + (100 - @value) / 10
    @advanceTo(percent)

  done: ->
    if @value > 0
      @advanceTo(100)
      @_finish()

  setDelay: (milliseconds) =>
    @delay = milliseconds

  _finish: ->
    @fadeTimer = setTimeout =>
      @_update()
    , @speed / 2

    @resetTimer = setTimeout(@_reset, @speed)

  _reset: =>
    @_stopTimers()
    @value = 0
    @_withSpeed(0, => @_update(true))

  _stopTimers: ->
    @_stopTrickle()
    clearTimeout(@fadeTimer)
    clearTimeout(@resetTimer)

  _startTrickle: ->
    return if @trickleTimer
    @trickleTimer = setTimeout(@_trickle, @speed)

  _stopTrickle: ->
    clearTimeout(@trickleTimer)
    delete @trickleTimer

  _trickle: =>
    @advanceTo(@value + Math.random() / 2)
    @trickleTimer = setTimeout(@_trickle, @speed)

  _withSpeed: (speed, fn) ->
    originalSpeed = @speed
    @speed = speed
    result = fn()
    @speed = originalSpeed
    result

  _update: =>
    Utils.emitter.emit EVENTS.PROGRESS,
      width: if @display then @value else 0
      speed: @speed

module.exports = ProgressBar
