import { ThunkAction } from 'redux-thunk'
import { Action } from '@reduxjs/toolkit'
import { setIn, getIn } from '../utils'
import { appendToFragment, prependToFragment, saveFragment } from '../actions'
import { JSONMappable, RootState, StreamResponse } from '../types'
import { StreamMessage } from '../hooks/useStreamSource'

export type StreamThunk = ThunkAction<void, RootState, undefined, Action>
export type StreamHandleThunk = ThunkAction<void, RootState, undefined, Action>

export interface StreamThunkOptions {
  saveAs?: string
}

/**
 * Stream thunk equivalent to StreamActions.prepend()
 * Prepends data to specified fragments, optionally saving as a new fragment
 */
export const streamPrepend = (
  fragments: string[],
  data: JSONMappable,
  options: StreamThunkOptions = {}
): StreamThunk => {
  return (dispatch) => {
    if (options.saveAs) {
      const { saveAs } = options
      dispatch(
        saveFragment({
          fragmentKey: saveAs,
          data,
        })
      )

      fragments.forEach((fragmentKey) => {
        dispatch(
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
        dispatch(
          prependToFragment({
            fragmentKey: fragmentKey,
            data: data,
          })
        )
      })
    }
  }
}

/**
 * Stream thunk equivalent to StreamActions.append()
 * Appends data to specified fragments, optionally saving as a new fragment
 */
export const streamAppend = (
  fragments: string[],
  data: JSONMappable,
  options: StreamThunkOptions = {}
): StreamThunk => {
  return (dispatch) => {
    if (options.saveAs) {
      const { saveAs } = options
      dispatch(
        saveFragment({
          fragmentKey: saveAs,
          data,
        })
      )

      fragments.forEach((fragmentKey) => {
        dispatch(
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
        dispatch(
          appendToFragment({
            fragmentKey,
            data,
          })
        )
      })
    }
  }
}

/**
 * Stream thunk equivalent to StreamActions.save()
 * Saves data to a specific fragment
 */
export const streamSave = (
  fragment: string,
  data: JSONMappable
): StreamThunk => {
  return (dispatch) => {
    dispatch(
      saveFragment({
        fragmentKey: fragment,
        data,
      })
    )
  }
}

export const handleStreamMessage = (rawMessage: string): StreamHandleThunk => {
  return (dispatch) => {
    const message = JSON.parse(rawMessage) as StreamMessage

    let nextMessage = message

    if (message.action !== 'refresh') {
      message.fragments.reverse().forEach((fragment) => {
        const { type, path } = fragment
        const node = getIn(nextMessage as JSONMappable, path) as JSONMappable
        nextMessage = setIn(nextMessage, path, { __id: type })

        dispatch(
          saveFragment({
            fragmentKey: type,
            data: node,
          })
        )
      })
    }

    if (nextMessage.type === 'message') {
      if (nextMessage.action === 'append') {
        dispatch(
          streamAppend(
            nextMessage.fragmentKeys,
            nextMessage.data,
            nextMessage.options
          )
        )
      }

      if (nextMessage.action === 'prepend') {
        dispatch(
          streamPrepend(
            nextMessage.fragmentKeys,
            nextMessage.data,
            nextMessage.options
          )
        )
      }

      if (nextMessage.action === 'save') {
        dispatch(streamSave(nextMessage.fragmentKeys[0], nextMessage.data))
      }
    }
  }
}

export const handleStreamResponse = (
  response: StreamResponse
): StreamHandleThunk => {
  return (dispatch) => {
    let nextResponse = response

    nextResponse.fragments.reverse().forEach((fragment) => {
      const { type, path } = fragment
      const node = getIn(nextResponse as JSONMappable, path) as JSONMappable
      nextResponse = setIn(nextResponse, path, { __id: type })

      dispatch(
        saveFragment({
          fragmentKey: type,
          data: node,
        })
      )
    })

    nextResponse.data.forEach((message) => {
      if (message.action === 'append') {
        dispatch(
          streamAppend(message.fragmentKeys, message.data, message.options)
        )
      }

      if (message.action === 'prepend') {
        dispatch(
          streamPrepend(message.fragmentKeys, message.data, message.options)
        )
      }

      if (message.action === 'save') {
        dispatch(streamSave(message.fragmentKeys[0], message.data))
      }
    })
  }
}
