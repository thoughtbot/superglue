DoublyLinkedList = require('./doubly_linked_list.coffee')

class ParallelQueue
  constructor: ->
    @dll = new DoublyLinkedList
    @active = true

  push:(xhr)->
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

module.exports = ParallelQueue

