import { Server as MockServer } from 'mock-socket'
import { renderHook } from '@testing-library/react'
import useStreamSource, { CableContext } from '../../lib/hooks/useStreamSource'
import { describe, it, assert, expect, vi } from 'vitest'
import * as ActionCable from 'actioncable'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

export const testURL = 'ws://cable.example.com/'

export function defer(callback) {
  if(callback) {
    console.log('deffering')
    setTimeout(callback, 5)
  }
}

const consumerTest = function (name, options, callback) {
  if (options == null) options = {}
  if (callback == null) {
    callback = options
    options = {}
  }

  if (options.url == null) options.url = testURL

  return it(name, () => {
    return new Promise((doneAsync) => {
      const server = new MockServer(options.url, {mock: false})
      const consumer = ActionCable.createConsumer(options.url)
      const connection = consumer.connection
      const monitor = connection.monitor

      if ('subprotocols' in options)
        consumer.addSubProtocol(options.subprotocols)

      server.on('connection', function () {
        console.log('connected')
        const clients = server.clients()
        assert.equal(clients.length, 1)
        assert.equal(clients[0].readyState, WebSocket.OPEN)
      })

      server.broadcastTo = function (subscription, data, callback) {
        if (data == null) { data = {} }
        data.identifier = subscription.identifier

        if (data.message_type) {
          data.type = ActionCable.INTERNAL.message_types[data.message_type]
          delete data.message_type
        }

        server.send(JSON.stringify(data))
        defer(callback)
      }

      const done = function () {
        consumer.disconnect()
        server.close()
        doneAsync()
      }

      const testData = {
        assert,
        consumer,
        connection,
        monitor,
        server,
        done,
      }

      if (options.connect === false) {
        callback(testData)
      } else {
        server.on('connection', function () {
          testData.client = server.clients()[0]
          callback(testData)
        })
        consumer.connect()
      }
    })
  })
}

describe('hooks', () => {
  consumerTest("#connected callback", ({server, consumer, done}) => {
    const subscription = consumer.subscriptions.create("chat", {
      received(message) {
        console.log('message')
        console.log(message)
        streamActions?.handle(message, currentPageKey)
        done()
      },
      connected() {
        console.log('connected one')
        // assert.ok(true)
        // defer(()=> {
        //   // console.log('deffering');
        //   server.broadcastTo(subscription, {message_type: "confirmation"})
        // })
      }
    })
    console.log(subscription)
    // subscription.connect()
    // consumer.connect()
    // server.broadcastTo(subscription, {message_type: "confirmation"})
  })

  // describe('useContent', () => {
    // consumerTest('connects well', async ({ server, consumer, done }) => {
    //   const streamActions = {
    //     handle: vi.fn(),
    //   }

    //   const preloadedState = {
    //     superglue: {
    //       currentPageKey: '/current?abc=123',
    //       pathname: '/current',
    //       search: '?abc=123',
    //       csrfToken: 'csrf123',
    //       assets: ['js-asset-123'],
    //     },
    //   }
    //   let store = configureStore({
    //     preloadedState,
    //     reducer: (state) => state,
    //   })

    //   const wrapper = ({ children }) => (
    //     <Provider store={store}>
    //       <CableContext.Provider value={{ cable: consumer, streamActions }}>
    //         {children}
    //       </CableContext.Provider>
    //     </Provider>
    //   )

    //   const { result, rerender } = renderHook(
    //     () =>
    //       useStreamSource({
    //         channel: 'TestChannel',
    //         signed_stream_name: 'abc',
    //       }),
    //     { wrapper }
    //   )

    //   console.log(result)
    //   rerender()
    //   console.log(result)
    //   rerender()
    //   console.log(result)

    //   const spy = vi.spyOn(streamActions, 'handle')

    //   server.broadcastTo(result.current.subscription, {
    //     type: 'message',
    //     action: 'append',
    //     data: { id: 1, name: 'foo' },
    //     targets: ['stream_1'],
    //     options: {},
    //   })

    //   await new Promise((r) => setTimeout(r, 5))

    //   expect(spy).toHaveBeenCalledWith({})
    //   // expect(result.current.connected).toBe(true)

    //   // consumer.disconnect()
    //   // server.close()
    //   // expect(result.current.connected).toBe(false)

    //   done()
    // })
  // })
})
