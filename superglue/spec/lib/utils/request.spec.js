import { isValidResponse, argsForFetch } from '../../../lib/utils/request'
import parse from 'url-parse'
import Headers from 'fetch-headers'

describe('isValidResponse', () => {
  it('returns true if valid', () => {
    const headers = new Headers([
      ['content-type', 'application/json'],
      ['content-disposition', 'inline'],
    ])

    const rsp = {
      headers,
    }

    expect(isValidResponse(rsp)).toBe(true)
  })

  it('returns false when disposition is attachment', () => {
    const headers = new Headers([
      ['content-type', 'text/javascript'],
      ['content-disposition', 'attachment'],
    ])

    const rsp = {
      headers,
    }

    expect(isValidResponse(rsp)).toBe(false)
  })

  it('returns false when content-type is not javascript', () => {
    const headers = new Headers([
      ['content-type', 'text/html'],
      ['content-disposition', 'inline'],
    ])

    const rsp = {
      headers,
    }

    expect(isValidResponse(rsp)).toBe(false)
  })
})

describe('argsForFetch', () => {
  it('returns fetch arguments', () => {
    const getState = () => {
      return {
        superglue: {},
      }
    }

    const args = argsForFetch(getState, '/foo')

    expect(args).toEqual([
      '/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': true,
        },
        credentials: 'same-origin',
        signal: undefined,
      },
    ])
  })

  it('returns fetch arguments with passed signal for aborts', () => {
    const getState = () => {
      return {
        superglue: {},
      }
    }

    const { signal } = new AbortController

    const args = argsForFetch(getState, '/foo', { signal })

    expect(args).toEqual([
      '/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': true,
        },
        signal,
        credentials: 'same-origin',
      },
    ])
  })


  it('returns fetch arguments with content-type json and method POST on non-GETs', () => {
    const getState = () => {
      return {
        superglue: {},
      }
    }

    const args = argsForFetch(getState, '/foo', { method: 'PUT' })

    expect(args).toEqual([
      '/foo?format=json',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': true,
          'content-type': 'application/json',
          'x-http-method-override': 'PUT',
        },
        signal: undefined,
        credentials: 'same-origin',
        body: '',
      },
    ])
  })

  it('returns fetch arguments referer when currentPageKey is set in state', () => {
    const getState = () => {
      return {
        superglue: {
          currentPageKey: '/some_current_url',
        },
      }
    }

    const args = argsForFetch(getState, '/foo')

    expect(args).toEqual([
      '/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': true,
        },
        signal: undefined,
        credentials: 'same-origin',
        referrer: '/some_current_url',
      },
    ])
  })

  it('returns fetch args and ignores body on GET or HEAD', () => {
    const getState = () => {
      return {
        superglue: {},
      }
    }

    expect(argsForFetch(getState, '/foo', { body: 'ignored' })).toEqual([
      '/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': true,
        },
        signal: undefined,
        credentials: 'same-origin',
      },
    ])

    expect(
      argsForFetch(getState, '/foo', { method: 'HEAD', body: 'ignored' })
    ).toEqual([
      '/foo?format=json',
      {
        method: 'HEAD',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': true,
        },
        signal: undefined,
        credentials: 'same-origin',
      },
    ])
  })
})
