import { describe, expect, it, beforeEach, vi } from 'vitest'
import { ApplicationBase } from '../../lib/index'
import Nav from '../../lib/components/Nav'
import fetchMock from 'fetch-mock'
import * as rsp from '../fixtures'
import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import React from 'react'
import { createMemoryHistory } from 'history'
import { config } from '../../lib/config'
import { visit, remote } from '../../lib/action_creators'
// import { mount } from 'enzyme'
import { thunk } from 'redux-thunk'
import 'regenerator-runtime/runtime'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const flushPromises = () => new Promise((res) => process.nextTick(res))

process.on('unhandledRejection', (r) => console.error(r))

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.visit = this.visit.bind(this)
  }

  visit() {
    this.props.visit('/foo').then(() => {
      this.props.navigateTo('/foo')
    })
  }

  render() {
    return (
      <div>
        <h1>Home Page, {this.props.heading}</h1>
        <button onClick={this.visit}> click </button>
      </div>
    )
  }
}

class About extends React.Component {
  render() {
    return <h1>About Page, {this.props.heading}</h1>
  }
}

class App extends ApplicationBase {
  visitAndRemote() {
    return {
      visit: (...args) => this.store.dispatch(visit(...args)),
      remote: (...args) => this.store.dispatch(remote(...args)),
    }
  }
  mapping() {
    return this.props.mapping
  }

  createHistory() {
    return this.props.history
  }

  buildStore(initialState, reducer) {
    const store = createStore(
      combineReducers(reducer),
      initialState,
      compose(applyMiddleware(thunk))
    )

    return store
  }
}

describe('start', () => {
  it('sets the stage', () => {
    const history = createMemoryHistory({
      initialEntries: ['/bar?some=123#title'],
      initialIndex: 0,
    })

    const initialPage = {
      data: {
        heading: 'this is page 1',
      },
      componentIdentifier: 'home',
      assets: ['123.js', '123.css'],
      fragments: [],
      csrfToken: 'token',
    }

    let instance

    render(
      <App
        initialPage={initialPage}
        ref={(node) => (instance = node)}
        baseUrl={'http://example.com/base'}
        path={'/bar?some=123#title'}
        appEl={document}
        mapping={{ home: Home, about: About }}
        history={history}
      />
    )
    const store = instance.store

    expect(store.getState()).toEqual({
      superglue: {
        currentPageKey: '/bar?some=123',
        pathname: '/bar',
        search: '?some=123',
        hash: '#title',
        csrfToken: 'token',
        assets: ['123.js', '123.css'],
      },
      pages: {
        '/bar?some=123': {
          pageKey: '/bar?some=123',
          fragments: [],
          data: {
            heading: 'this is page 1',
          },
          componentIdentifier: 'home',
          assets: ['123.js', '123.css'],
          fragments: [],
          csrfToken: 'token',
          savedAt: expect.any(Number),
        },
      },
    })
  })
})

fetchMock.mock()

