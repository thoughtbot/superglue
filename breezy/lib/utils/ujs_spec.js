import { HandlerBuilder } from './ujs'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import React from 'react'
import { JSDOM } from 'jsdom'
import { render } from 'react-dom'
import * as helpers from './helpers'

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
          if(attr === 'data-remote') {
            return true
          }
        }
      }
    }
  }

  describe('onClick', () => {
    it('calls visit on a valid link', () => {
      const ujsVisitAttribute = 'data-remote'
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }
      const store = {}

      const builder = new HandlerBuilder({
        ujsVisitAttribute,
        store,
        navigatorRef
      })

      spyOn(builder, 'visit')

      const {onClick} = builder.handlers()
      onClick(createFakeEvent())

      expect(builder.visit).toHaveBeenCalledWith('/foo', {})
    })

    it('does not call visit on an link does not have the visit attribute data-remote', () => {
      const store = {}
      const ujsVisitAttribute = 'data-remote'
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsVisitAttribute,
        store,
        navigatorRef
      })
      spyOn(builder, 'visit')
      const fakeEvent = createFakeEvent()
      fakeEvent.target.getAttribute = (attr) => {
        if(attr === 'href') {
          return '/foo'
        }
      }

      const {onClick} = builder.handlers()
      onClick(fakeEvent)

      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {})
    })

    it('does not call visit on an non-standard link', () => {
      const store = {}
      const ujsVisitAttribute = 'data-remote'
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsVisitAttribute,
        store,
        navigatorRef
      })
      spyOn(builder, 'visit')

      const {onClick} = builder.handlers()

      let fakeEvent = createFakeEvent()
      fakeEvent.which = 2
      onClick(fakeEvent)
      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.metaKey = 1
      onClick(fakeEvent)
      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.metaKey = 1
      onClick(fakeEvent)
      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.ctrlKey= 1
      onClick(fakeEvent)
      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.shiftKey= 1
      onClick(fakeEvent)
      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      fakeEvent.altKey= 1
      onClick(fakeEvent)
      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {})

      fakeEvent = createFakeEvent()
      onClick(fakeEvent)
      expect(builder.visit).toHaveBeenCalledWith('/foo', {})
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
            if(attr === 'data-remote') {
              return true
            }
          }
        }
      }
    }

    it('succssfully posts a form', () => {
      const store = {}
      const ujsVisitAttribute = 'data-remote'
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsVisitAttribute,
        store,
        navigatorRef
      })
      spyOn(builder, 'visit')
      global.FormData = () => {}
      spyOn(global, 'FormData').and.returnValue({some: 'Body'})

      const {onSubmit} = builder.handlers()
      const fakeFormEvent = createFakeFormEvent()
      onSubmit(fakeFormEvent)

      expect(global.FormData).toHaveBeenCalledWith(fakeFormEvent.target)
      expect(builder.visit).toHaveBeenCalledWith('/foo', {
        method: 'POST',
        headers: {
          "content-type": null,
        },
        body: {some: 'Body'}
      })
    })

    it('does not posts a form without a visit attribute', () => {
      const store = {}
      const ujsVisitAttribute = 'data-remote'
      const navigatorRef = {
        current: {
          navigateTo: () => {}
        }
      }

      const builder = new HandlerBuilder({
        ujsVisitAttribute,
        store,
        navigatorRef
      })
      spyOn(builder, 'visit')
      global.FormData = () => {}
      spyOn(global, 'FormData').and.returnValue({some: 'Body'})

      const {onSubmit} = builder.handlers()
      const fakeFormEvent = createFakeFormEvent()
      fakeFormEvent.target.getAttribute = (attr) => {
        if(attr === 'action') {
          return '/foo'
        }
        if(attr === 'method') {
          return 'POST'
        }
        if(attr === 'data-remote') {
          return false
        }
      }
      onSubmit(fakeFormEvent)

      expect(builder.visit).not.toHaveBeenCalledWith('/foo', {
        method: 'POST',
        body: {some: 'Body'}
      })
    })
  })
})
