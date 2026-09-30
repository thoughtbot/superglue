import { describe, it, expectTypeOf } from 'vitest'
import { useContent, ValidationResult } from '../../lib'

// Type-only checks: vitest's typecheck runs `tsc` over these files and never
// executes them, so calling the hook outside a component is fine here.

type PageProps = { greeting: string }

const validate = (): ValidationResult => ({
  success: true,
  errors: [],
})

describe('useContent', () => {
  it('returns T for the current page', () => {
    expectTypeOf(useContent<PageProps>()).toEqualTypeOf<PageProps>()
  })

  it('accepts a validator for the current page and returns T', () => {
    expectTypeOf(
      useContent<PageProps>(undefined, validate)
    ).toEqualTypeOf<PageProps>()
  })

  it('returns T | undefined for a page key', () => {
    expectTypeOf(useContent<PageProps>('/posts')).toEqualTypeOf<
      PageProps | undefined
    >()
  })

  it('accepts a validator with a page key', () => {
    expectTypeOf(useContent<PageProps>('/posts', validate)).toEqualTypeOf<
      PageProps | undefined
    >()
  })

  it('rejects a validator that is not a function', () => {
    // @ts-expect-error the validator must be a function
    useContent<PageProps>(undefined, 'not a function')
  })

  it('rejects a validator with the wrong result shape', () => {
    // @ts-expect-error the validator must return a ValidationResult
    useContent<PageProps>(undefined, () => true)
  })
})
