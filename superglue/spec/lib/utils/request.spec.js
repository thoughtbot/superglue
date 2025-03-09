import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import {
  isValidResponse,
  argsForFetch,
  handleServerErrors,
} from '../../../lib/utils/request'
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
      'https://example.com/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': 'true',
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

    const { signal } = new AbortController()

    const args = argsForFetch(getState, '/foo', { signal })

    expect(args).toEqual([
      'https://example.com/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': 'true',
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
      'https://example.com/foo?format=json',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': 'true',
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
      'https://example.com/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': 'true',
        },
        signal: undefined,
        credentials: 'same-origin',
        referrer: 'https://example.com/some_current_url',
      },
    ])
  })

  it('returns fetch args and ignores body on GET or HEAD', () => {
    const getState = () => {
      return {
        superglue: {},
      }
    }

    const args = argsForFetch(getState, '/foo', { body: 'ignored' })

    expect(args).toEqual([
      'https://example.com/foo?format=json',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': 'true',
        },
        signal: undefined,
        credentials: 'same-origin',
      },
    ])

    const args2 = argsForFetch(getState, '/foo', {
      method: 'HEAD',
      body: 'ignored',
    })

    expect(args2).toEqual([
      'https://example.com/foo?format=json',
      {
        method: 'HEAD',
        headers: {
          accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
          'x-superglue-request': 'true',
        },
        signal: undefined,
        credentials: 'same-origin',
      },
    ])
  })
})

describe('handleServerErrors', () => {
  let originalConsoleError

  beforeAll(() => {
    originalConsoleError = console.error
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  it('warns when 406 response code is received', () => {
    const headers = new Headers([['content-type', 'application/json']])

    const rsp = {
      ok: false,
      status: 406,
      statusText: 'Not Acceptable',
      headers,
    }

    expect(() => handleServerErrors({ rsp })).toThrowError('Not Acceptable')
    expect(console.error).toHaveBeenCalledWith(
      "Superglue encountered a 406 Not Acceptable response. This can happen if you used respond_to and didn't specify format.json in the block. Try adding it to your respond_to. For example:\n\n" +
        'respond_to do |format|\n' +
        '  format.html\n' +
        '  format.json\n' +
        '  format.csv\n' +
        'end'
    )
  })

  it('throws error for non-406 response codes', () => {
    const headers = new Headers([['content-type', 'application/json']])

    const rsp = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers,
    }

    expect(() => handleServerErrors({ rsp })).toThrowError(
      'Internal Server Error'
    )
  })

  it('does not throw error for ok response', () => {
    const headers = new Headers([['content-type', 'application/json']])

    const rsp = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers,
    }

    expect(() => handleServerErrors({ rsp })).not.toThrow()
  })
})
