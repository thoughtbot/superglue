import { JSDOM } from 'jsdom'
import { isValid } from './anchor_and_form'
import {
  getRequestMethod,
  getUrlForFetch,
  getRequestMethodForFetch,
  getFormData,
  getPayload,
  getPushState,
  getContentType,
  getPayloadForLink,
} from './anchor_and_form'
import FormData from 'form-data'

const createTarget = (html) => {
  const dom = new JSDOM(`<body>${html}</body>`)
  return dom.window.document.body.firstElementChild
}

describe('dom anchor and form helpers', () => {
  describe('isValid', () => {
    it('returns true with a valid link', () => {
      let target = createTarget(`
        <a href='/test' data-bz-remote='POST'></a>
      `)
      expect(isValid(target)).toBe(true)

      target = createTarget(`
        <a href='/test' data-bz-visit='POST'></a>
      `)
      expect(isValid(target)).toBe(true)
    })

    it('returns false with an invalid link (missing data-bz-remote)', () => {
      let target = createTarget(`
        <a href="/test"></a>
      `)
      expect(isValid(target)).toBe(false)

      target = createTarget(`
        <a href="/test" data-bz-flow='foobar'></a>
      `)
      expect(isValid(target)).toBe(false)
    })

    it('returns true with a valid link', () => {
      let target = createTarget(`
        <a href='/test' bz-remote='POST'></a>
      `)
      expect(isValid(target)).toBe(true)

      target = createTarget(`
        <a href='/test' bz-visit='POST'></a>
      `)
      expect(isValid(target)).toBe(true)
    })

    it('returns false when dispatch is empty', () => {
      let target = createTarget(`
        <a href="/test" data-bz-dispatch></a>
      `)
      expect(isValid(target)).toBe(false)
    })

    it('returns true when dispatch is used', () => {
      let target = createTarget(`
        <a href="/test" data-bz-dispatch='add_user'></a>
      `)
      expect(isValid(target)).toBe(true)
    })

    it('returns true with a valid form', () => {
      let target = createTarget(`
        <form data-bz-remote method='post' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(isValid(target)).toBe(true)

      target = createTarget(`
        <form data-bz-visit method='post' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(isValid(target)).toBe(true)
    })

    it('returns false with a invalid form (missing bz-remote or bz-visit)', () => {
      let target = createTarget(`
        <form method='post' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(isValid(target)).toBe(false)

      target = createTarget(`
        <form method='post' data-bz-flow='foobar' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(isValid(target)).toBe(false)
    })
  })


  describe('getRequestMethod', () => {
    it('returns GET link with bz-remote/visit set to nothing', () => {
      let target = createTarget(`
        <a href="/test" data-bz-remote></a>
      `)
      expect(getRequestMethod(target)).toBe('GET')

      target = createTarget(`
        <a href="/test" data-bz-visit></a>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })

    it('returns a VERB link with bz-remote/visit set to a valid verb', () => {
      let target = createTarget(`
        <a href="/test" data-bz-remote=post></a>
      `)
      expect(getRequestMethod(target)).toBe('POST')

      target = createTarget(`
        <a href="/test" data-bz-visit=post></a>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('returns GET link with bz-remote set to an invalid verb', () => {
      let target = createTarget(`
        <a href="/test" data-bz-remote=invalid></a>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })

    it('returns the form method by default', () => {
      let target = createTarget(`
        <form data-bz-remote method='post'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('uses the data-bz-remote/visit when method is not set', () => {
      let target = createTarget(`
        <form data-bz-remote>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('POST')

      target = createTarget(`
        <form data-bz-visit>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('is set to data-bz-remote even if method is set', () => {
      let target = createTarget(`
      <form data-bz-remote='get' method='post'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })

    it('is set to POST when method is not set and data-bz-remote is present', () => {
      let target = createTarget(`
        <form data-bz-remote>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('is set to data-bz-remote/visit when used with a value, and when method is not set', () => {
      let target = createTarget(`
        <form data-bz-remote='get'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('GET')

      target = createTarget(`
        <form data-bz-visit='get'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })
  })

  describe('getRequestMethodForFetch', () => {
    it('returns POST with bz-remote/visit set to non-GET', () => {
      let target = createTarget(`
        <a href="/test" data-bz-remote=put></a>
      `)
      expect(getRequestMethodForFetch(target)).toBe('POST')

      target = createTarget(`
        <a href="/test" data-bz-visit='put'></a>
      `)
      expect(getRequestMethodForFetch(target)).toBe('POST')
    })

    it('returns GET with bz-remote/visit set to GET', () => {
      let target = createTarget(`
        <a href="/test" data-bz-remote=get></a>
      `)
      expect(getRequestMethodForFetch(target)).toBe('GET')

      target = createTarget(`
        <a href="/test" data-bz-visit='get'></a>
      `)
      expect(getRequestMethodForFetch(target)).toBe('GET')
    })
  })

  describe('getUrlForFetch', () => {
    it('returns the url unchanged on forms', () => {
      const target = createTarget(`
        <form action='/some_action'>
        </form>
      `)
      expect(getUrlForFetch(target)).toBe('/some_action')
    })

    it('returns the original url on GET', () => {
      const target = createTarget(`
        <a href='/some_action' data-bz-remote=get>
        </a >
      `)
      expect(getUrlForFetch(target)).toBe('/some_action')
    })
  })

  describe('getPayload', () => {
    it('returns undefined on non Forms', () => {
      const target = createTarget(`
        <a></a>
      `)
      expect(getPayload(target)).toBe(undefined)
    })

    it('captures input fields', () => {
      const target = createTarget(`
        <form data-bz-remote method='post' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      spyOn(FormData.prototype, 'append')
      var payload = getPayload(target)

      expect(payload).toBeTruthy()
      expect(FormData.prototype.append).toHaveBeenCalledWith('bar', 'fizzbuzz')
    })

    it('will not capture input fields marked with bz-noserialize', () => {
      const target = createTarget(`
        <form data-bz-remote method='post' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz' bz-noserialize>
        </form>
      `)
      spyOn(FormData.prototype, 'append')
      var payload = getPayload(target)

      expect(payload).toBeTruthy()
      expect(FormData.prototype.append).not.toHaveBeenCalledWith('bar', 'fizzbuzz')
    })

  })

  describe('getPayloadForLink', () => {
    it('creates a form payload with _method', () => {
      const target = createTarget(`
        <a data-bz-remote='POST'></a>
      `)

      spyOn(FormData.prototype, 'append')
      var payload = getPayloadForLink(target)

      expect(payload).toBeTruthy()
      expect(FormData.prototype.append).toHaveBeenCalledWith('_method', 'POST')
    })
  })

  describe('getPushState', () => {
    it('returns true if bz-visit', () => {
      const target = createTarget(`
        <a data-bz-visit></a>
      `)

      expect(getPushState(target)).toBe(true)
    })

    it('returns false if bz-remote', () => {
      const target = createTarget(`
        <a data-bz-remote></a>
      `)

      expect(getPushState(target)).toBe(false)
    })
  })
  
  describe('getContentType', () => {
    it('returns form-urlencoded if not a GET', () => {
      const target = createTarget(`
        <a data-bz-visit='put'></a>
      `)

      expect(getContentType(target)).toBe("application/x-www-form-urlencoded; charset=UTF-8")
    })

    it('returns undefined if GET', () => {
      const target = createTarget(`
        <a data-bz-visit='get'></a>
      `)

      expect(getContentType(target)).toBe(undefined)
    })
  })
})

