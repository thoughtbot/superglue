
QUnit.module "ParallelQueue"

testWithSession "#push will add an XHR to the q", (assert) ->
  xhr = sinon.useFakeXMLHttpRequest()
  xhr.onload = ->{}

  q = new @Relax.ParallelQueue
  q.push xhr

  assert.equal q.dll.length, 1

testWithSession "#push, when a pushed xhr finishes, it will attempt to process XHRs in the queue, but stop any of the ones ahead are not done", (assert) ->
  xhr1 = {}
  xhr1.onload = -> {}

  xhr2 = {}
  xhr2.onload = -> {}

  q = new @Relax.ParallelQueue
  q.push xhr1
  q.push xhr2

  xhr2.onload()
  assert.equal q.dll.length, 2

  xhr1.onload()
  assert.equal q.dll.length, 0

testWithSession "#push, when a pushed xhr finishes, it will attempt to process XHRs in the queue, and continue if the one ahead are done", (assert) ->
  xhr1 = {}
  xhr1.onload = -> {}

  xhr2 = {}
  xhr2.onload = -> {}

  q = new @Relax.ParallelQueue
  q.push xhr1
  q.push xhr2

  xhr1.onload()
  assert.equal q.dll.length, 1

  xhr2.onload()
  assert.equal q.dll.length, 0

testWithSession "#drain resets the queue and any existing XHRs will not onload", (assert) ->
  xhr1 =  {}
  xhr1.onload = -> {}
  xhr1.abort = ->
    xhr1.status = 0

  q = new @Relax.ParallelQueue
  q.push xhr1

  assert.equal q.dll.length, 1

  q.drain()

  assert.equal q.dll.length, 0
  assert.equal xhr1.status, 0
