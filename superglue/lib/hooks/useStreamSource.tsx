import { Consumer, Subscription } from '@rails/actioncable'
import { useState, useEffect, useRef, createContext, useContext } from 'react'
import {
  appendToFragment,
  prependToFragment,
  replaceFragment,
} from '../actions'
import { ApplicationRemote } from '../types'
import { useSuperglue } from '.'
import { debounce, DebouncedFunc } from 'lodash'
import { lastRequestIds } from '../utils'

type StreamSourceProps = {
  channel: string
  signed_stream_name: string
}

type StreamMessage =
  | {
      type: 'message'
      data: JSONMappable
      targets: string[]
      action: 'append' | 'prepend' | 'replace'
      options: Record<string, unknown>
    }
  | {
      type: 'message'
      action: 'refresh'
      requestId: string
      options: Record<string, unknown>
    }

import { SuperglueStore, JSONMappable } from '../types'

export class StreamActions {
  public attributePrefix: string
  public remote: DebouncedFunc<ApplicationRemote>
  private store: SuperglueStore

  constructor({
    remote,
    store,
  }: {
    remote: ApplicationRemote
    store: SuperglueStore
  }) {
    this.store = store
    this.remote = debounce(remote, 300)
  }

  refresh(pageKey: string) {
    this.remote(pageKey)
  }

  prepend(
    targets: string[],
    data: JSONMappable,
    options: { fragment?: string } = {}
  ) {
    if (options.fragment) {
      const { fragment } = options
      this.store.dispatch(
        replaceFragment({
          target: fragment,
          data: data,
        })
      )

      targets.forEach((target) => {
        this.store.dispatch(
          prependToFragment({
            target: target,
            data: {
              __id: fragment,
            },
          })
        )
      })
    } else {
      targets.forEach((target) => {
        this.store.dispatch(
          prependToFragment({
            target: target,
            data: data,
          })
        )
      })
    }
  }

  replace(target: string, data: JSONMappable) {
    this.store.dispatch(
      replaceFragment({
        target,
        data,
      })
    )
  }

  append(
    targets: string[],
    data: JSONMappable,
    options: { fragment?: string } = {}
  ) {
    if (options.fragment) {
      const { fragment } = options
      this.store.dispatch(
        replaceFragment({
          target: fragment,
          data: data,
        })
      )

      targets.forEach((target) => {
        this.store.dispatch(
          appendToFragment({
            target: target,
            data: {
              __id: fragment,
            },
          })
        )
      })
    } else {
      targets.forEach((target) => {
        this.store.dispatch(
          appendToFragment({
            target: target,
            data: data,
          })
        )
      })
    }
  }

  handle(rawMessage: string, currentPageKey: string) {
    const message = JSON.parse(rawMessage) as StreamMessage
    const { superglue } = this.store.getState()
    const nextPageKey = superglue.currentPageKey

    if (message.type === 'message') {
      if (message.action === 'append') {
        this.append(message.targets, message.data, message.options)
      }

      if (message.action === 'prepend') {
        this.prepend(message.targets, message.data, message.options)
      }

      if (message.action === 'replace') {
        // replace should not be targets... but target
        this.replace(message.targets[0], message.data)
      }

      if (
        message.action === 'refresh' &&
        currentPageKey === nextPageKey &&
        !lastRequestIds.has(message.requestId)
      ) {
        this.refresh(currentPageKey)
      }
    }
  }
}

export const CableContext = createContext<{
  cable: Consumer | null
  streamActions: StreamActions | null
}>({
  cable: null,
  streamActions: null,
})

export default function useStreamSource(channel: StreamSourceProps) {
  const { cable, streamActions } = useContext(CableContext)
  const [connected, setConnected] = useState(false)
  const { currentPageKey } = useSuperglue()
  const subscriptionRef = useRef<Subscription | null>(null)

  useEffect(() => {
    if (cable) {
      const subscription = cable.subscriptions.create(channel, {
        received: (message) => {
          streamActions?.handle(message, currentPageKey)
        },
        connected: () => {
          setConnected(true)
        },
        disconnected: () => setConnected(false),
      })

      subscriptionRef.current = subscription

      return () => subscription.unsubscribe()
    } else {
      subscriptionRef.current = null
      setConnected(false)

      return () => {}
    }
  }, [cable, channel.channel, channel.signed_stream_name, currentPageKey])

  return {
    connected,
    subscription: subscriptionRef.current,
  }
}
