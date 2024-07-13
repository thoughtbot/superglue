import { describe, it, expect } from 'vitest'
import { mapStateToProps } from '../../../lib/utils/react'

describe('mapStateToToProps', () => {
  it('returns the state of the url and the csrfToken', () => {
    let slice = {
      pages: {
        '/foo': {
          data: { heading: 'hi' },
        },
      },
      superglue: {
        csrfToken: 'token123',
      },
    }

    let props = mapStateToProps(slice, { pageKey: '/foo' })
    expect(props).toEqual({
      heading: 'hi',
      pageKey: '/foo',
      csrfToken: 'token123',
    })
  })
})
