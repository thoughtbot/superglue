Utils = require('./utils.coffee')
EVENTS = require('./events.coffee')

class Remote
  SUPPORTED_METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
  FALLBACK_LINK_METHOD = 'GET'
  FALLBACK_FORM_METHOD = 'POST'

  constructor: (target, opts={})->
    @target = target
    @payload = ''
    @contentType = null
    @setRequestType(target)
    @async =  @getBZAttribute(target, 'bz-remote-async') || false
    @pushState =  !(@getBZAttribute(target, 'bz-push-state') == 'false')
    @httpUrl = target.getAttribute('href') || target.getAttribute('action')
    @silent = @getBZAttribute(target, 'bz-silent') || false
    @setPayload(target)

  toOptions: =>
    requestMethod: @actualRequestType
    payload: @payload
    contentType: @contentType
    silent: @silent
    target: @target
    async: @async
    pushState: @pushState
    onRequestStart: @onRequestStart

  onRequestStart:(url) =>
    Utils.triggerEvent EVENTS.FETCH, url: url.absolute, @target

  setRequestType: (target)=>
    if target.tagName == 'A'
      @httpRequestType = @getBZAttribute(target, 'bz-remote')
      @httpRequestType ?= ''
      @httpRequestType = @httpRequestType.toUpperCase()

      if @httpRequestType not in SUPPORTED_METHODS
        @httpRequestType = FALLBACK_LINK_METHOD

    if target.tagName == 'FORM'
      formActionMethod = target.getAttribute('method')
      @httpRequestType = formActionMethod || @getBZAttribute(target, 'bz-remote')
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
    @isValidLink() || @isValidForm()

  isValidLink: =>
    if @target.tagName != 'A'
      return false

    @hasBZAttribute(@target, 'bz-remote')

  isValidForm: =>
    if @target.tagName != 'FORM'
      return false
    @hasBZAttribute(@target, 'bz-remote') &&
    @target.getAttribute('action')?

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
    disabledNodes = Array::slice.call(@querySelectorAllBZAttribute(form, 'bz-remote-noserialize'))

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
