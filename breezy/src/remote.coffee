Utils = require('./utils')
EVENTS = require('./events')
ComponentUrl = require('./component_url')

pageChangePrevented = (url, target) ->
  !Utils.triggerEvent EVENTS.BEFORE_CHANGE, url: url, target


documentListenerForLinks = (eventType, handler, document) ->
  document.addEventListener eventType, (ev) ->
    target = ev.target
    while target != document && target?
      if target.nodeName == "A"
        isNodeDisabled = target.getAttribute('disabled')
        ev.preventDefault() if target.getAttribute('disabled')
        unless isNodeDisabled
          handler(ev)
          return

      target = target.parentNode

class Remote
  SUPPORTED_METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
  FALLBACK_LINK_METHOD = 'GET'
  FALLBACK_FORM_METHOD = 'POST'

  @listenForEvents: (document, callback) ->
    remoteHandler = (ev) ->
      target = ev.target
      remote = new Remote(target)
      return unless remote.isValid()
      ev.preventDefault()
      options = remote.toOptions()
      return if pageChangePrevented(remote.httpUrl.absolute, options.target)
      callback(remote.httpUrl, options)
    documentListenerForLinks 'click', remoteHandler, document
    document.addEventListener "submit", remoteHandler

  constructor: (target, opts={})->
    @target = target
    if @isValid()
      @payload = ''
      @contentType = null
      @setRequestType(target)
      @setQueue(target)
      @setPushState(target)
      @httpUrl = target.getAttribute('href') || target.getAttribute('action')
      @setPayload(target)

  setQueue: (target) =>
    if @hasBZAttribute(target, 'bz-visit')
      @q = 'sync'
    else if @hasBZAttribute(target, 'bz-remote')
      @q = 'async'

  setPushState: (target) =>
    if @hasBZAttribute(target, 'bz-visit')
      @pushState = true
    else if @hasBZAttribute(target, 'bz-remote')
      @pushState = false

  toOptions: =>
    requestMethod: @actualRequestType
    payload: @payload
    contentType: @contentType
    queue: @q
    pushState: @pushState
    onRequestStart: @onRequestStart
    onRequestEnd: @onRequestEnd
    onRequestError: @onRequestError

  onRequestError:(xhr) =>
    if @q is'sync'
      @goToErrorPage(xhr)
    else
      Utils.triggerEvent EVENTS.ERROR, xhr, @target

  goToErrorPage: (xhr) ->
    crossOriginRedirectUrl = (xhr) ->
      redirect = xhr.header['location']
      crossOrigin = (new ComponentUrl(redirect)).crossOrigin()

      if redirect? and crossOrigin
        redirect
    document.location.href = crossOriginRedirectUrl(xhr) or @httpUrl

  onRequestStart:(url) =>
    Utils.triggerEvent EVENTS.FETCH, url: url, @target

  onRequestEnd:(url) =>
    Utils.triggerEvent EVENTS.RECEIVE, url: url, @target

  getBZEntryPoint: (target)=>
    @getBZAttribute(target, 'bz-visit') || @getBZAttribute(target, 'bz-remote')

  setRequestType: (target)=>
    if target.tagName == 'A'
      @httpRequestType = @getBZEntryPoint(target)
      @httpRequestType ?= ''
      @httpRequestType = @httpRequestType.toUpperCase()

      if @httpRequestType not in SUPPORTED_METHODS
        @httpRequestType = FALLBACK_LINK_METHOD

    if target.tagName == 'FORM'
      formActionMethod = target.getAttribute('method')
      @httpRequestType = formActionMethod || @getBZEntryPoint(target)
      @httpRequestType ?= ''
      @httpRequestType = @httpRequestType.toUpperCase()

      if @httpRequestType not in SUPPORTED_METHODS
        @httpRequestType = FALLBACK_FORM_METHOD

    @actualRequestType = if @httpRequestType == 'GET' then 'GET' else 'POST'

  setPayload: (target)=>
    if target.tagName == 'FORM'
      @payload = @nativeEncodeForm(target)

    if @payload not instanceof FormData
      if @payload.indexOf("_method") == -1 && @httpRequestType && @actualRequestType != 'GET'
        @contentType = "application/x-www-form-urlencoded; charset=UTF-8"
        @payload = @formAppend(@payload, "_method", @httpRequestType)
    else
      if !target.querySelector('[name=_method]') && @httpRequestType not in ['GET', 'POST']
        @payload.append("_method", @httpRequestType)

  isValid: =>
    debugger
    @isValidLink() || @isValidForm()

  isValidLink: =>
    if @target.tagName != 'A'
      return false

    @isEnabledWithBz(@target)

  isEnabledWithBz: (target) =>
    @hasBZAttribute(@target, 'bz-remote') || @hasBZAttribute(@target, 'bz-visit')

  isValidForm: =>
    if @target.tagName != 'FORM'
      return false
    @isEnabledWithBz(@target)

  formAppend: (uriEncoded, key, value) ->
    uriEncoded += "&" if uriEncoded.length
    uriEncoded += "#{encodeURIComponent(key)}=#{encodeURIComponent(value)}"

  formDataAppend: (formData, input) ->
    if input.type == 'file'
      for file in input.files
        formData.append(input.name, file)
    else
      formData.append(input.name, input.value)
    formData

  nativeEncodeForm: (form) ->
    formData = new FormData
    @iterateOverFormInputs form, (input) =>
      formData = @formDataAppend(formData, input)
    formData

  iterateOverFormInputs: (form, callback) ->
    inputs = @enabledInputs(form)
    for input in inputs
      inputEnabled = !input.disabled
      radioOrCheck = (input.type == 'checkbox' || input.type == 'radio')

      if inputEnabled && input.name
        if (radioOrCheck && input.checked) || !radioOrCheck
          callback(input)

  enabledInputs: (form) ->
    selector = "input:not([type='reset']):not([type='button']):not([type='submit']):not([type='image']), select, textarea"
    inputs = Array::slice.call(form.querySelectorAll(selector))
    debugger
    disabledNodes = Array::slice.call(@querySelectorAllBZAttribute(form, 'bz-noserialize'))

    return inputs unless disabledNodes.length

    disabledInputs = disabledNodes
    for node in disabledNodes
      disabledInputs = disabledInputs.concat(Array::slice.call(node.querySelectorAll(selector)))

    enabledInputs = []
    for input in inputs when disabledInputs.indexOf(input) < 0
      enabledInputs.push(input)
    enabledInputs

  bzAttribute: (attr) ->
    bzAttr = if attr[0...3] == 'bz-'
      "data-#{attr}"
    else
      "data-bz-#{attr}"

  getBZAttribute: (node, attr) ->
    bzAttr = @bzAttribute(attr)
    (node.getAttribute(bzAttr) || node.getAttribute(attr))

  querySelectorAllBZAttribute: (node, attr, value = null) ->
    bzAttr = @bzAttribute(attr)
    if value
      node.querySelectorAll("[#{bzAttr}=#{value}], [#{attr}=#{value}]")
    else
      node.querySelectorAll("[#{bzAttr}], [#{attr}]")

  hasBZAttribute: (node, attr) ->
    bzAttr = @bzAttribute(attr)
    node.getAttribute(bzAttr)? || node.getAttribute(attr)?

module.exports = Remote
