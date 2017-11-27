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
        <a href='/test' data-bz-dispatch='visit'></a>
      `)
      expect(isValid(target)).toBe(true)

      target = createTarget(`
        <a href='/test' data-bz-dispatch='visit'></a>
      `)
      expect(isValid(target)).toBe(true)
    })

    it('returns false with an invalid link (missing data-bz-dispatch)', () => {
      let target = createTarget(`
        <a href="/test"></a>
      `)
      expect(isValid(target)).toBe(false)

      target = createTarget(`
        <a href="/test" data-bz-flow='foobar'></a>
      `)
      expect(isValid(target)).toBe(false)
    })

    it('returns false when dispatch is empty', () => {
      let target = createTarget(`
        <a href="/test" data-bz-dispatch></a>
      `)
      expect(isValid(target)).toBe(false)
    })

    it('returns true with a valid form', () => {
      let target = createTarget(`
        <form data-bz-dispatch='visit' method='post' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(isValid(target)).toBe(true)
    })

    it('returns false with a invalid form (missing bz-dispatch)', () => {
      let target = createTarget(`
        <form method='post' action='/'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(isValid(target)).toBe(false)
    })
  })


  describe('getRequestMethod', () => {
    it('returns GET link with bz-method set to nothing', () => {
      let target = createTarget(`
        <a href="/test" data-bz-dispatch='visit'></a>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })

    it('returns a VERB link with bz-remote/visit set to a valid verb', () => {
      let target = createTarget(`
        <a href="/test" data-bz-dispatch='visit' data-bz-method='post'></a>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('returns GET link with bz-remote set to an invalid verb', () => {
      let target = createTarget(`
        <a href="/test" data-bz-dispatch=visit data-bz-method=invalid></a>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })

    it('returns the form method by default', () => {
      let target = createTarget(`
        <form data-bz-dispatch=visit method='post'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('uses the data-bz-remote/visit when method is not set', () => {
      let target = createTarget(`
        <form data-bz-dispatch='visit'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('is set to data-bz-method even if method is set', () => {
      let target = createTarget(`
      <form data-bz-dispatch=visit data-bz-method='get' method='post'>
        <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
      </form>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })

    it('is set to POST when method is not set and data-bz-method is present', () => {
      let target = createTarget(`
        <form data-bz-dispatch=visit>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('POST')
    })

    it('is set to data-bz-method when used with a value, and when method is not set', () => {
      let target = createTarget(`
        <form data-bz-dispatch='visit' data-bz-method='get'>
          <input type='file' name='foo'><input type='text' name='bar' value='fizzbuzz'>
        </form>
      `)
      expect(getRequestMethod(target)).toBe('GET')
    })
  })

  describe('getRequestMethodForFetch', () => {
    it('returns POST with bz-method set to non-GET', () => {
      let target = createTarget(`
        <a href="/test" data-bz-dispatch='visit' data-bz-method=put></a>
      `)
      expect(getRequestMethodForFetch(target)).toBe('POST')
    })

    it('returns GET with bz-remote set to GET', () => {
      let target = createTarget(`
        <a href="/test" data-bz-remote=get></a>
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
        <a data-bz-dispatch='visit' data-bz-method='POST'></a>
      `)

      spyOn(FormData.prototype, 'append')
      var payload = getPayloadForLink(target)

      expect(payload).toBeTruthy()
      expect(FormData.prototype.append).toHaveBeenCalledWith('_method', 'POST')
    })
  })

  describe('getContentType', () => {
    it('returns form-urlencoded if not a GET', () => {
      const target = createTarget(`
        <a data-bz-dispatch='visit' data-bz-method='put'></a>
      `)

      expect(getContentType(target)).toBe("application/x-www-form-urlencoded; charset=UTF-8")
    })

    it('returns undefined if GET', () => {
      const target = createTarget(`
        <a data-bz-dispatch data-bz-method='get'></a>
      `)

      expect(getContentType(target)).toBe(undefined)
    })
  })
})

