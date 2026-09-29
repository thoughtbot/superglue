import { describe, it, expect } from 'vitest'
import {
  ContentValidationError,
  raiseOnInvalidContent,
} from '../../../lib/utils/validation'

describe('raiseOnInvalidContent', () => {
  it('does nothing when validation succeeds', () => {
    expect(() =>
      raiseOnInvalidContent({ success: true, errors: [] })
    ).not.toThrow()
  })

  it('throws ContentValidationError when validation fails', () => {
    const errors = [{ path: '$input.greeting', expected: 'string', value: 1 }]

    expect(() => raiseOnInvalidContent({ success: false, errors })).toThrow(
      ContentValidationError
    )
  })
})

describe('ContentValidationError', () => {
  it('keeps the raw errors', () => {
    const errors = [{ path: '$input.greeting', expected: 'string', value: 1 }]
    const error = new ContentValidationError(errors)

    expect(error.name).toBe('ContentValidationError')
    expect(error.errors).toBe(errors)
  })

  it('formats typia errors', () => {
    const error = new ContentValidationError([
      { path: '$input.greeting', expected: 'string', value: 1 },
    ])

    expect(error.message).toBe(
      '[Superglue] Content validation failed\n' +
        '  $input.greeting: expected string, got 1'
    )
  })

  it('formats deepkit errors', () => {
    const error = new ContentValidationError([
      { path: 'greeting', message: 'Not a string', value: 1 },
    ])

    expect(error.message).toBe(
      '[Superglue] Content validation failed\n' +
        '  greeting: Not a string, got 1'
    )
  })

  it('formats deepkit errors without a value', () => {
    const error = new ContentValidationError([
      { path: 'greeting', message: 'Not a string' },
    ])

    expect(error.message).toBe(
      '[Superglue] Content validation failed\n  greeting: Not a string'
    )
  })

  it('formats unknown error shapes as JSON', () => {
    const error = new ContentValidationError([{ reason: 'bad' }])

    expect(error.message).toBe(
      '[Superglue] Content validation failed\n  {"reason":"bad"}'
    )
  })
})
