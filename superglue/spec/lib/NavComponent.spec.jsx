import { describe, it, expect, vi } from 'vitest'
import React, { useContext, useEffect } from 'react'
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history'
import { NavigationProvider } from '../../lib/components/Navigation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavigationContext } from '../../lib/components/Navigation'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib'

const buildStore = (preloadedState) => {
  let resultsReducer = (state = [], action) => {
    return state.concat([action])
  }

  return configureStore({
    preloadedState,
    reducer: {
      ...rootReducer,
      results: resultsReducer,
    },
  })
}

const allSuperglueActions = (store) => {
  return store
    .getState()
    .results.filter((action) => !action.type.startsWith('@@redux'))
}

const Home = () => {
  const { navigateTo } = useContext(NavigationContext)
  const visit = () => {
    navigateTo('/about')
  }

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={visit}> click </button>
    </div>
  )
}

const About = () => {
  return <h1>About Page</h1>
}

describe('Nav', () => {
  describe('navigateTo', () => {
    it('navigates to the specified page', async () => {
      const history = createMemoryHistory({})
      history.push('/home', {
        superglue: true,
        pageKey: '/home',
        posX: 0,
        posY: 0,
      })

      const store = buildStore({
        pages: {
          '/about': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
          '/home': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      render(
        <Provider store={store}>
          <NavigationProvider
            store={store}
            mapping={{ home: Home, about: About }}
            initialPageKey={'/home'}
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
      const store = buildStore({
        pages: {
          '/home': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      render(
        <Provider store={store}>
          <NavigationProvider
            store={store}
            mapping={{ home: Home, about: About }}
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
      history.push('/home', {
        superglue: true,
        pageKey: '/home',
        posX: 0,
        posY: 0,
      })
      const store = buildStore({
        pages: {
          '/about': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
          '/home': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })
      const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      render(
        <Provider store={store}>
          <NavigationProvider
            store={store}
            mapping={{ home: Home, about: About }}
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
            pageKey: '/home',
          },
        },
        {
          type: '@@superglue/HISTORY_CHANGE',
          payload: {
            pageKey: '/about',
          },
        },
      ]
      expect(allSuperglueActions(store)).toEqual(expectedActions)
    })

    it('navigates to the page when history changes', async () => {
      const history = createMemoryHistory({})
      history.push('/home', {
        superglue: true,
        pageKey: '/home',
        posX: 0,
        posY: 0,
      })
      const store = buildStore({
        pages: {
          '/home': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
          '/about': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      let mountTimes = 0
      let visitedAbout = false
      let returnedHome = false

      const Home = () => {
        const { navigateTo } = useContext(NavigationContext)
        const visit = () => {
          navigateTo('/about')
        }

        useEffect(() => {
          if (mountTimes == 1) {
            returnedHome = true
          }
          mountTimes++
        }, [])

        return (
          <div>
            <h1>Home Page</h1>
            <button onClick={visit}> click </button>
          </div>
        )
      }

      const About = () => {
        useEffect(() => {
          visitedAbout = true
          history.back()
        }, [])

        return <h1>About Page</h1>
      }

      render(
        <Provider store={store}>
          <NavigationProvider
            store={store}
            mapping={{ home: Home, about: About }}
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
      const store = buildStore({
        pages: {
          '/home': {
            componentIdentifier: 'home',
            restoreStrategy: 'fromCacheOnly',
          },
          '/about': {
            componentIdentifier: 'about',
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      let instance

      render(
        <Provider store={store}>
          <NavigationProvider
            store={store}
            ref={(node) => (instance = node)}
            mapping={{ home: Home, about: About }}
            history={history}
          />
        </Provider>
      )

      expect(instance.navigateTo('/blah', { action: 'none' })).toEqual(false)
    })
  })

  describe('history pop', () => {
    describe('when the previous page was set to "revisitOnly"', () => {
      it('revisits the page and scrolls when finished', () => {
        const history = createMemoryHistory({})
        history.replace('/home', {
          superglue: true,
          pageKey: '/home',
          posX: 5,
          posY: 5,
        })

        history.push('/about', {
          superglue: true,
          pageKey: '/about',
          posX: 10,
          posY: 10,
        })

        const store = buildStore({
          pages: {
            '/home': {
              componentIdentifier: 'home',
              restoreStrategy: 'revisitOnly',
            },
            '/about': {
              componentIdentifier: 'about',
              restoreStrategy: 'revisitOnly',
            },
          },
          superglue: {
            csrfToken: 'abc',
            currentPageKey: '/about',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})
        const navigationAction = 'none'

        const fakeVisit = vi.fn((...args) => {
          return {
            then: vi.fn((fn) => {
              expect(scrollTo).not.toHaveBeenCalled()
              fn({ navigationAction })
              expect(scrollTo).toHaveBeenCalledWith(5, 5)
            }),
          }
        })

        render(
          <Provider store={store}>
            <NavigationProvider
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              initialPageKey={'/home'}
              history={history}
            />
          </Provider>
        )

        history.back()
        expect(fakeVisit).toHaveBeenCalledWith('/home', { revisit: true })
      })

      it('revisits the page and skips scroll when redirected (navigationAction is not "none")', () => {
        const history = createMemoryHistory({})
        history.replace('/home', {
          superglue: true,
          pageKey: '/home',
          posX: 5,
          posY: 5,
        })

        history.push('/about', {
          superglue: true,
          pageKey: '/about',
          posX: 10,
          posY: 10,
        })

        const store = buildStore({
          pages: {
            '/home': {
              componentIdentifier: 'home',
              restoreStrategy: 'revisitOnly',
            },
            '/about': {
              componentIdentifier: 'about',
              restoreStrategy: 'revisitOnly',
            },
          },
          superglue: {
            csrfToken: 'abc',
            currentPageKey: '/about',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})
        const navigationAction = 'push'

        const fakeVisit = vi.fn((...args) => {
          return {
            then: vi.fn((fn) => {
              // expect(scrollTo).not.toHaveBeenCalled()
              fn({ navigationAction })
              expect(scrollTo).not.toHaveBeenCalled()
            }),
          }
        })

        // scroll to 0 0

        render(
          <Provider store={store}>
            <NavigationProvider
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              initialPageKey={'/home'}
              history={history}
            />
          </Provider>
        )

        history.back()
        expect(fakeVisit).toHaveBeenCalledWith('/home', { revisit: true })
      })
    })

    describe('when the previous page was set to "fromCacheOnly"', () => {
      it('restores without visiting and scrolls', () => {
        const history = createMemoryHistory({})
        history.replace('/home', {
          superglue: true,
          pageKey: '/home',
          posX: 5,
          posY: 5,
        })

        history.push('/about', {
          superglue: true,
          pageKey: '/about',
          posX: 10,
          posY: 10,
        })
        const store = buildStore({
          pages: {
            '/home': {
              componentIdentifier: 'home',
              restoreStrategy: 'fromCacheOnly',
            },
            '/about': {
              componentIdentifier: 'about',
              restoreStrategy: 'fromCacheOnly',
            },
          },
          superglue: {
            csrfToken: 'abc',
            currentPageKey: '/home',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})

        const fakeVisit = vi.fn()

        render(
          <Provider store={store}>
            <NavigationProvider
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
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
        history.replace('/home', {
          superglue: true,
          pageKey: '/home',
          posX: 5,
          posY: 5,
        })

        history.push('/about', {
          superglue: true,
          pageKey: '/about',
          posX: 10,
          posY: 10,
        })
        const store = buildStore({
          pages: {
            '/home': {
              componentIdentifier: 'home',
              restoreStrategy: 'fromCacheAndRevisitInBackground',
            },
            '/about': {
              componentIdentifier: 'about',
              restoreStrategy: 'fromCacheAndRevisitInBackground',
            },
          },
          superglue: {
            csrfToken: 'abc',
            currentPageKey: '/home',
          },
        })
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})

        const fakeVisit = vi.fn((...args) => {
          expect(scrollTo).toHaveBeenCalledWith(5, 5)
        })

        render(
          <Provider store={store}>
            <NavigationProvider
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              initialPageKey={'/home'}
              history={history}
            />
          </Provider>
        )

        history.back()
        expect(fakeVisit).toHaveBeenCalledWith('/home', { revisit: true })
      })
    })
  })
})
