import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib'

import { StreamActions } from '../../lib/hooks/useStreamSource'
import { describe, expect, afterEach, it, vi } from 'vitest'

const buildStore = (preloadedState) => {
  let resultsReducer = (state = [], action) => {
    return state.concat([action])
  }

  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
      results: resultsReducer,
    },
  })
}

describe('Stream Actions', () => {
  describe('replace', () => {
    it('saves the data to a fragment', () => {
      const store = buildStore({
        fragments: {},
      })
      const remote = vi.fn()

      const actions = new StreamActions({ store, remote: vi.fn() })
      actions.replace('post_1', { hello: 'world' })

      const nextState = store.getState()

      expect(nextState.fragments).toEqual({
        post_1: { hello: 'world' },
      })
    })
  })

  describe('refresh', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('debouces a remote call', () => {
      const store = buildStore({
        fragments: {},
      })
      const remote = vi.fn()

      const actions = new StreamActions({ store, remote})
      actions.refresh('/posts')
      expect(remote).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)

      expect(remote).toHaveBeenCalledWith('/posts')
    })
  })

  describe('append', () => {
    it('appends data to a fragment', () => {
      const store = buildStore({
        fragments: {
          posts: [{ hello: 'john' }],
        },
      })

      const actions = new StreamActions({ store, remote: vi.fn() })
      actions.append(['posts'], { hello: 'world' })

      const nextState = store.getState()

      expect(nextState.fragments).toEqual({
        posts: [{ hello: 'john' }, { hello: 'world' }],
      })
    })

    it('appends a fragment to a fragment', () => {
      const store = buildStore({
        fragments: {
          posts: [{ hello: 'john' }],
        },
      })

      const actions = new StreamActions({ store, remote: vi.fn() })
      actions.append(['posts'], { hello: 'world' }, { fragment: 'post_2' })

      const nextState = store.getState()

      expect(nextState.fragments).toEqual({
        posts: [{ hello: 'john' }, { __id: 'post_2' }],
        post_2: { hello: 'world' },
      })
    })
  })

  describe('prepend', () => {
    it('prepends data to a fragment', () => {
      const store = buildStore({
        fragments: {
          posts: [{ hello: 'john' }],
        },
      })

      const actions = new StreamActions({ store, remote: vi.fn() })
      actions.prepend(['posts'], { hello: 'world' })

      const nextState = store.getState()

      expect(nextState.fragments).toEqual({
        posts: [{ hello: 'world' }, { hello: 'john' }],
      })
    })

    it('prepends a fragment to a fragment', () => {
      const store = buildStore({
        fragments: {
          posts: [{ hello: 'john' }],
        },
      })

      const actions = new StreamActions({ store, remote: vi.fn() })
      actions.prepend(['posts'], { hello: 'world' }, { fragment: 'post_2' })

      const nextState = store.getState()

      expect(nextState.fragments).toEqual({
        posts: [{ __id: 'post_2' }, { hello: 'john' }],
        post_2: { hello: 'world' },
      })
    })
  })

  describe('handle', () => {
    it('calls append with correct arguments', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const stub = vi.spyOn(actions, 'append').mockImplementation(() => {})
      const msg = JSON.stringify({
        type: 'message',
        action: 'append',
        targets: ['foo'],
        data: { id: 1 },
      })

      actions.handle(msg, '/posts')
      expect(stub).toHaveBeenCalledWith(['foo'], { id: 1 }, undefined)
    })

    it('calls prepend with correct arguments', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const stub = vi.spyOn(actions, 'prepend').mockImplementation(() => {})
      const msg = JSON.stringify({
        type: 'message',
        action: 'prepend',
        targets: ['bar'],
        data: { id: 2 },
      })

      actions.handle(msg, '/posts')
      expect(stub).toHaveBeenCalledWith(['bar'], { id: 2 }, undefined)
    })

    it('calls replace with correct arguments', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const stub = vi.spyOn(actions, 'replace').mockImplementation(() => {})
      const msg = JSON.stringify({
        type: 'message',
        action: 'replace',
        targets: ['baz'],
        data: { id: 3 },
      })

      actions.handle(msg, '/posts')
      expect(stub).toHaveBeenCalledWith('baz', { id: 3 })
    })

    it('calls refresh if page keys match', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const stub = vi.spyOn(actions, 'refresh').mockImplementation(() => {})
      const msg = JSON.stringify({ type: 'message', action: 'refresh' })

      actions.handle(msg, '/posts')
      expect(stub).toHaveBeenCalledWith('/posts')
    })

    it('does not call refresh if page keys do not match', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: 'page_2' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const stub = vi.spyOn(actions, 'refresh').mockImplementation(() => {})
      const msg = JSON.stringify({ type: 'message', action: 'refresh' })

      actions.handle(msg, '/posts')
      expect(stub).not.toHaveBeenCalled()
    })
  })
})
