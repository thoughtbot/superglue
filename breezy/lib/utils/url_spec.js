import { withAntiCache, withMimeBust, withoutHash } from './url'
import parse from 'url-parse'

describe('.withAntiCache', () => {
  it('take a url and adds an cache busting param', () => {
    const url = withAntiCache('http://www.github.com')
    const url2 = withAntiCache('http://www.github.com')
    const urlHost = parse(url).host
    const urlHost2 = parse(url).host

    expect(url).not.toEqual(url2)
    expect(urlHost).toEqual(urlHost2)
  })
})

describe('.withMimeBust', () => {
  it('take a url and adds mime busting param, browsers will cache same urls even if mime type is different', () => {
    const url = withMimeBust('http://www.github.com')

    expect(url).toEqual('http://www.github.com?__=0')
  })
})

describe('.withoutHash', () => {
  it('take a url and removes the hash', () => {
    const url = withoutHash('http://www.github.com#abc')

    expect(url).toEqual('http://www.github.com')
  })
})
