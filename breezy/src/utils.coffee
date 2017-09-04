ComponentUrl = require('./component_url')
EventEmitter = require('eventemitter3').EventEmitter
request = require('superagent')

emitter = new EventEmitter

warn = ->
  console.warn.apply(@, arguments)

reverseMerge = (dest, obj) ->
  for k, v of obj
    dest[k] = v if !dest.hasOwnProperty(k)
  dest

merge = (dest, obj) ->
  for k, v of obj
    dest[k] = v
  dest

clone = (original) ->
  return original if not original? or typeof original isnt 'object'
  copy = new original.constructor()
  copy[key] = clone value for key, value of original
  copy

withDefaults = (page, state) =>
    currentUrl = new ComponentUrl state.url
    reverseMerge page,
      url: currentUrl.pathToHash
      pathname: currentUrl.pathname
      cachedAt: new Date().getTime()
      assets: []
      data: {}
      positionY: 0
      positionX: 0
      csrf_token: null

directBrowserToUrl = (url) ->
  document.location.href = url.absolute

browserIsBuggy = () ->
# Copied from https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
  ua = navigator.userAgent
  (ua.indexOf('Android 2.') != -1 or ua.indexOf('Android 4.0') != -1) and
    ua.indexOf('Mobile Safari') != -1 and
    ua.indexOf('Chrome') == -1 and
    ua.indexOf('Windows Phone') == -1

browserSupportsPushState = () ->
  window.history and 'pushState' of window.history and 'state' of window.history

popCookie = (name) ->
  value = document.cookie.match(new RegExp(name+"=(\\w+)"))?[1].toUpperCase() or ''
  document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/'
  value

requestMethodIsSafe = -> popCookie('request_method') in ['GET','']

browserSupportsBreezy = ->
  browserSupportsPushState() and !browserIsBuggy() and requestMethodIsSafe()

intersection = (a, b) ->
  [a, b] = [b, a] if a.length > b.length
  value for value in a when value in b


triggerEvent = (name, data, target = document) =>
  event = document.createEvent 'Events'
  event.data = data if data
  event.initEvent name, true, true
  target.dispatchEvent event


isObject = (val) ->
  Object.prototype.toString.call(val) is '[object Object]'

isArray = (val) ->
  Object.prototype.toString.call(val) is '[object Array]'

atKey = (node, key) ->
  [attr, id] = key.split('=')

  if isArray(node) and id
    for child, i in node
      if child[attr].toString() == id
        break

    if child[attr].toString() == id
      return child
    else
      return undefined
  else
    return node[key]

setValueIntoNode = (node, key, value) ->
  [attr, id] = key.split('=')

  if isArray(node) and id
    for child, i in node
      if child[attr].toString() == id
        break

    node[i] = value

  else
    return node[key] = value

set = (node, path, value, opts={}) ->
  return node unless node

  root = node
  keyPath = normalizeKeyPath(path)

  branch = [node]
  for key, i in keyPath
    child = atKey(node, key)
    if child == undefined
      parentPath = keyPath[0..i].join('.')
      Breezy.warn("Could not find child #{key} at #{parentPath}")
      return root
    branch.push child
    node = child

  branch[branch.length - 1] = value
  branch = (shallowCopy(node) for node in branch)

  for key, i in keyPath
    setValueIntoNode(branch[i], key, branch[i + 1])

  branch[0]

get = (obj, keyPath) ->
  keyPath = normalizeKeyPath(path)
  result = obj

  for key, i in keypath
    break if !result
    result = atKey(result, key)

  result

shallowCopy = (obj) ->
  if isArray(obj)
   copy = (num for num in obj)

  if isObject(obj)
    copy = {}
    for key, value of obj
      copy[key] = value

  copy

normalizeKeyPath = (path) ->
  if typeof path is "string"
    path.split('.')
  else
    path

createRequest = (opts)=>
  jsAccept = 'text/javascript, application/x-javascript, application/javascript'
  requestMethod = opts.requestMethod || 'GET'
  url = opts.url.formatForXHR(cache: opts.cacheRequest)

  req = request(requestMethod, url)
  for header, value of opts.header
    req.set(header, value)
  req

dispatch = (opts = {}) =>
  emitter.emit('breezy:action', opts)

goToErrorPage = (xhr, fallbackUrl) ->
  crossOriginRedirectUrl = (xhr) ->
    redirect = xhr.header['location']
    crossOrigin = (new ComponentUrl(redirect)).crossOrigin()

    if redirect? and crossOrigin
      redirect
  document.location.href = crossOriginRedirectUrl(xhr) or fallbackUrl

module.exports =
  warn: warn
  set: set
  reverseMerge: reverseMerge
  merge: merge
  emit: emitter.emit
  on: emitter.on.bind(emitter)
  emitter: emitter
  dispatch: dispatch
  clone: clone
  noop: ->{}
  goToErrorPage: goToErrorPage
  withDefaults: withDefaults
  browserSupportsBreezy: browserSupportsBreezy
  intersection: intersection
  directBrowserToUrl: directBrowserToUrl
  triggerEvent: triggerEvent
  createRequest: createRequest

