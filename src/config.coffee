queues = {}

addQueue = (name, obj) =>
  return false if queues[name]?
  queues[name] = obj

fetchQueue = (name) ->
  queues[name]

module.exports =
  addQueue: addQueue
  fetchQueue: fetchQueue

