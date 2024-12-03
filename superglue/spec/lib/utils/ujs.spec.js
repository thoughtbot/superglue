import { describe, it, expect, vi } from 'vitest'
import { HandlerBuilder } from '../../../lib/utils/ujs'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import React from 'react'
import { JSDOM } from 'jsdom'
import { render } from 'react-dom'
import * as helpers from '../../../lib/utils/helpers'

describe('ujs', () => {
  function createFakeLinkTarget(attrs = {}) {
    const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost/',
    })
    global.Element = jsdom.window.Element
    const { document } = jsdom.window

    const parentNode = document.createElement('DIV')
    const link = document.createElement('A')

    parentNode.appendChild(link)
    link.href = '/foo'
    for (const key in attrs) {
      link.setAttribute(key, attrs[key])
    }
    return link
  }

  function createFakeEvent(attrs = {}) {
    return {
      preventDefault: () => {},
      target: createFakeLinkTarget({
        href: '/foo',
        'data-visit': true,
        ...attrs,
      }),
    }
  }

  function createFakeVisitGraftEvent() {
    return {
      preventDefault: () => {},
      target: createFakeLinkTarget({
        href: '/foo?props_at=data.hello',
        'data-visit': 'true',
      }),
    }
  }

  function createFakeRemoteEvent(attrs = {}) {
    return {
      preventDefault: () => {},
      target: createFakeLinkTarget({
        href: '/foo',
        'data-remote': 'true',
        ...attrs,
      }),
    }
  }

  describe('onClick', () => {
    it('calls visit on a valid link', () => {
      const ujsAttributePrefix = 'data'
      const visit = vi.fn()
      const store = {}

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
      })

      const fakeEvent = createFakeEvent()
      const { onClick } = builder.handlers()
      onClick(fakeEvent)

      expect(visit).toHaveBeenCalledWith('/foo', {
        method: 'GET',
        dataset: { visit: 'true' },
      })
    })

    it('calls visit with the dataset of the element', () => {
      const ujsAttributePrefix = 'data'
      const visit = vi.fn()
      const store = {}

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
      })

      const fakeEvent = createFakeEvent({ 'data-abc-unrelated': 'hello' })
      const { onClick } = builder.handlers()
      onClick(fakeEvent)

      expect(visit).toHaveBeenCalledWith('/foo', {
        method: 'GET',
        dataset: { visit: 'true', abcUnrelated: 'hello' },
      })
    })

    it('calls remote if a link is enabled with remote', () => {
      const ujsAttributePrefix = 'data'
      const remote = vi.fn()
      const store = {
        getState: () => {
          return {
            superglue: {
              currentPageKey: '/current',
            },
          }
        },
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        remote,
      })

      const { onClick } = builder.handlers()
      onClick(createFakeRemoteEvent())

      expect(remote).toHaveBeenCalledWith('/foo', {
        method: 'GET',
        pageKey: '/current',
        dataset: { remote: 'true' },
      })
    })

    it('calls remote with the datasest of the element', () => {
      const ujsAttributePrefix = 'data'
      const remote = vi.fn()
      const store = {
        getState: () => {
          return {
            superglue: {
              currentPageKey: '/current',
            },
          }
        },
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        remote,
      })

      const { onClick } = builder.handlers()
      onClick(createFakeRemoteEvent({ 'data-abc-unrelated': '123' }))

      expect(remote).toHaveBeenCalledWith('/foo', {
        method: 'GET',
        pageKey: '/current',
        dataset: { remote: 'true', abcUnrelated: '123' },
      })
    })

    it('does not call visit on an link does not have the visit attribute data-visit', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = vi.fn()

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
      })

      const fakeEvent = createFakeEvent()
      fakeEvent.target.getAttribute = (attr) => {
        if (attr === 'href') {
          return '/foo'
        }
      }

      const { onClick } = builder.handlers()
      onClick(fakeEvent)

      expect(visit).not.toHaveBeenCalledWith('/foo', {
        dataset: { visit: 'true' },
      })
    })

    it('does not call visit on an non-standard link', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = vi.fn()

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        visit,
        store,
      })

      const { onClick } = builder.handlers()

      let fakeEvent = createFakeEvent()
      fakeEvent.which = 2
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {
        dataset: { visit: 'true' },
      })

      fakeEvent = createFakeEvent()
      fakeEvent.metaKey = 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {
        dataset: { visit: 'true' },
      })

      fakeEvent = createFakeEvent()
      fakeEvent.metaKey = 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {
        dataset: { visit: 'true' },
      })

      fakeEvent = createFakeEvent()
      fakeEvent.ctrlKey = 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {
        dataset: { visit: 'true' },
      })

      fakeEvent = createFakeEvent()
      fakeEvent.shiftKey = 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {
        dataset: { visit: 'true' },
      })

      fakeEvent = createFakeEvent()
      fakeEvent.altKey = 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {
        dataset: { visit: 'true' },
      })

      fakeEvent = createFakeEvent()
      onClick(fakeEvent)
      expect(visit).toHaveBeenCalledWith('/foo', {
        method: 'GET',
        dataset: { visit: 'true' },
      })
    })
  })

  describe('onSubmit', () => {
    function createFakeFormTarget(attrs = {}) {
      const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost/',
      })
      global.HTMLFormElement = jsdom.window.HTMLFormElement
      const { document } = jsdom.window

      const parentNode = document.createElement('DIV')
      const form = document.createElement('FORM')

      parentNode.appendChild(form)
      form.action = '/foo'
      for (const key in attrs) {
        form.setAttribute(key, attrs[key])
      }
      return form
    }

    function createFakeFormEvent() {
      return {
        preventDefault: () => {},
        target: createFakeFormTarget({
          action: '/foo',
          method: 'POST',
          'data-visit': 'true',
        }),
      }
    }

    function createFakeRemoteFormEvent() {
      return {
        preventDefault: () => {},
        target: createFakeFormTarget({
          action: '/foo',
          method: 'POST',
          'data-remote': 'true',
        }),
      }
    }

    it('succssfully posts a form with a visit attribute', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = vi.fn()

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        visit,
        store,
      })
      global.FormData = () => {}
      vi.spyOn(global, 'FormData').mockImplementation(() => ({ some: 'Body' }))

      const { onSubmit } = builder.handlers()
      const fakeFormEvent = createFakeFormEvent()
      onSubmit(fakeFormEvent)

      expect(global.FormData).toHaveBeenCalledWith(fakeFormEvent.target)
      expect(visit).toHaveBeenCalledWith('/foo', {
        method: 'POST',
        body: { some: 'Body' },
        dataset: { visit: 'true' },
      })
    })

    it('succssfully posts a form with a remote attribute', () => {
      const store = {
        getState: () => {
          return {
            superglue: {
              currentPageKey: '/current',
            },
          }
        },
      }
      const ujsAttributePrefix = 'data'
      const remote = vi.fn()

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        remote,
      })
      global.FormData = () => {}
      vi.spyOn(global, 'FormData').mockImplementation(() => ({ some: 'Body' }))

      const { onSubmit } = builder.handlers()
      const fakeFormEvent = createFakeRemoteFormEvent()
      onSubmit(fakeFormEvent)

      expect(global.FormData).toHaveBeenCalledWith(fakeFormEvent.target)
      expect(remote).toHaveBeenCalledWith('/foo', {
        method: 'POST',
        pageKey: '/current',
        body: { some: 'Body' },
        dataset: { remote: 'true' },
      })
    })

    it('does not posts a form without a visit attribute', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = vi.fn()

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
      })
      global.FormData = () => {}
      vi.spyOn(global, 'FormData').mockImplementation(() => ({ some: 'Body' }))

      const { onSubmit } = builder.handlers()
      const fakeFormEvent = createFakeFormEvent()
      fakeFormEvent.target.getAttribute = (attr) => {
        if (attr === 'action') {
          return '/foo'
        }
        if (attr === 'method') {
          return 'POST'
        }
        if (attr === 'data-visit') {
          return false
        }
      }
      onSubmit(fakeFormEvent)

      expect(visit).not.toHaveBeenCalledWith('/foo', {
        method: 'POST',
        body: { some: 'Body' },
      })
    })
  })
})
