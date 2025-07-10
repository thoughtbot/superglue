import {
  ChannelNameWithParams,
  Consumer,
  Subscription,
} from '@rails/actioncable'
import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { ApplicationRemote, FragmentRef } from '../types'
import { useSuperglue } from '.'
import { debounce, DebouncedFunc } from 'lodash'
import { lastRequestIds } from '../utils'
import {
  streamPrepend,
  streamAppend,
  streamSave,
  handleStreamMessage,
} from '../action_creators/stream'

type StreamSourceProps = string | ChannelNameWithParams

export type StreamMessage =
  | {
      action: 'handleStreamMessage'
      data: JSONMappable
      fragmentIds: string[]
      method: 'append' | 'prepend' | 'save'
      options: Record<string, string>
      fragments: FragmentRef[]
    }
  | {
      action: 'handleStreamMessage'
      method: 'refresh'
      requestId: string
      options: Record<string, string>
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
    fragments: string[],
    data: JSONMappable,
    options: { saveAs?: string } = {}
  ) {
    this.store.dispatch(streamPrepend(fragments, data, options))
  }

  save(fragment: string, data: JSONMappable) {
    this.store.dispatch(streamSave(fragment, data))
  }

  append(
    fragments: string[],
    data: JSONMappable,
    options: { saveAs?: string } = {}
  ) {
    this.store.dispatch(streamAppend(fragments, data, options))
  }

  handle(rawMessage: string, currentPageKey: string) {
    const message = JSON.parse(rawMessage) as StreamMessage
    const { superglue } = this.store.getState()
    const nextPageKey = superglue.currentPageKey

    if (message.action === 'handleStreamMessage') {
      if (
        message.method === 'refresh' &&
        currentPageKey === nextPageKey &&
        !lastRequestIds.has(message.requestId)
      ) {
        this.refresh(currentPageKey)
      }

      if (message.method !== 'refresh') {
        this.store.dispatch(handleStreamMessage(rawMessage))
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
  }, [cable, channel, currentPageKey])

  return {
    connected,
    subscription: subscriptionRef.current,
  }
}
