import { describe, expect, it } from 'vitest'
import { flashReducer } from '../../lib/reducers'

describe('flash reducer', () => {
  describe('RESET', () => {
    it('resets to empty', () => {
      const prevState = { notice: 'hello' }
      const nextState = flashReducer(prevState, {
        type: '@@superglue/RESET',
      })
      expect(nextState).toEqual({})
    })
  })

  describe('BEFORE_VISIT', () => {
    it('clears flash on visit', () => {
      const prevState = { notice: 'hello', alert: 'danger' }
      const nextState = flashReducer(prevState, {
        type: '@@superglue/BEFORE_VISIT',
        payload: {
          currentPageKey: '/foo',
          fetchArgs: ['/foo', {}],
        },
      })
      expect(nextState).toEqual({})
    })
  })

  describe('CLEAR_FLASH', () => {
    it('clears all flash when no key provided', () => {
      const prevState = { notice: 'hello', alert: 'danger' }
      const nextState = flashReducer(prevState, {
        type: '@@superglue/CLEAR_FLASH',
        payload: {},
      })
      expect(nextState).toEqual({})
    })

    it('clears a specific key', () => {
      const prevState = { notice: 'hello', alert: 'danger' }
      const nextState = flashReducer(prevState, {
        type: '@@superglue/CLEAR_FLASH',
        payload: { key: 'notice' },
      })
      expect(nextState).toEqual({ alert: 'danger' })
    })
  })

  describe('FLASH', () => {
    it('merges flash data', () => {
      const prevState = { notice: 'hello' }
      const nextState = flashReducer(prevState, {
        type: '@@superglue/FLASH',
        payload: { flash: { alert: 'danger' } },
      })
      expect(nextState).toEqual({ notice: 'hello', alert: 'danger' })
    })

    it('overwrites existing keys', () => {
      const prevState = { notice: 'hello' }
      const nextState = flashReducer(prevState, {
        type: '@@superglue/FLASH',
        payload: { flash: { notice: 'updated' } },
      })
      expect(nextState).toEqual({ notice: 'updated' })
    })
  })

  describe('RECEIVE_RESPONSE', () => {
    it('merges flash from response', () => {
      const prevState = {}
      const nextState = flashReducer(prevState, {
        type: '@@superglue/RECEIVE_RESPONSE',
        payload: {
          pageKey: '/foo',
          response: {
            flash: { notice: 'Success!' },
          },
        },
      })
      expect(nextState).toEqual({ notice: 'Success!' })
    })

    it('returns state when response has no flash', () => {
      const prevState = { notice: 'existing' }
      const nextState = flashReducer(prevState, {
        type: '@@superglue/RECEIVE_RESPONSE',
        payload: {
          pageKey: '/foo',
          response: {},
        },
      })
      expect(nextState).toEqual({ notice: 'existing' })
    })
  })
})
