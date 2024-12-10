import { describe, expect, it, beforeEach, vi } from 'vitest'
import { Application, rootReducer } from '../../lib/index'
import fetchMock from 'fetch-mock'
import * as rsp from '../fixtures'
import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import React, { forwardRef, useImperativeHandle } from 'react'
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
    this.props.visit('/about').then(() => {
      this.props.navigateTo('/about')
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

const buildVisitAndRemote = (navRef, store) => {
  return {
    visit: (...args) => store.dispatch(visit(...args)),
    remote: (...args) => store.dispatch(remote(...args)),
  }
}

const buildStore = (initialState, reducer) => {
  const store = createStore(
    combineReducers(reducer),
    initialState,
    compose(applyMiddleware(thunk))
  )

  return store
}

describe('start', () => {
  it('sets the stage', () => {
    const history = createMemoryHistory({
      initialEntries: ['/home?some=123#title'],
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

    const store = buildStore({}, rootReducer)

    render(
      <Application
        initialPage={initialPage}
        baseUrl={'http://example.com/base'}
        path={'/home?some=123#title'}
        appEl={document}
        mapping={{ home: Home, about: About }}
        history={history}
        store={store}
        buildVisitAndRemote={buildVisitAndRemote}
      />
    )

    expect(store.getState()).toEqual({
      superglue: {
        currentPageKey: '/home?some=123',
        pathname: '/home',
        search: '?some=123',
        hash: '#title',
        csrfToken: 'token',
        assets: ['123.js', '123.css'],
      },
      pages: {
        '/home?some=123': {
          pageKey: '/home?some=123',
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
        initialEntries: ['/home'],
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

      const store = buildStore({}, rootReducer)

      render(
        <Application
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/home'}
          appEl={document}
          history={history}
          mapping={{ home: Home, about: About }}
          store={store}
          buildVisitAndRemote={buildVisitAndRemote}
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/about'
      fetchMock.mock('http://example.com/about?format=json', mockResponse)

      const pageState = {
        data: { heading: 'Visit Success Some heading 2' },
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/about',
        fragments: [],
        savedAt: expect.any(Number),
      }

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      await flushPromises()

      expect(store.getState().pages['/about']).toEqual(pageState)
      expect(history.location.pathname).toEqual('/about')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
    })

    it('saves the page and updates history with hash', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/home'],
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
            .visit('/about#title')
            .then(() => this.props.navigateTo('/about#title'))
        }
      }

      const store = buildStore({}, rootReducer)

      render(
        <Application
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/home'}
          appEl={document}
          history={history}
          mapping={{ home: ExampleHome, about: About }}
          store={store}
          buildVisitAndRemote={buildVisitAndRemote}
        />
      )

      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/about'
      fetchMock.mock('http://example.com/about?format=json', mockResponse)

      const pageState = {
        data: { heading: 'Visit Success Some heading 2' },
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/about',
        fragments: [],
        savedAt: expect.any(Number),
      }
      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      await flushPromises()

      const state = store.getState()
      expect(state.pages['/about']).toEqual(pageState)
      expect(history.location.pathname).toEqual('/about')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('#title')
      expect(screen.getByRole('heading')).not.toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).toHaveTextContent('About Page')
    })

    describe('and the action is to a non-superglue app', () => {
      it('does nothing to the store', () =>
        new Promise((done) => {
          const history = createMemoryHistory({
            initialEntries: ['/home'],
            initialIndex: 0,
          })

          history.listen(({ location }) => {
            const { pathname } = location

            if (pathname == '/some_html_page') {
              const state = store.getState()
              expect(state.superglue.currentPageKey).toEqual('/home')
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

          const store = buildStore({}, rootReducer)
          render(
            <Application
              initialPage={initialPage}
              baseUrl={'http://example.com'}
              path={'/home'}
              appEl={document}
              mapping={{ home: ExampleHome }}
              history={history}
              store={store}
              buildVisitAndRemote={buildVisitAndRemote}
            />
          )

          expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
        }))
    })
  })

  describe('when an action replaces history', () => {
    it('removes the previous page in the store', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/home'],
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
          this.props.visit('/about').then(() => {
            this.props.navigateTo('/about', { action: 'replace' })
          })
        }
      }

      const store = buildStore({}, rootReducer)
      render(
        <Application
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/home'}
          appEl={document}
          mapping={{ home: ExampleHome, about: About }}
          history={history}
          store={store}
          buildVisitAndRemote={buildVisitAndRemote}
        />
      )
      
      expect(screen.getByRole('heading')).not.toHaveTextContent('Visit Success')
      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/about'
      fetchMock.mock('http://example.com/about?format=json', mockResponse)

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      await flushPromises()

      const state = store.getState()
      expect(Object.keys(state.pages)).toEqual(['/about'])
      expect(state.superglue.currentPageKey).toEqual('/about')
      expect(history.location.pathname).toEqual('/about')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
      expect(screen.getByRole('heading')).toHaveTextContent('Visit Success')
    })

    it('does nothing when we replace the same page', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/home'],
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
          this.props.navigateTo('/home', { action: 'replace' })
        }
      }
    
      const store = buildStore({}, rootReducer)

      render(
        <Application
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/home'}
          appEl={document}
          mapping={{ home: ExampleHome }}
          history={history}
          store={store}
          buildVisitAndRemote={buildVisitAndRemote}
        />
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      await flushPromises()

      const state = store.getState()
      expect(Object.keys(state.pages)).toEqual(['/home'])
      expect(state.superglue.currentPageKey).toEqual('/home')
      expect(history.location.pathname).toEqual('/home')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
    })
  })

  describe('when an action pops history', () => {
    it('loads the page from the store', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/home'],
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

      const store = buildStore({}, rootReducer)

      render(
        <Application
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/home'}
          appEl={document}
          mapping={{ home: Home, about: About }}
          history={history}
          store={store}
          buildVisitAndRemote={buildVisitAndRemote}
        />
      )

      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/about'
      fetchMock.mock('http://example.com/about?format=json', mockResponse)

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      await flushPromises()
      let state = store.getState()
      expect(state.superglue.currentPageKey).toEqual('/about')
      expect(history.location.pathname).toEqual('/about')
      expect(state.superglue.currentPageKey).toEqual('/about')
      expect(history.location.pathname).toEqual('/about')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')

      history.back()

      state = store.getState()
      expect(state.superglue.currentPageKey).toEqual('/home')
      expect(history.location.pathname).toEqual('/home')
      expect(state.superglue.currentPageKey).toEqual('/home')
      expect(history.location.pathname).toEqual('/home')
      expect(history.location.search).toEqual('')
      expect(history.location.hash).toEqual('')
    })

    it('does not change current page when the hash changes', () =>
      new Promise((done) => {
        const history = createMemoryHistory({})
        history.push('/home#title', {
          superglue: true,
          pageKey: '/home',
        })
        history.push('/home') // Gets replaced on Superglue.start
        const store = buildStore({}, rootReducer)

        history.listen(({ action, location }) => {
          const { pathname, hash } = location
          if (hash === '#title') {
            const state = store.getState()
            expect(state.superglue.currentPageKey).toEqual('/home')
            expect(pathname).toEqual('/home')
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


        render(
          <Application
            initialPage={initialPage}
            baseUrl={'http://example.com'}
            path={'/home'}
            appEl={document}
            mapping={{ home: ExampleHome }}
            history={history}
            store={store}
            buildVisitAndRemote={buildVisitAndRemote}
          />
        )
      }))

    it('requests the evicted page when encountering the page again using browser buttons', async () => {
      const history = createMemoryHistory({})
      history.push('/about', {
        superglue: true,
        pageKey: '/about',
      })
      history.push('/home') // Gets replaced on Superglue.start
      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/about'
      fetchMock.mock('http://example.com/about?format=json', mockResponse)

      const initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
        assets: ['123.js', '123.css'],
        fragments: [],
        csrfToken: 'token',
      }

      const store = buildStore({}, rootReducer)
      render(
        <Application
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/home'}
          appEl={document}
          mapping={{ home: Home, about: About }}
          history={history}
          store={store}
          buildVisitAndRemote={buildVisitAndRemote}
        />
      )

      const pageState = {
        data: { heading: 'Visit Success Some heading 2' },
        csrfToken: 'token',
        assets: ['application-123.js', 'application-123.js'],
        componentIdentifier: 'about',
        pageKey: '/about',
        fragments: [],
        savedAt: expect.any(Number),
      }

      history.back()
      // component.find('button').simulate('click')

      await flushPromises()

      expect(store.getState().pages['/about']).toEqual(pageState)
      expect(history.location.pathname).toEqual('/about')
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
          this.props.remote('/about?props_at=address')
        }
      }

      const store = buildStore({}, rootReducer)

      render(
        <Application
          initialPage={initialPage}
          baseUrl={'http://example.com'}
          path={'/about'}
          appEl={document}
          mapping={{ home: ExampleHome }}
          history={history}
          store={store}
          buildVisitAndRemote={buildVisitAndRemote}
        />
      )

      const mockResponse = rsp.graftSuccessWithNewZip({
        componentIdentifier: 'home',
      })

      mockResponse.headers['x-response-url'] = '/about'
      fetchMock.mock(
        'http://example.com/about?props_at=address&format=json',
        mockResponse
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      await flushPromises()

      const state = store.getState()
      expect(state.pages['/about'].data.address).toEqual({
        zip: 91210,
      })
    })
  })
})
