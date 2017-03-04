#= require breezy/doubly_linked_list

class Breezy.ParallelQueue
  constructor: ->
    @dll = new Breezy.DoublyLinkedList
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
    @dll = new Breezy.DoublyLinkedList
    @active = true

