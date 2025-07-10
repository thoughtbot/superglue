import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib'

import { StreamActions } from '../../lib/hooks/useStreamSource'
import { describe, expect, afterEach, beforeEach, it, vi } from 'vitest'

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
  describe('save', () => {
    it('saves the data to a fragment', () => {
      const store = buildStore({
        fragments: {},
      })
      const actions = new StreamActions({ store, remote: vi.fn() })
      actions.save('post_1', { hello: 'world' })

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
      actions.append(['posts'], { hello: 'world' }, { saveAs: 'post_2' })

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
      actions.prepend(['posts'], { hello: 'world' }, { saveAs: 'post_2' })

      const nextState = store.getState()

      expect(nextState.fragments).toEqual({
        posts: [{ __id: 'post_2' }, { hello: 'john' }],
        post_2: { hello: 'world' },
      })
    })
  })

  describe('handle', () => {
    it('handles append action and updates fragments state', () => {
      const store = buildStore({
        fragments: {
          foo: []
        },
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const msg = JSON.stringify({
        action: 'handleStreamMessage',
        method: 'append',
        fragmentIds: ['foo'],
        data: { id: 1 },
        options: {},
        fragments: []
      })

      actions.handle(msg, '/posts')
      
      const nextState = store.getState()
      expect(nextState.fragments).toEqual({
        foo: [{ id: 1 }],
      })
    })

    it('handles prepend action and updates fragments state', () => {
      const store = buildStore({
        fragments: {
          bar: [{ id: 0 }]
        },
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const msg = JSON.stringify({
        action: 'handleStreamMessage',
        method: 'prepend',
        fragmentIds: ['bar'],
        data: { id: 2 },
        options: {},
        fragments: []
      })

      actions.handle(msg, '/posts')
      
      const nextState = store.getState()
      expect(nextState.fragments).toEqual({
        bar: [{ id: 2 }, { id: 0 }],
      })
    })

    it('handles save action and updates fragments state', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const msg = JSON.stringify({
        action: 'handleStreamMessage',
        method: 'save',
        fragmentIds: ['baz'],
        data: { id: 3 },
        options: {},
        fragments: []
      })

      actions.handle(msg, '/posts')
      
      const nextState = store.getState()
      expect(nextState.fragments).toEqual({
        baz: { id: 3 },
      })
    })

    it('calls refresh if page keys match', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const stub = vi.spyOn(actions, 'refresh').mockImplementation(() => {})
      const msg = JSON.stringify({ 
        action: 'handleStreamMessage', 
        method: 'refresh',
        requestId: 'test-request-id',
        options: {}
      })

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
      const msg = JSON.stringify({ 
        action: 'handleStreamMessage', 
        method: 'refresh',
        requestId: 'test-request-id',
        options: {}
      })

      actions.handle(msg, '/posts')
      expect(stub).not.toHaveBeenCalled()
    })

    it('denormalizes fragments from message and stores them in fragments slice', () => {
      const store = buildStore({
        fragments: {
          posts: []
        },
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const msg = JSON.stringify({
        action: 'handleStreamMessage',
        method: 'append',
        fragmentIds: ['posts'],
        data: {
          header: {
            avatar: {
              name: 'John Smith',
            },
          },
        },
        options: {},
        fragments: [
          { id: 'header', path: 'data.header' },
          { id: 'user', path: 'data.header.avatar' },
        ]
      })

      actions.handle(msg, '/posts')

      const nextState = store.getState()

      expect(nextState.fragments).toEqual({
        user: {
          name: 'John Smith',
        },
        header: {
          avatar: { __id: 'user' },
        },
        posts: [{
          header: { __id: 'header' },
        }],
      })
    })

    it('skips fragment processing for refresh actions', () => {
      const store = buildStore({
        fragments: {},
        superglue: { currentPageKey: '/posts' },
      })
      const actions = new StreamActions({ store, remote: vi.fn() })

      const stub = vi.spyOn(actions, 'refresh').mockImplementation(() => {})
      const msg = JSON.stringify({
        action: 'handleStreamMessage',
        method: 'refresh',
        requestId: 'test-request-id',
        options: {},
      })

      actions.handle(msg, '/posts')

      const nextState = store.getState()

      // Fragments should remain empty since refresh actions skip fragment processing
      expect(nextState.fragments).toEqual({})
      expect(stub).toHaveBeenCalledWith('/posts')
    })
  })
})
