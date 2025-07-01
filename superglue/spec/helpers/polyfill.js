import { AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill'
import { JSDOM } from 'jsdom'
import { WebSocket as MockWebSocket} from 'mock-socket'

function setUpDomEnvironment() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  })
  const { window } = dom
  window.WebSocket = MockWebSocket
  global.WebSocket = MockWebSocket

  /// JSON doesn't include event listeners???
  // fix this
  global.addEventListener = () => {}
  global.removeEventListener = () => {}

  global.window = window
  global.document = window.document
  if (!global.navigator) {
    global.navigator = {
      userAgent: 'node.js',
    }
  }
  copyProps(window, global)
}

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter((prop) => typeof target[prop] === 'undefined')
    .map((prop) => Object.getOwnPropertyDescriptor(src, prop))
  Object.defineProperties(target, props)
}

setUpDomEnvironment()

global.AbortController = AbortController
