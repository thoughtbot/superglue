import {
  withoutHash,
  removePropsAt,
  pathQuery,
  pathQueryHash,
  hasPropsAt,
} from '../../../lib/utils/url'
import parse from 'url-parse'

describe('.withoutHash', () => {
  it('take a url and removes the hash', () => {
    const url = withoutHash('http://www.github.com#abc')

    expect(url).toEqual('http://www.github.com/')
  })

  it('takes a blank and returns blank', () => {
    const url = withoutHash('http://www.github.com#abc')

    expect(url).toEqual('http://www.github.com/')
  })
})

describe('.removePropsAt', () => {
  it('take a url and removes the props_at param', () => {
    const url = removePropsAt('http://www.github.com?props_at=hello')

    expect(url).toEqual('http://www.github.com/')
  })

  it('take a blank url and returns blank', () => {
    const url = removePropsAt('')

    expect(url).toEqual('')
  })
})

describe('.pathQuery', () => {
  it('take a url and returns a url with a query and pathname only', () => {
    const url = pathQuery('http://www.github.com/path?props_at=hello#fooo')

    expect(url).toEqual('/path?props_at=hello')
  })

  it('take a blank url and returns blank', () => {
    const url = pathQuery('')

    expect(url).toEqual('')
  })
})

describe('.pathQueryHash', () => {
  it('take a url and returns a url with a query, pathname, and hash only', () => {
    const url = pathQueryHash('http://www.github.com?props_at=hello#fooo')

    expect(url).toEqual('/?props_at=hello#fooo')
  })

  it('take a blank url and returns blank', () => {
    const url = pathQueryHash('')

    expect(url).toEqual('')
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
