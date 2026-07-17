import { describe, expect, afterEach, it, vi } from 'vitest'
import fetchMock from 'fetch-mock'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import { webVisit, webRemote } from '../../lib/action_creators/web'
import { buildSaveResponse } from '../support/store'

const defaultExtra = () => ({
  config: { baseUrl: 'https://example.com', maxPages: 20 },
  lastVisitController: { abort: () => {} },
})

const buildStore = (preloadedState) =>
  configureStore({
    preloadedState,
    reducer: { ...rootReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: defaultExtra() },
      }),
  })

const initialState = () => ({
  superglue: {
    currentPageKey: '/bar',
    csrfToken: 'token',
    assets: [],
  },
})

const successBody = () =>
  JSON.stringify(
    buildSaveResponse({
      data: { heading: 'Some heading' },
      componentIdentifier: 'about',
    })
  )

const staleAssetsBody = () =>
  JSON.stringify(
    buildSaveResponse({
      data: { heading: 'Some heading' },
      componentIdentifier: 'about',
      assets: ['app-NEW.js'],
    })
  )

// jsdom's window.location is non-configurable, so we can't intercept the
// `href` setter directly. We rely on the structural signal instead: when
// webVisit decides to redirect, it returns a never-settling promise. Racing
// against a short timeout lets us assert "the chain was terminated" without
// touching window.location at all.

afterEach(() => {
  fetchMock.restore()
  vi.restoreAllMocks()
})

describe('webVisit', () => {
  it('passes through a successful response as a Result with hasError: false', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
      body: successBody(),
      headers: { 'content-type': 'application/json' },
    })

    return webVisit(store, '/foo').then((result) => {
      expect(result.hasError).toBe(false)
      if (!result.hasError) {
        expect(result.pageKey).toEqual('/foo')
        expect(result.componentIdentifier).toEqual('about')
        expect(result.navigationAction).toBeDefined()
      }
    })
  })

  it('returns a never-settling promise when needsRefresh is true', async () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/bar',
        csrfToken: 'token',
        assets: ['app-OLD.js'],
      },
    })
    fetchMock.mock('https://example.com/foo?format=json', {
      body: staleAssetsBody(),
      headers: { 'content-type': 'application/json' },
    })

    const sentinel = Symbol('unsettled')
    const sleep = (ms) =>
      new Promise((resolve) => setTimeout(() => resolve(sentinel), ms))

    const winner = await Promise.race([webVisit(store, '/foo'), sleep(50)])

    expect(winner).toBe(sentinel)
  })

  it('resolves with hasError: true on a 5xx response (no rejection)', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
      body: '{}',
      status: 500,
    })

    return webVisit(store, '/foo').then((result) => {
      expect(result.hasError).toBe(true)
      if (result.hasError) {
        expect(result.response.status).toEqual(500)
      }
    })
  })

  it('rejects on a JSON parse failure (not converted to ErrorResult)', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '',
    })

    return webVisit(store, '/foo').then(
      () => {
        throw new Error('expected promise to reject')
      },
      (err) => {
        expect(err.message).toMatch(/Unexpected end of JSON input/)
      }
    )
  })
})

describe('webRemote', () => {
  it('passes through a successful response as a Result', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
      body: successBody(),
      headers: { 'content-type': 'application/json' },
    })

    return webRemote(store, '/foo').then((result) => {
      expect(result.hasError).toBe(false)
      if (!result.hasError) {
        expect(result.pageKey).toEqual('/foo')
      }
    })
  })

  it('settles even when needsRefresh is true (does not redirect)', async () => {
    const store = buildStore({
      superglue: {
        currentPageKey: '/bar',
        csrfToken: 'token',
        assets: ['app-OLD.js'],
      },
    })
    fetchMock.mock('https://example.com/foo?format=json', {
      body: staleAssetsBody(),
      headers: { 'content-type': 'application/json' },
    })

    // No race against a timeout; webRemote should resolve normally even
    // though the response carries needsRefresh: true.
    const result = await webRemote(store, '/foo')
    expect(result.hasError).toBe(false)
    if (!result.hasError) {
      expect(result.needsRefresh).toBe(true)
    }
  })

  it('resolves with hasError: true on a 5xx response', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
      body: '{}',
      status: 500,
    })

    return webRemote(store, '/foo').then((result) => {
      expect(result.hasError).toBe(true)
      if (result.hasError) {
        expect(result.response.status).toEqual(500)
      }
    })
  })

  it('rejects on a JSON parse failure', () => {
    const store = buildStore(initialState())
    fetchMock.mock('https://example.com/foo?format=json', {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '',
    })

    return webRemote(store, '/foo').then(
      () => {
        throw new Error('expected promise to reject')
      },
      (err) => {
        expect(err.message).toMatch(/Unexpected end of JSON input/)
      }
    )
  })
})
