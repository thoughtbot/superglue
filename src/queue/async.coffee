DoublyLinkedList = require('../doubly_linked_list.coffee')
Utils = require('../utils.coffee')

class Async
  constructor: (@delegate) ->
    @dll = new DoublyLinkedList
    @active = true
    Utils.on 'breezy:visit', => @drain()

  push:(url, options)->
    xhr = Utils.createRequest(@delegate, url, options)
    xhr.onError = ->
      options.onRequestError?(null)

    @dll.push(xhr)
    xhr._originalOnLoad = xhr.onload.bind(xhr)

    xhr.onload = =>
      if @active
        xhr._isDone = true
        node = @dll.head
        while(node)
          qxhr = node.element
          if !qxhr._isDone
            node = null
          else
            node = node.next
            @dll.shift()
            qxhr._originalOnLoad()

    xhr.send(options.payload)

  drain: ->
    @active = false
    node = @dll.head
    while(node)
      qxhr = node.element
      qxhr.abort()
      qxhr._isDone = true
      node = node.next
    @dll = new DoublyLinkedList
    @active = true

module.exports = Async


