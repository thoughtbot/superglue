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
          fragmentId: saveAs,
          data,
        })
      )

      fragments.forEach((fragmentId) => {
        dispatch(
          prependToFragment({
            fragmentId,
            data: {
              __id: saveAs,
            },
          })
        )
      })
    } else {
      fragments.forEach((fragmentId) => {
        dispatch(
          prependToFragment({
            fragmentId: fragmentId,
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
          fragmentId: saveAs,
          data,
        })
      )

      fragments.forEach((fragmentId) => {
        dispatch(
          appendToFragment({
            fragmentId,
            data: {
              __id: saveAs,
            },
          })
        )
      })
    } else {
      fragments.forEach((fragmentId) => {
        dispatch(
          appendToFragment({
            fragmentId,
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
        fragmentId: fragment,
        data,
      })
    )
  }
}

export const handleStreamMessage = (rawMessage: string): StreamHandleThunk => {
  return (dispatch) => {
    const message = JSON.parse(rawMessage) as StreamMessage

    let nextMessage = message

    if (message.handler !== 'refresh') {
      message.fragments.reverse().forEach((fragment) => {
        const { id, path } = fragment
        const node = getIn(nextMessage as JSONMappable, path) as JSONMappable
        nextMessage = setIn(nextMessage, path, { __id: id })

        dispatch(
          saveFragment({
            fragmentId: id,
            data: node,
          })
        )
      })
    }

    if (nextMessage.action === 'handleStreamMessage') {
      if (nextMessage.handler === 'append') {
        dispatch(
          streamAppend(
            nextMessage.fragmentIds,
            nextMessage.data,
            nextMessage.options
          )
        )
      }

      if (nextMessage.handler === 'prepend') {
        dispatch(
          streamPrepend(
            nextMessage.fragmentIds,
            nextMessage.data,
            nextMessage.options
          )
        )
      }

      if (nextMessage.handler === 'save') {
        dispatch(streamSave(nextMessage.fragmentIds[0], nextMessage.data))
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
      const { id, path } = fragment
      const node = getIn(nextResponse as JSONMappable, path) as JSONMappable
      nextResponse = setIn(nextResponse, path, { __id: id })

      dispatch(
        saveFragment({
          fragmentId: id,
          data: node,
        })
      )
    })

    nextResponse.data.forEach((message) => {
      if (message.handler === 'append') {
        dispatch(
          streamAppend(message.fragmentIds, message.data, message.options)
        )
      }

      if (message.handler === 'prepend') {
        dispatch(
          streamPrepend(message.fragmentIds, message.data, message.options)
        )
      }

      if (message.handler === 'save') {
        dispatch(streamSave(message.fragmentIds[0], message.data))
      }
    })
  }
}
