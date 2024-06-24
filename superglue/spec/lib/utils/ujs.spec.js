import { HandlerBuilder } from '../../../lib/utils/ujs'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import React from 'react'
import { JSDOM } from 'jsdom'
import { render } from 'react-dom'
import * as helpers from '../../../lib/utils/helpers'

describe('ujs', () => {
  function createFakeEvent() {
    return {
      preventDefault: () => {},
      target: {
        nodeName: 'A',
        parentNode: 'DIV',
        href: '/foo',
        getAttribute: (attr) => {
          if(attr === 'href') {
            return '/foo'
          }
          if(attr === 'data-visit') {
            return true
          }
        }
      }
    }
  }

  function createFakeVisitGraftEvent() {
    return {
      preventDefault: () => {},
      target: {
        nodeName: 'A',
        parentNode: 'DIV',
        href: '/foo',
        getAttribute: (attr) => {
          if(attr === 'href') {
            return '/foo?props_at=data.hello'
          }
          if(attr === 'data-placeholder') {
            return '/current'
          }
          if(attr === 'data-visit') {
            return true
          }
        }
      }
    }
  }

  function createFakeRemoteEvent() {
    return {
      preventDefault: () => {},
      target: {
        nodeName: 'A',
        parentNode: 'DIV',
        href: '/foo',
        getAttribute: (attr) => {
          if(attr === 'href') {
            return '/foo'
          }
          if(attr === 'data-remote') {
            return true
          }
        }
      }
    }
  }

  function createFakeReplaceEvent() {
    return {
      preventDefault: () => {},
      target: {
        nodeName: 'A',
        parentNode: 'DIV',
        href: '/foo',
        getAttribute: (attr) => {
          if(attr === 'href') {
            return '/foo'
          }
          if(attr === 'data-replace') {
            return true
          }
        }
      }
    }
  }

  describe('onClick', () => {
    it('calls visit on a valid link', () => {
      const ujsAttributePrefix = 'data'
      const visit = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }
      const store = {}

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
        navigatorRef
      })

      const {onClick} = builder.handlers()
      onClick(createFakeEvent())

      expect(visit).toHaveBeenCalledWith('/foo', {method: 'GET', suggestedAction: 'push'})
    })

    it('calls visit with a placeholder when props_at is present on a valid link', () => {
      const ujsAttributePrefix = 'data'
      const visit = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }
      const store = {
        getState: () => {
          return {
            superglue: {
              currentPageKey: '/current'
            }
          }
        }
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
        navigatorRef
      })

      const {onClick} = builder.handlers()
      onClick(createFakeVisitGraftEvent())

      expect(visit).toHaveBeenCalledWith('/foo?props_at=data.hello', {
        method: 'GET',
        placeholderKey: '/current',
        suggestedAction: 'push',
      })
    })

    it('calls remote if a link is enabled with remote', () => {
      const ujsAttributePrefix = 'data'
      const remote = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }
      const store = {}

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        remote,
        navigatorRef
      })

      const {onClick} = builder.handlers()
      onClick(createFakeRemoteEvent())

      expect(remote).toHaveBeenCalledWith('/foo', {method: 'GET'})
    })

    it('does not call visit on a link that does not have the visit attribute data-visit', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
        navigatorRef
      })

      const fakeEvent = createFakeEvent()
      fakeEvent.target.getAttribute = (attr) => {
        if(attr === 'href') {
          return '/foo'
        }
      }

      const {onClick} = builder.handlers()
      onClick(fakeEvent)

      expect(visit).not.toHaveBeenCalledWith('/foo', {})
    })

    it('does not call visit on a non-standard link', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        visit,
        store,
        navigatorRef
      })

      const {onClick} = builder.handlers()

      let fakeEvent = createFakeEvent()
      fakeEvent.which = 2
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.metaKey = 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.metaKey = 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.ctrlKey= 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.shiftKey= 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.altKey= 1
      onClick(fakeEvent)
      expect(visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      onClick(fakeEvent)
      expect(visit).toHaveBeenCalledWith('/foo', {method: 'GET', suggestedAction: 'push'})
    })
  })

  describe('onSubmit', () => {
    function createFakeFormEvent() {
      return {
        preventDefault: () => {},
        target: {
          nodeName: 'FORM',
          href: '/foo',
          getAttribute: (attr) => {
            if(attr === 'action') {
              return '/foo'
            }
            if(attr === 'method') {
              return 'POST'
            }
            if(attr === 'data-visit') {
              return true
            }
          }
        }
      }
    }

    function createFakeRemoteFormEvent() {
      return {
        preventDefault: () => {},
        target: {
          nodeName: 'FORM',
          href: '/foo',
          getAttribute: (attr) => {
            if(attr === 'action') {
              return '/foo'
            }
            if(attr === 'method') {
              return 'POST'
            }
            if(attr === 'data-remote') {
              return true
            }
          }
        }
      }
    }

    it('successfully posts a form with a visit attribute', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        visit,
        store,
        navigatorRef
      })
      global.FormData = () => {}
      jest.spyOn(global, 'FormData').mockImplementation(() => ({some: 'Body'}))

      const {onSubmit} = builder.handlers()
      const fakeFormEvent = createFakeFormEvent()
      onSubmit(fakeFormEvent)

      expect(global.FormData).toHaveBeenCalledWith(fakeFormEvent.target)
      expect(visit).toHaveBeenCalledWith('/foo', {
        method: 'POST',
        headers: {
          "content-type": null,
        },
        suggestedAction: 'push',
        body: {some: 'Body'}
      })
    })

    it('successfully posts a form with a remote attribute', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const remote = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        remote,
        navigatorRef
      })
      global.FormData = () => {}
      jest.spyOn(global, 'FormData').mockImplementation(() => ({some: 'Body'}))

      const {onSubmit} = builder.handlers()
      const fakeFormEvent = createFakeRemoteFormEvent()
      onSubmit(fakeFormEvent)

      expect(global.FormData).toHaveBeenCalledWith(fakeFormEvent.target)
      expect(remote).toHaveBeenCalledWith('/foo', {
        method: 'POST',
        headers: {
          "content-type": null,
        },
        body: {some: 'Body'}
      })
    })

    it('does not post a form without a visit attribute', () => {
      const store = {}
      const ujsAttributePrefix = 'data'
      const visit = jest.fn()
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsAttributePrefix,
        store,
        visit,
        navigatorRef
      })
      global.FormData = () => {}
      jest.spyOn(global, 'FormData').mockImplementation(() => ({some: 'Body'}))

      const {onSubmit} = builder.handlers()
      const fakeFormEvent = createFakeFormEvent()
      fakeFormEvent.target.getAttribute = (attr) => {
        if(attr === 'action') {
          return '/foo'
        }
        if(attr === 'method') {
          return 'POST'
        }
        if(attr === 'data-visit') {
          return false
        }
      }
      onSubmit(fakeFormEvent)

      expect(visit).not.toHaveBeenCalledWith('/foo', {
        method: 'POST',
        body: {some: 'Body'}
      })
    })
  })
})
