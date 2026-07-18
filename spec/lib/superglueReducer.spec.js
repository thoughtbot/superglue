import { describe, expect, it } from 'vitest'
import { superglueReducer } from '../../lib/reducers'

describe('superglue reducer', () => {
  describe('SUPERGLUE_HISTORY_CHANGE', () => {
    it('sets the currentPageKey', () => {
      const prevState = { foo: 'bar' }
      const action = {
        type: '@@superglue/HISTORY_CHANGE',
        payload: {
          pageKey: '/some_url?foo=123',
        },
      }
      const nextState = superglueReducer(prevState, action)

      expect(nextState).toEqual({
        foo: 'bar',
        search: { foo: '123' },
        currentPageKey: '/some_url?foo=123',
      })
    })
  })

  describe('SUPERGLUE_SAVE_RESPONSE', () => {
    it('saves the response csrfToken', () => {
      const prevState = { foo: 'bar' }
      const action = {
        type: '@@superglue/SAVE_RESPONSE',
        payload: {
          page: {
            csrfToken: 'some_token',
            assets: ['abc123.js'],
          },
        },
      }
      const nextState = superglueReducer(prevState, action)

      expect(nextState).toEqual({
        foo: 'bar',
        csrfToken: 'some_token',
        assets: ['abc123.js'],
      })
    })
  })

  describe('SUPERGLUE_SET_CSRF_TOKEN', () => {
    it('sets the initial CSRF token', () => {
      const prevState = { foo: 'bar' }
      const action = {
        type: '@@superglue/SET_CSRF_TOKEN',
        payload: {
          csrfToken: 'some_token',
        },
      }
      const nextState = superglueReducer(prevState, action)

      expect(nextState).toEqual({
        foo: 'bar',
        csrfToken: 'some_token',
      })
    })
  })

  describe('SUPERGLUE_BEFORE_VISIT', () => {
    it('sets isVisiting to true', () => {
      const prevState = { isVisiting: false, currentPageKey: '/foo' }
      const action = {
        type: '@@superglue/BEFORE_VISIT',
        payload: {
          currentPageKey: '/foo',
          fetchArgs: [{}, {}],
        },
      }
      const nextState = superglueReducer(prevState, action)

      expect(nextState).toEqual({
        isVisiting: true,
        currentPageKey: '/foo',
      })
    })
  })

  describe('SUPERGLUE_VISIT_END', () => {
    it('sets isVisiting to false', () => {
      const prevState = { isVisiting: true, currentPageKey: '/foo' }
      const action = {
        type: '@@superglue/VISIT_END',
        payload: {
          fetchArgs: [{}, {}],
        },
      }
      const nextState = superglueReducer(prevState, action)

      expect(nextState).toEqual({
        isVisiting: false,
        currentPageKey: '/foo',
      })
    })
  })
})
