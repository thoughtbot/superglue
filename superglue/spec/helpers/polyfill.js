import { AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill'
import { WebSocket as MockWebSocket } from 'mock-socket'

global.WebSocket = MockWebSocket
if (typeof window !== 'undefined') {
  window.WebSocket = MockWebSocket
}

global.AbortController = AbortController
