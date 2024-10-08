import { describe, it, expect, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import React from 'react'
import fetchMock from 'fetch-mock'
import * as rsp from '../fixtures'
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'
import Nav from '../../lib/components/Nav'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.enhancedVisit = this.visit.bind(this)
  }

  visit() {
    this.props.navigateTo('/foo')
  }

  render() {
    return (
      <div>
        <h1>Home Page</h1>
        <button onClick={this.enhancedVisit}> click </button>
      </div>
    )
  }
}

class About extends React.Component {
  render() {
    return <h1>About Page</h1>
  }
}

describe('Nav', () => {
  describe('navigateTo', () => {
    it('navigates to the specified page', async () => {
      const history = createMemoryHistory({})
      history.push('/bar', {
        superglue: true,
        pageKey: '/bar',
        posX: 0,
        posY: 0,
      })
      let expected = '<div><h1>About Page</h1></div>'

      class ExampleAbout extends About {}

      const mockStore = configureMockStore()
      const store = mockStore({
        pages: {
          '/foo': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
          '/bar': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
        },
      })

      render(
        <Provider store={store}>
          <Nav
            store={store}
            mapping={{ home: Home, about: About }}
            initialPageKey={'/bar'}
            history={history}
          />
        </Provider>
      )
      const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      expect(scrollTo).toHaveBeenCalledWith(0, 0)

      expect(screen.getByRole('heading')).not.toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).toHaveTextContent('About Page')
    })

    it('does not navigate to the specified page if the page is not in the store', async () => {
      const history = createMemoryHistory({})
      const mockStore = configureMockStore()
      const store = mockStore({
        pages: {
          '/bar': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
        },
      })

      render(
        <Provider store={store}>
          <Nav
            store={store}
            mapping={{ home: Home, about: About }}
            initialPageKey={'/bar'}
            history={history}
          />
        </Provider>
      )

      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      expect(screen.getByRole('heading')).toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).not.toHaveTextContent('About Page')
    })

    it('navigates to the specified page and calls the action when used with react-redux', async () => {
      const history = createMemoryHistory({})
      history.push('/bar', {
        superglue: true,
        pageKey: '/bar',
        posX: 0,
        posY: 0,
      })
      const mockStore = configureMockStore()
      const store = mockStore({
        pages: {
          '/foo': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
          '/bar': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
        },
      })
      const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      render(
        <Provider store={store}>
          <Nav
            store={store}
            mapping={{ home: Home, about: About }}
            initialPageKey={'/bar'}
            history={history}
          />
        </Provider>
      )
      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      expect(scrollTo).toHaveBeenCalledWith(0, 0)
      expect(screen.getByRole('heading')).not.toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).toHaveTextContent('About Page')

      const expectedActions = [
        {
          type: '@@superglue/HISTORY_CHANGE',
          payload: {
            pathname: '/bar',
            search: '',
            hash: '',
          },
        },
        {
          type: '@@superglue/HISTORY_CHANGE',
          payload: {
            pathname: '/foo',
            search: '',
            hash: '',
          },
        },
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('navigates to the page when history changes', async () => {
      const history = createMemoryHistory({})
      history.push('/bar', {
        superglue: true,
        pageKey: '/bar',
        posX: 0,
        posY: 0,
      })
      const mockStore = configureMockStore()
      const store = mockStore({
        pages: {
          '/bar': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
          '/foo': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
        },
      })

      let mountTimes = 0
      let visitedAbout = false
      let returnedHome = false

      class ExampleHome extends Home {
        componentDidMount() {
          if (mountTimes == 1) {
            returnedHome = true
          }
          mountTimes++
        }
      }

      class ExampleAbout extends About {
        componentDidMount() {
          visitedAbout = true
          history.back()
        }
      }

      render(
        <Provider store={store}>
          <Nav
            store={store}
            mapping={{ home: ExampleHome, about: ExampleAbout }}
            initialPageKey={'/bar'}
            history={history}
          />
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      expect(visitedAbout).toBe(true)
      expect(returnedHome).toBe(true)
    })

    it('returns false when action is none', () => {
      const history = createMemoryHistory({})
      const mockStore = configureMockStore()
      const store = mockStore({
        pages: {
          '/bar': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
          '/foo': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
        },
      })

      let instance

      render(
        <Nav
          store={store}
          ref={(node) => (instance = node)}
          mapping={{ home: Home, about: About }}
          initialPageKey={'/bar'}
          history={history}
        />
      )

      expect(instance.navigateTo('/blah', { action: 'none' })).toEqual(false)
    })
  })

  describe('history pop', () => {
    describe('when the previous page was set to "revisitOnly"', () => {
      it('revisits the page and scrolls when finished', () => {
        const history = createMemoryHistory({})
        history.replace('/bar', {
          superglue: true,
          pageKey: '/bar',
          posX: 5,
          posY: 5,
        })

        history.push('/foo', {
          superglue: true,
          pageKey: '/foo',
          posX: 10,
          posY: 10,
        })
        const mockStore = configureMockStore()
        const store = mockStore({
          pages: {
            '/bar': {
              componentIdentifier: 'home',
              restoreStrategy: 'revisitOnly',
            },
            '/foo': {
              componentIdentifier: 'about',
              restoreStrategy: 'revisitOnly',
            },
          },
          superglue: {
            csrfToken: 'abc',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})
        const suggestedAction = 'none'

        const fakeVisit = vi.fn((...args) => {
          return {
            then: vi.fn((fn) => {
              expect(scrollTo).not.toHaveBeenCalled()
              fn({ suggestedAction })
              expect(scrollTo).toHaveBeenCalledWith(5, 5)
            }),
          }
        })

        render(
          <Provider store={store}>
            <Nav
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              initialPageKey={'/bar'}
              history={history}
            />
          </Provider>
        )

        history.back()
        expect(fakeVisit).toHaveBeenCalledWith('/bar', { revisit: true })
      })

      it('revisits the page and skips scroll when redirected (suggestedAction is not "none")', () => {
        const history = createMemoryHistory({})
        history.replace('/bar', {
          superglue: true,
          pageKey: '/bar',
          posX: 5,
          posY: 5,
        })

        history.push('/foo', {
          superglue: true,
          pageKey: '/foo',
          posX: 10,
          posY: 10,
        })
        const mockStore = configureMockStore()
        const store = mockStore({
          pages: {
            '/bar': {
              componentIdentifier: 'home',
              restoreStrategy: 'revisitOnly',
            },
            '/foo': {
              componentIdentifier: 'about',
              restoreStrategy: 'revisitOnly',
            },
          },
          superglue: {
            csrfToken: 'abc',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})
        const suggestedAction = 'push'

        const fakeVisit = vi.fn((...args) => {
          return {
            then: vi.fn((fn) => {
              // expect(scrollTo).not.toHaveBeenCalled()
              fn({ suggestedAction })
              expect(scrollTo).not.toHaveBeenCalled()
            }),
          }
        })

        // scroll to 0 0

        render(
          <Provider store={store}>
            <Nav
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              initialPageKey={'/bar'}
              history={history}
            />
          </Provider>
        )

        history.back()
        expect(fakeVisit).toHaveBeenCalledWith('/bar', { revisit: true })
      })
    })

    describe('when the previous page was set to "fromCacheOnly"', () => {
      it('restores without visiting and scrolls', () => {
        const history = createMemoryHistory({})
        history.replace('/bar', {
          superglue: true,
          pageKey: '/bar',
          posX: 5,
          posY: 5,
        })

        history.push('/foo', {
          superglue: true,
          pageKey: '/foo',
          posX: 10,
          posY: 10,
        })
        const mockStore = configureMockStore()
        const store = mockStore({
          pages: {
            '/bar': {
              componentIdentifier: 'home',
              restoreStrategy: 'fromCacheOnly',
            },
            '/foo': {
              componentIdentifier: 'about',
              restoreStrategy: 'fromCacheOnly',
            },
          },
          superglue: {
            csrfToken: 'abc',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})
        const suggestedAction = 'none'

        const fakeVisit = vi.fn()

        render(
          <Provider store={store}>
            <Nav
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              initialPageKey={'/bar'}
              history={history}
            />
          </Provider>
        )

        history.back()
        expect(scrollTo).toHaveBeenCalledWith(5, 5)
        expect(fakeVisit).not.toHaveBeenCalled()
      })
    })

    describe('and the previous page was set to "fromCacheAndRevisitInBackground"', () => {
      it('restores, scrolls, and revisits the page in the background', () => {
        const history = createMemoryHistory({})
        history.replace('/bar', {
          superglue: true,
          pageKey: '/bar',
          posX: 5,
          posY: 5,
        })

        history.push('/foo', {
          superglue: true,
          pageKey: '/foo',
          posX: 10,
          posY: 10,
        })
        const mockStore = configureMockStore()
        const store = mockStore({
          pages: {
            '/bar': {
              componentIdentifier: 'home',
              restoreStrategy: 'fromCacheAndRevisitInBackground',
            },
            '/foo': {
              componentIdentifier: 'about',
              restoreStrategy: 'fromCacheAndRevisitInBackground',
            },
          },
          superglue: {
            csrfToken: 'abc',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})
        const suggestedAction = 'none'

        const fakeVisit = vi.fn((...args) => {
          expect(scrollTo).toHaveBeenCalledWith(5, 5)
        })

        render(
          <Provider store={store}>
            <Nav
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              initialPageKey={'/bar'}
              history={history}
            />
          </Provider>
        )

        history.back()
        expect(fakeVisit).toHaveBeenCalledWith('/bar', { revisit: true })
      })
    })
  })
})
