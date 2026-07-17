import { describe, it, expect, vi } from 'vitest'
import React, { useContext, useEffect } from 'react'
import { Provider } from 'react-redux'
import { createBrowserHistory, createMemoryHistory } from 'history'
import {
  NavigationProvider,
  NavigationOutlet,
  NavigationContext,
} from '../../lib/components/Navigation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'
import { setActivePage } from '../../lib/actions'

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
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: Home, about: About }} />
          </NavigationProvider>
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
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: Home, about: About }} />
          </NavigationProvider>
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
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: Home, about: About }} />
          </NavigationProvider>
        </Provider>
      )
      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      expect(scrollTo).toHaveBeenCalledWith(0, 0)
      expect(screen.getByRole('heading')).not.toHaveTextContent('Home Page')
      expect(screen.getByRole('heading')).toHaveTextContent('About Page')

      const expectedActions = [
        {
          type: '@@superglue/SET_ACTIVE_PAGE',
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
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: Home, about: About }} />
          </NavigationProvider>
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('click'))
      expect(visitedAbout).toBe(true)
      expect(returnedHome).toBe(true)
    })

    it('navigates to the page when the hash changes', async () => {
      const history = createBrowserHistory({})
      history.push('/home', {
        superglue: true,
        posX: 0,
        posY: 0,
      })
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

      const Home = () => {
        return (
          <div>
            <h1 id="top">Home Page</h1>
            <a href="#top">click</a>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: Home, about: About }} />
          </NavigationProvider>
        </Provider>
      )

      expect(history.location.hash).toEqual('')
      expect(history.location.state).toEqual({
        posX: 0,
        posY: 0,
        superglue: true,
      })
      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      expect(history.location.hash).toEqual('#top')
      expect(history.location.state).toEqual({
        posX: 0,
        posY: 0,
        superglue: true,
      })
    })

    it('copyTo dispatches copyPage with correct from/to', async () => {
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
            data: { greeting: 'hello' },
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      const HomeWithCopy = () => {
        const { copyTo } = useContext(NavigationContext)
        const copy = () => {
          copyTo('/copied')
        }

        return (
          <div>
            <h1>Home Page</h1>
            <button onClick={copy}>copy</button>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: HomeWithCopy }} />
          </NavigationProvider>
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('copy'))

      const actions = allSuperglueActions(store)
      const copyAction = actions.find((a) => a.type === '@@superglue/COPY_PAGE')

      expect(copyAction).toEqual({
        type: '@@superglue/COPY_PAGE',
        payload: { from: '/home', to: '/copied' },
      })

      expect(store.getState().pages['/home'].data).toEqual({
        greeting: 'hello',
      })
      expect(store.getState().pages['/copied'].data).toEqual({
        greeting: 'hello',
      })
    })

    it('copyTo is a no-op when copying onto the current page', async () => {
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
            data: {},
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      const HomeWithSelfCopy = () => {
        const { copyTo } = useContext(NavigationContext)
        const copy = () => {
          copyTo('/home')
        }

        return (
          <div>
            <h1>Home Page</h1>
            <button onClick={copy}>copy</button>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: HomeWithSelfCopy }} />
          </NavigationProvider>
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('copy'))

      const actions = allSuperglueActions(store)
      expect(
        actions.find((a) => a.type === '@@superglue/COPY_PAGE')
      ).toBeUndefined()
    })

    it('navigateTo with updateContent mutates page data before navigating', async () => {
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
            data: { greeting: 'hello' },
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
          '/about': {
            componentIdentifier: 'about',
            data: { greeting: 'world' },
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      const HomeWithUpdate = () => {
        const { navigateTo } = useContext(NavigationContext)
        const nav = () => {
          navigateTo('/about', {
            action: 'push',
            updateContent: (draft) => {
              draft.greeting = 'updated'
            },
          })
        }

        return (
          <div>
            <h1>Home Page</h1>
            <button onClick={nav}>navigate</button>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <NavigationProvider history={history}>
            <NavigationOutlet
              mapping={{ home: HomeWithUpdate, about: About }}
            />
          </NavigationProvider>
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('navigate'))

      expect(store.getState().pages['/about'].data).toEqual({
        greeting: 'updated',
      })
    })

    it('navigateTo with updateContent works with action replace on current page', async () => {
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
            data: { showModal: false },
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      const HomeWithReplace = () => {
        const { navigateTo } = useContext(NavigationContext)
        const nav = () => {
          navigateTo('/home', {
            action: 'replace',
            updateContent: (draft) => {
              draft.showModal = true
            },
          })
        }

        return (
          <div>
            <h1>Home Page</h1>
            <button onClick={nav}>replace</button>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: HomeWithReplace }} />
          </NavigationProvider>
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('replace'))

      expect(store.getState().pages['/home'].data).toEqual({
        showModal: true,
      })
    })

    it('navigateTo with updateContent defaults action to push', async () => {
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
            data: { greeting: 'hello' },
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
          '/about': {
            componentIdentifier: 'about',
            data: { greeting: 'world' },
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

      const HomeWithUpdate = () => {
        const { navigateTo } = useContext(NavigationContext)
        const nav = () => {
          navigateTo('/about', {
            updateContent: (draft) => {
              draft.greeting = 'updated'
            },
          })
        }

        return (
          <div>
            <h1>Home Page</h1>
            <button onClick={nav}>navigate</button>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <NavigationProvider history={history}>
            <NavigationOutlet
              mapping={{ home: HomeWithUpdate, about: About }}
            />
          </NavigationProvider>
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('navigate'))

      expect(store.getState().pages['/about'].data).toEqual({
        greeting: 'updated',
      })
      expect(history.location.pathname).toEqual('/about')
      expect(screen.getByRole('heading')).toHaveTextContent('About Page')
    })

    it('navigateTo without updateContent preserves existing behavior', async () => {
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
            data: { greeting: 'hello' },
            fragments: [],
            restoreStrategy: 'fromCacheOnly',
          },
        },
        superglue: {
          csrfToken: 'abc',
          currentPageKey: '/home',
        },
      })

      let result
      const HomeWithNav = () => {
        const { navigateTo } = useContext(NavigationContext)
        const nav = () => {
          result = navigateTo('/missing', { action: 'push' })
        }

        return (
          <div>
            <h1>Home Page</h1>
            <button onClick={nav}>navigate</button>
          </div>
        )
      }

      render(
        <Provider store={store}>
          <NavigationProvider history={history}>
            <NavigationOutlet mapping={{ home: HomeWithNav }} />
          </NavigationProvider>
        </Provider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByText('navigate'))

      expect(result).toEqual(false)
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
            ref={(node) => (instance = node)}
            history={history}
          >
            <NavigationOutlet mapping={{ home: Home, about: About }} />
          </NavigationProvider>
        </Provider>
      )

      expect(instance.navigateTo('/blah', { action: 'none' })).toEqual(false)
    })
  })

  describe('history pop', () => {
    describe('when the previous page was set to "revisitOnly"', () => {
      it('revisits the page and scrolls when finished', async () => {
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

        const fakeVisit = vi.fn(() => {
          return {
            then: vi.fn((fn) => {
              fn({ navigationAction })
            }),
          }
        })

        render(
          <Provider store={store}>
            <NavigationProvider visit={fakeVisit} history={history}>
              <NavigationOutlet mapping={{ home: Home, about: About }} />
            </NavigationProvider>
          </Provider>
        )

        expect(scrollTo).toHaveBeenCalledWith(10, 10)
        history.back()
        expect(scrollTo).not.toHaveBeenCalledWith(5, 5)
        expect(fakeVisit).toHaveBeenCalledWith('/home', { revisit: true })

        await expect.poll(() => scrollTo.toHaveBeenCalledWith(5, 5))
      })

      it('revisits the page and when redirected replaces with the new page', async () => {
        const Login = () => {
          return <h1>Login Page</h1>
        }

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
            '/login': {
              componentIdentifier: 'login',
              restoreStrategy: 'fromCacheOnly',
            },
          },
          superglue: {
            csrfToken: 'abc',
            currentPageKey: '/about',
          },
        })
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
        const navigationAction = 'replace'

        const fakeVisit = vi.fn(() => {
          return {
            then: vi.fn((fn) => {
              store.dispatch(setActivePage({ pageKey: '/login' }))
              fn({ navigationAction })
            }),
          }
        })

        render(
          <Provider store={store}>
            <NavigationProvider visit={fakeVisit} history={history}>
              <NavigationOutlet
                mapping={{ home: Home, about: About, login: Login }}
              />
            </NavigationProvider>
          </Provider>
        )

        expect(screen.getByRole('heading')).toHaveTextContent('About Page')
        expect(screen.getByRole('heading')).not.toHaveTextContent('Login Page')

        history.back()

        await expect.poll(() =>
          screen.getByRole('heading').not.toHaveTextContent('About Page')
        )
        await expect.poll(() =>
          screen.getByRole('heading').toHaveTextContent('Login Page')
        )
      })
    })

    describe('when the previous page was set to "fromCacheOnly"', () => {
      it('restores without visiting and scrolls', async () => {
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
            <NavigationProvider visit={fakeVisit} history={history}>
              <NavigationOutlet mapping={{ home: Home, about: About }} />
            </NavigationProvider>
          </Provider>
        )

        history.back()
        expect(fakeVisit).not.toHaveBeenCalled()
        expect(scrollTo).not.toHaveBeenCalledWith(5, 5)
        await expect.poll(() => scrollTo.toHaveBeenCalledWith(5, 5))
      })
    })

    describe('and the previous page was set to "fromCacheAndRevisitInBackground"', () => {
      it('restores, scrolls, and revisits the page in the background', async () => {
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

        const fakeVisit = vi.fn(() => {})

        render(
          <Provider store={store}>
            <NavigationProvider visit={fakeVisit} history={history}>
              <NavigationOutlet mapping={{ home: Home, about: About }} />
            </NavigationProvider>
          </Provider>
        )

        history.back()
        expect(fakeVisit).toHaveBeenCalledWith('/home', { revisit: true })
        expect(scrollTo).not.toHaveBeenCalledWith(5, 5)
        await expect.poll(() => scrollTo.toHaveBeenCalledWith(5, 5))
      })
    })
  })
})
