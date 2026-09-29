import { ValidationResult } from '../types'

export class ContentValidationError extends Error {
  errors: unknown[]

  constructor(errors: unknown[]) {
    super(
      [
        '[Superglue] Content validation failed',
        ...errors.map(describeError),
      ].join('\n')
    )
    this.name = 'ContentValidationError'
    this.errors = errors
  }
}

export function raiseOnInvalidContent(result: ValidationResult): void {
  if (!result.success) {
    throw new ContentValidationError(result.errors)
  }
}

// Formats one validator error as a line. Handles the shapes produced by the
// typia plugin ({ path, expected, value }) and the deepkit plugin
// ({ path, message, value }); anything else is printed as JSON.
function describeError(error: unknown): string {
  const hasPath = typeof error === 'object' && error !== null && 'path' in error
  const isTypiaError = hasPath && 'expected' in error
  const isDeepkitError = hasPath && 'message' in error

  if (isTypiaError) {
    const { path, expected, value } = error as {
      path: string
      expected: string
      value?: unknown
    }
    return `  ${path}: expected ${expected}, got ${describeValue(value)}`
  } else if (isDeepkitError) {
    const { path, message } = error as { path: string; message: string }
    const got = 'value' in error ? `, got ${describeValue(error.value)}` : ''
    return `  ${path}: ${message}${got}`
  } else {
    return `  ${describeValue(error)}`
  }
}

function describeValue(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}
