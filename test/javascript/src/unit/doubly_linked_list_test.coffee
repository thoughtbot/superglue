QUnit.module "DoublyLinkedList"

testWithSession "a new ddl starts off with 0 element", (assert) ->
  ddl = new @Relax.DoublyLinkedList
  assert.equal ddl.length, 0

testWithSession "push inserts an element", (assert) ->
  ddl = new @Relax.DoublyLinkedList
  element = {}
  ddl.push(element)
  assert.equal ddl.length, 1
  assert.equal ddl.tail.element, element
  assert.equal ddl.head.element, element

  element2 = {}
  ddl.push(element2)
  assert.equal ddl.length, 2
  assert.equal ddl.tail.element, element2
  assert.equal ddl.head.element, element

testWithSession "unshift inserts an element in the beginning", (assert) ->
  ddl = new @Relax.DoublyLinkedList
  element = {}
  ddl.unshift(element)
  assert.equal ddl.length, 1
  assert.equal ddl.tail.element, element
  assert.equal ddl.head.element, element

  element2 = {}
  ddl.unshift(element2)
  assert.equal ddl.length, 2
  assert.equal ddl.tail.element, element
  assert.equal ddl.head.element, element2

testWithSession "pop removes the last element", (assert) ->
  ddl = new @Relax.DoublyLinkedList
  element = {}
  element2 = {}

  ddl.push(element)
  ddl.push(element2)

  assert.equal ddl.length, 2
  assert.equal ddl.tail.element, element2

  poppedElement = ddl.pop()
  assert.equal ddl.length, 1
  assert.equal poppedElement, element2
  assert.equal ddl.tail.element, element

testWithSession "array shift removes the first element", (assert) ->
  ddl = new @Relax.DoublyLinkedList
  element = {}
  element2 = {}

  ddl.push(element)
  ddl.push(element2)

  assert.equal ddl.length, 2
  assert.equal ddl.tail.element, element2

  released = ddl.shift()
  assert.equal ddl.length, 1
  assert.equal released, element
  assert.equal ddl.head.element, element2

