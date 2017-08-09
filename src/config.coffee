queues = {}
baseUrl = ''

addQueue = (name, obj) =>
  return false if queues[name]?
  queues[name] = obj

fetchQueue = (name) ->
  queues[name]

removeQueue = (name) ->
  delete queues[name]

setBaseUrl = (url) ->
  baseUrl = url

fetchBaseUrl = ->
  baseUrl

module.exports =
  addQueue: addQueue
  removeQueue: removeQueue
  fetchQueue: fetchQueue
  setBaseUrl: setBaseUrl
  fetchBaseUrl: fetchBaseUrl

