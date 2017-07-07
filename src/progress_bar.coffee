class ProgressBar
  className = 'breezy-progress-bar'
  # Setting the opacity to a value < 1 fixes a display issue in Safari 6 and
  # iOS 6 where the progress bar would fill the entire page.
  originalOpacity = 0.99

  constructor: (@elementSelector) ->
    @value = 0
    @content = ''
    @speed = 300
    @opacity = originalOpacity
    @delay = 400
    @active = null
    @install()

  install: ->
    if @active
      return

    @active = true
    @element = document.querySelector(@elementSelector)
    @element.classList.add(className)
    @styleElement = document.createElement('style')
    document.head.appendChild(@styleElement)
    @_updateStyle()

  uninstall: ->
    if !@active
      return

    @active = false
    @element.classList.remove(className)
    document.head.removeChild(@styleElement)

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
      @_reflow()

    @advanceTo(5)

  advanceTo: (value) ->
    if value > @value <= 100
      @value = value
      @_updateStyle()

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
      @opacity = 0
      @_updateStyle()
    , @speed / 2

    @resetTimer = setTimeout(@_reset, @speed)

  _reflow: ->
    @element.offsetHeight

  _reset: =>
    @_stopTimers()
    @value = 0
    @opacity = originalOpacity
    @_withSpeed(0, => @_updateStyle(true))

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

  _updateStyle: (forceRepaint = false) ->
    @_changeContentToForceRepaint() if forceRepaint
    @styleElement.textContent = @_createCSSRule()

  _changeContentToForceRepaint: ->
    @content = if @content is '' then ' ' else ''

  _createCSSRule: ->
    """
    #{@elementSelector}.#{className}::before {
      content: '#{@content}';
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2000;
      background-color: #0076ff;
      height: 3px;
      opacity: #{@opacity};
      width: #{if @display then @value else 0}%;
      transition: width #{@speed}ms ease-out, opacity #{@speed / 2}ms ease-in;
      transform: translate3d(0,0,0);
    }
    """

module.exports = ProgressBar
