import { ApplicationBase } from '../../lib/index'
import Nav from '../../lib/components/Nav'
import fetchMock from 'fetch-mock'
import * as rsp from '../fixtures'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import React from 'react'
import { createMemoryHistory } from 'history'
import { config } from '../../lib/config'
import { visit, remote } from '../../lib/action_creators'
import { mount } from 'enzyme'
import 'regenerator-runtime/runtime'

const flushPromises = () =>
  new Promise((res) => process.nextTick(res))

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
        Home Page, {this.props.heading}
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
      flash: {},
      componentIdentifier: 'home',
      assets: ['123.js', '123.css'],
      fragments: [],
      csrfToken: 'token',
    }

    const component = mount(
      <App
        initialPage={initialPage}
        baseUrl={'http://example.com/base'}
        path={'/bar?some=123#title'}
        appEl={document}
        mapping={{ home: Home, about: About }}
        history={history}
      />
    )
    const store = component.instance().store

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
          flash: {},
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
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
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
        flash: {},
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          history={history}
          mapping={{ home: Home, about: About }}
        />
      )
      const store = component.instance().store

      expect(component.find(Home).exists()).toBe(true)
      expect(component.find(About).exists()).toBe(false)

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?__=0', mockResponse)

      const pageState = {
        data: { heading: 'Some heading 2' },
        flash: {},
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/foo',
        fragments: [],
        savedAt: expect.any(Number),
      }

      component.find('button').simulate('click')

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
        flash: {},
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

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          history={history}
          mapping={{ home: ExampleHome, about: About }}
        />
      )
      const store = component.instance().store

      expect(component.find(ExampleHome).exists()).toBe(true)
      expect(component.find(About).exists()).toBe(false)

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?__=0', mockResponse)

      const pageState = {
        data: { heading: 'Some heading 2' },
        flash: {},
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/foo',
        fragments: [],
        savedAt: expect.any(Number),
      }
      component.find('button').simulate('click')

      await flushPromises()

      const state = store.getState()
      expect(state.pages['/foo']).toEqual(pageState)
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('#title')
    })

    describe('and the action is to a non-superglue app', () => {
      it('does nothing to the store', (done) => {
        const history = createMemoryHistory({
          initialEntries: ['/bar'],
          initialIndex: 0,
        })
        let navComponent

        history.listen(({ action, location }) => {
          const { pathname } = location

          if (pathname == '/some_html_page') {
            const state = store.getState()
            expect(state.superglue.currentPageKey).toEqual('/bar')
            expect(navComponent.state.pageKey).toEqual('/bar')
            done()
          }
        })

        const initialPage = {
          data: {
            heading: 'this is page 1',
          },
          flash: {},
          componentIdentifier: 'home',
          assets: ['123.js', '123.css'],
          fragments: [],
          csrfToken: 'token',
          restoreStrategy: 'fromCacheOnly'
        }

        class ExampleHome extends Home {
          componentDidMount() {
            process.nextTick(() => history.push('/some_html_page'))
          }
        }

        const component = mount(
          <App
            initialPage={initialPage}
            baseUrl={'http://example.com'}
            path={'/bar'}
            appEl={document}
            mapping={{ home: ExampleHome }}
            history={history}
          />
        )
        const store = component.instance().store
        navComponent = component.find(Nav).instance()

        expect(component.find(ExampleHome).exists()).toBe(true)
      })
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
        flash: {},
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

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: ExampleHome, about: About }}
          history={history}
        />
      )
      const store = component.instance().store
      const navComponent = component.find(Nav).instance()

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?__=0', mockResponse)

      component.find('button').simulate('click')
      await flushPromises()

      const state = store.getState()
      expect(Object.keys(state.pages)).toEqual(['/foo'])
      expect(state.superglue.currentPageKey).toEqual('/foo')
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
      expect(navComponent.state.pageKey).toEqual('/foo')
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
        flash: {},
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

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: ExampleHome}}
          history={history}
        />
      )
      const store = component.instance().store
      const navComponent = component.find(Nav).instance()

      component.find('button').simulate('click')
      await flushPromises()

      const state = store.getState()
      expect(Object.keys(state.pages)).toEqual(['/bar'])
      expect(state.superglue.currentPageKey).toEqual('/bar')
      expect(history.location.pathname).toEqual('/bar')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
      expect(navComponent.state.pageKey).toEqual('/bar')
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
        flash: {},
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
        restoreStrategy: 'fromCacheOnly'
      }

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home:Home, about: About}}
          history={history}
        />
      )
      const store = component.instance().store
      const navComponent = component.find(Nav).instance()

      expect(component.find(Home).exists()).toBe(true)
      expect(component.find(About).exists()).toBe(false)

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?__=0', mockResponse)

      component.find('button').simulate('click')

      await flushPromises()
      let state = store.getState()
      expect(state.superglue.currentPageKey).toEqual('/foo')
      expect(history.location.pathname).toEqual('/foo')
      expect(state.superglue.currentPageKey).toEqual('/foo')
      expect(history.location.pathname).toEqual('/foo')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
      expect(navComponent.state.pageKey).toEqual('/foo')

      history.back()

      state = store.getState()
      expect(state.superglue.currentPageKey).toEqual('/bar')
      expect(history.location.pathname).toEqual('/bar')
      expect(state.superglue.currentPageKey).toEqual('/bar')
      expect(history.location.pathname).toEqual('/bar')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
      expect(navComponent.state.pageKey).toEqual('/bar')
    })

    it('does not change current page when the hash changes', (done) => {
      const history = createMemoryHistory({})
      history.push("/bar#title", {
        superglue: true,
        pageKey: '/bar',
      })
      history.push("/bar") // Gets replaced on Superglue.start
      let store, navComponent;

      history.listen(({action, location}) => {
        const { pathname, hash } = location
        if (hash === '#title') {
          const state = store.getState()
          expect(state.superglue.currentPageKey).toEqual('/bar')
          expect(navComponent.state.pageKey).toEqual('/bar')
          expect(pathname).toEqual('/bar')
          expect(hash).toEqual('#title')
          done()
        }
      })

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        flash: {},
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
        restoreStrategy: 'fromCacheOnly'
      }

      class ExampleHome extends Home {
        componentDidMount() {
          process.nextTick(() => history.back())
        }
      }

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: ExampleHome }}
          history={history}
        />
      )

      store = component.instance().store
      navComponent = component.find(Nav).instance()
    })

    it('requests the evicted page when encountering the page again using browser buttons', async () => {
      const history = createMemoryHistory({})
      history.push('/foo', {
        superglue: true,
        pageKey: '/foo',
      })
      history.push('/bar') // Gets replaced on Superglue.start
      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?__=0', mockResponse)

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        flash: {},
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/bar'}
          appEl={document}
          mapping={{ home: Home, about: About}}
          history={history}
        />
      )
      const store = component.instance().store

      const pageState = {
        data: { heading: 'Some heading 2' },
        flash: {},
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
        flash: {},
        fragments: [],
        componentIdentifier: 'home',
      }

      class ExampleHome extends Home {
        visit() {
          this.props.remote('/foo?props_at=address')
        }
      }

      const component = mount(
        <App
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/foo'}
          appEl={document}
          mapping={{ home: ExampleHome}}
          history={history}
        />
      )
      const store = component.instance().store

      const mockResponse = rsp.graftSuccessWithNewZip()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('http://example.com/foo?props_at=address&__=0', mockResponse)

      component.find('button').simulate('click')
      await flushPromises()

      const state = store.getState()
      expect(state.pages['/foo'].data.address).toEqual({
        zip: 91210,
      })
    })
  })
})
