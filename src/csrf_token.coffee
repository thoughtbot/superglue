class CSRFToken
  @get: (doc = document) ->
    node:   tag = doc.querySelector 'meta[name="csrf-token"]'
    token:  tag?.getAttribute? 'content'

  @update: (latest, doc = document) ->
    current = @get(doc)
    if current.token? and latest? and current.token isnt latest
      current.node.setAttribute 'content', latest

module.exports = CSRFToken
