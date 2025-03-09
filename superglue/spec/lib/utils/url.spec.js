import { describe, it, expect } from 'vitest'
import {
  withoutHash,
  removePropsAt,
  pathQuery,
  pathQueryHash,
  hasPropsAt,
} from '../../../lib/utils/url'

describe('.withoutHash', () => {
  it('take a path and removes the hash', () => {
    const url = withoutHash('/hello#abc')

    expect(url).toEqual('/hello')
  })

  it('takes a blank and returns a slash', () => {
    const url = withoutHash('')

    expect(url).toEqual('/')
  })
})

describe('.removePropsAt', () => {
  it('take a path and removes the props_at param', () => {
    const url = removePropsAt('/posts?a=1&props_at=hello')

    expect(url).toEqual('/posts?a=1')
  })

  it('take a blank url and returns blank', () => {
    const url = removePropsAt('')

    expect(url).toEqual('/')
  })
})

describe('.pathQuery', () => {
  it('take a url and returns a url with a query and pathname only', () => {
    const url = pathQuery('http://www.github.com/path?props_at=hello#fooo')

    expect(url).toEqual('/path?props_at=hello')
  })

  it('take a blank url and returns a slash', () => {
    const url = pathQuery('')

    expect(url).toEqual('/')
  })
})

describe('.pathQueryHash', () => {
  it('take a url and returns a url with a query, pathname, and hash only', () => {
    const url = pathQueryHash('http://www.github.com?props_at=hello#fooo')

    expect(url).toEqual('/?props_at=hello#fooo')
  })

  it('take a blank url and returns a slash', () => {
    const url = pathQueryHash('')

    expect(url).toEqual('/')
  })
})

describe('hasPropsAt', () => {
  it('takes a url and returns true if props_at is a param', () => {
    const props_at = hasPropsAt('http://www.github.com?props_at=hello')

    expect(props_at).toEqual(true)
  })

  it('takes a url and returns false if props_at is not a param', () => {
    let props_at = hasPropsAt('http://www.github.com')
    expect(props_at).toEqual(false)

    props_at = hasPropsAt('')
    expect(props_at).toEqual(false)
  })
})
