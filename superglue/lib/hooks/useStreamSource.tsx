import {
  ChannelNameWithParams,
  Consumer,
  Subscription,
} from '@rails/actioncable'
import { setIn, getIn } from '../utils'
import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { appendToFragment, prependToFragment, saveFragment } from '../actions'
import { ApplicationRemote, Fragment } from '../types'
import { useSuperglue } from '.'
import { debounce, DebouncedFunc } from 'lodash'
import { lastRequestIds } from '../utils'

type StreamSourceProps = string | ChannelNameWithParams

type StreamMessage =
  | {
      type: 'message'
      data: JSONMappable
      fragmentKeys: string[]
      action: 'append' | 'prepend' | 'save'
      options: Record<string, string>
      fragments: Fragment[]
    }
  | {
      type: 'message'
      action: 'refresh'
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
    if (options.saveAs) {
      const { saveAs } = options
      this.store.dispatch(
        saveFragment({
          fragmentKey: saveAs,
          data,
        })
      )

      fragments.forEach((fragmentKey) => {
        this.store.dispatch(
          prependToFragment({
            fragmentKey,
            data: {
              __id: saveAs,
            },
          })
        )
      })
    } else {
      fragments.forEach((fragmentKey) => {
        this.store.dispatch(
          prependToFragment({
            fragmentKey: fragmentKey,
            data: data,
          })
        )
      })
    }
  }

  save(fragment: string, data: JSONMappable) {
    this.store.dispatch(
      saveFragment({
        fragmentKey: fragment,
        data,
      })
    )
  }

  append(
    fragments: string[],
    data: JSONMappable,
    options: { saveAs?: string } = {}
  ) {
    if (options.saveAs) {
      const { saveAs } = options
      this.store.dispatch(
        saveFragment({
          fragmentKey: saveAs,
          data,
        })
      )

      fragments.forEach((fragmentKey) => {
        this.store.dispatch(
          appendToFragment({
            fragmentKey,
            data: {
              __id: saveAs,
            },
          })
        )
      })
    } else {
      fragments.forEach((fragmentKey) => {
        this.store.dispatch(
          appendToFragment({
            fragmentKey,
            data,
          })
        )
      })
    }
  }

  handle(rawMessage: string, currentPageKey: string) {
    const message = JSON.parse(rawMessage) as StreamMessage
    const { superglue } = this.store.getState()
    const nextPageKey = superglue.currentPageKey

    let nextMessage = message

    if (message.action !== 'refresh') {
      message.fragments.reverse().forEach((fragment) => {
        const { type, path } = fragment
        const node = getIn(nextMessage as JSONMappable, path) as JSONMappable
        nextMessage = setIn(nextMessage, path, { __id: type })

        this.store.dispatch(
          saveFragment({
            fragmentKey: type,
            data: node,
          })
        )
      })
    }

    if (nextMessage.type === 'message') {
      if (nextMessage.action === 'append') {
        this.append(
          nextMessage.fragmentKeys,
          nextMessage.data,
          nextMessage.options
        )
      }

      if (nextMessage.action === 'prepend') {
        this.prepend(
          nextMessage.fragmentKeys,
          nextMessage.data,
          nextMessage.options
        )
      }

      if (nextMessage.action === 'save') {
        // replace should not be targets... but target
        this.save(nextMessage.fragmentKeys[0], nextMessage.data)
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
  }, [cable, channel, currentPageKey])

  return {
    connected,
    subscription: subscriptionRef.current,
  }
}