describe('navigation', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    fetchMock.restore()
  })

  describe('when an action pushes history', () => {
    it('saves the page and updates history', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/bar'],
        initialIndex: 0,
      })

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      let instance

      render(
        <App
          initialPage={initialPage}
          ref={(node) => (instance = node)}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          history={history}
          mapping={{ home: Home, about: About }}
        />
      )
      const store = instance.store

      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?format=json', mockResponse)

      const pageState = {
        data: { heading: 'Visit Success Some heading 2' },
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/foo',
        fragments: [],
        savedAt: expect.any(Number),
      }

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      await flushPromises()

      expect(store.getState().pages['/foo']).toEqual(pageState)
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
    })

    it('saves the page and updates history with hash', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/bar'],
        initialIndex: 0,
      })

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      class ExampleHome extends Home {
        visit() {
          this.props
            .visit('/foo#title')
            .then(() => this.props.navigateTo('/foo#title'))
        }
      }

      let instance

      render(
        <App
          initialPage={initialPage}
          ref={(node) => (instance = node)}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          history={history}
          mapping={{ home: ExampleHome, about: About }}
        />
      )
      const store = instance.store

      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?format=json', mockResponse)

      const pageState = {
        data: { heading: 'Visit Success Some heading 2' },
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/foo',
        fragments: [],
        savedAt: expect.any(Number),
      }
      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      await flushPromises()

      const state = store.getState()
      expect(state.pages['/foo']).toEqual(pageState)
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('#title')
      expect(screen.getByRole('heading')).not.toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).toHaveTextContent('About Page')
    })

    describe('and the action is to a non-superglue app', () => {
      it('does nothing to the store', () =>
        new Promise((done) => {
          const history = createMemoryHistory({
            initialEntries: ['/bar'],
            initialIndex: 0,
          })

          history.listen(({ location }) => {
            const { pathname } = location

            if (pathname == '/some_html_page') {
              const state = store.getState()
              expect(state.superglue.currentPageKey).toEqual('/bar')
              done()
            }
          })

          const initialPage = {
            data: {
              heading: 'this is page 1',
            },
            componentIdentifier: 'home',
            assets: ['123.js', '123.css'],
            fragments: [],
            csrfToken: 'token',
            restoreStrategy: 'fromCacheOnly',
          }

          class ExampleHome extends Home {
            componentDidMount() {
              process.nextTick(() => history.push('/some_html_page'))
            }
          }

          let instance
          render(
            <App
              initialPage={initialPage}
              ref={(node) => (instance = node)}
              baseUrl={'http://example.com'}
              path={'/bar'}
              appEl={document}
              mapping={{ home: ExampleHome }}
              history={history}
            />
          )
          const store = instance.store

          expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
        }))
    })
  })

  describe('when an action replaces history', () => {
    it('removes the previous page in the store', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/bar'],
        initialIndex: 0,
      })

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      class ExampleHome extends Home {
        visit() {
          this.props.visit('/foo').then(() => {
            this.props.navigateTo('/foo', { action: 'replace' })
          })
        }
      }

      let instance
      render(
        <App
          initialPage={initialPage}
          ref={(node) => (instance = node)}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: ExampleHome, about: About }}
          history={history}
        />
      )
      const store = instance.store

      expect(screen.getByRole('heading')).not.toHaveTextContent('Visit Success')
      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?format=json', mockResponse)

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      await flushPromises()

      const state = store.getState()
      expect(Object.keys(state.pages)).toEqual(['/foo'])
      expect(state.superglue.currentPageKey).toEqual('/foo')
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
      expect(screen.getByRole('heading')).toHaveTextContent('Visit Success')
    })

    it('does nothing when we replace the same page', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/bar'],
        initialIndex: 0,
      })

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      class ExampleHome extends Home {
        visit() {
          this.props.navigateTo('/bar', { action: 'replace' })
        }
      }

      let instance
      render(
        <App
          initialPage={initialPage}
          ref={(node) => (instance = node)}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: ExampleHome }}
          history={history}
        />
      )
      const store = instance.store

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      await flushPromises()

      const state = store.getState()
      expect(Object.keys(state.pages)).toEqual(['/bar'])
      expect(state.superglue.currentPageKey).toEqual('/bar')
      expect(history.location.pathname).toEqual('/bar')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
    })
  })

  describe('when an action pops history', () => {
    it('loads the page from the store', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/bar'],
        initialIndex: 0,
      })

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
        restoreStrategy: 'fromCacheOnly',
      }

      let instance

      render(
        <App
          initialPage={initialPage}
          ref={(node) => (instance = node)}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: Home, about: About }}
          history={history}
        />
      )
      const store = instance.store

      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?format=json', mockResponse)

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      await flushPromises()
      let state = store.getState()
      expect(state.superglue.currentPageKey).toEqual('/foo')
      expect(history.location.pathname).toEqual('/foo')
      expect(state.superglue.currentPageKey).toEqual('/foo')
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')

      history.back()

      state = store.getState()
      expect(state.superglue.currentPageKey).toEqual('/bar')
      expect(history.location.pathname).toEqual('/bar')
      expect(state.superglue.currentPageKey).toEqual('/bar')
      expect(history.location.pathname).toEqual('/bar')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
    })

    it('does not change current page when the hash changes', () =>
      new Promise((done) => {
        const history = createMemoryHistory({})
        history.push('/bar#title', {
          superglue: true,
          pageKey: '/bar',
        })
        history.push('/bar') // Gets replaced on Superglue.start
        let store

        history.listen(({ action, location }) => {
          const { pathname, hash } = location
          if (hash === '#title') {
            const state = store.getState()
            expect(state.superglue.currentPageKey).toEqual('/bar')
            expect(pathname).toEqual('/bar')
            expect(hash).toEqual('#title')
            done()
          }
        })

        const initialPage = {
          data: {
            heading: 'this is page 1',
          },
          componentIdentifier: 'home',
          assets: ['123.js', '123.css'],
          fragments: [],
          csrfToken: 'token',
          restoreStrategy: 'fromCacheOnly',
        }

        class ExampleHome extends Home {
          componentDidMount() {
            process.nextTick(() => history.back())
          }
        }

        let instance

        render(
          <App
            initialPage={initialPage}
            ref={(node) => (instance = node)}
            baseUrl={'http://example.com'}
            path={'/bar'}
            appEl={document}
            mapping={{ home: ExampleHome }}
            history={history}
          />
        )

        store = instance.store
      }))

    it('requests the evicted page when encountering the page again using browser buttons', async () => {
      const history = createMemoryHistory({})
      history.push('/foo', {
        superglue: true,
        pageKey: '/foo',
      })
      history.push('/bar') // Gets replaced on Superglue.start
      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?format=json', mockResponse)

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      let instance
      render(
        <App
          initialPage={initialPage}
          ref={(node) => (instance = node)}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: Home, about: About }}
          history={history}
        />
      )
      const store = instance.store

      const pageState = {
        data: { heading: 'Visit Success Some heading 2' },
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/foo',
        fragments: [],
        savedAt: expect.any(Number),
      }

      history.back()
      // component.find('button').simulate('click')

      await flushPromises()

      expect(store.getState().pages['/foo']).toEqual(pageState)
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
    })
  })

  describe('when an action results in a graft', () => {
    it('grafts the node', async () => {
      let history = createMemoryHistory({})

      let initialPage = {
        data: {
          heading: 'this is page 1',
          address: undefined,
        },
        fragments: [],
        componentIdentifier: 'home',
      }

      class ExampleHome extends Home {
        visit() {
          this.props.remote('/foo?props_at=address')
        }
      }

      let instance

      render(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          ref={(node) => (instance = node)}
          path={'/foo'}
          appEl={document}
          mapping={{ home: ExampleHome }}
          history={history}
        />
      )
      const store = instance.store

      const mockResponse = rsp.graftSuccessWithNewZip()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock(
        'http://example.com/foo?props_at=address&format=json',
        mockResponse
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      await flushPromises()

      const state = store.getState()
      expect(state.pages['/foo'].data.address).toEqual({
        zip: 91210,
      })
    })
  })
})
