import { describe, it, expect, vi } from 'vitest'
import React, { useContext, useEffect } from 'react'
import { Provider } from 'react-redux'
import { createBrowserHistory, createMemoryHistory } from 'history'
import { NavigationProvider } from '../../lib/components/Navigation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavigationContext } from '../../lib/components/Navigation'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib'
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

    it('navigates to the page when the hash changes', async () => {
      const history = createBrowserHistory({})
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
          <NavigationProvider
            store={store}
            mapping={{ home: Home, about: About }}
            history={history}
          />
        </Provider>
      )

      expect(history.location.hash).toEqual('')
      expect(history.location.state).toEqual({
        pageKey: '/home',
        posX: 0,
        posY: 0,
        superglue: true,
      })
      const user = userEvent.setup()
      await user.click(screen.getByText('click'))

      expect(history.location.hash).toEqual('#top')
      expect(history.location.state).toEqual({
        pageKey: '/home',
        posX: 0,
        posY: 0,
        superglue: true,
      })
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

  it('navigates using "push" to a copied page with new params', () => {
    const history = createMemoryHistory({})
    history.replace('/home', {
      superglue: true,
      pageKey: '/home',
      posX: 5,
      posY: 5,
    })
    
    vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {})

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

    instance.navigateTo('/home', { search: {hello: "world" }})

    const pages = store.getState().pages
    expect(pages['/home?hello=world']).toMatchObject(
      pages['/home']
    )
    expect(pages['/home?hello=world']).not.toBe(
      pages['/home']
    )

    expect(store.getState().superglue.currentPageKey).toEqual("/home?hello=world")
    expect(history.location.pathname).toEqual('/home')
    expect(history.location.search).toEqual('?hello=world')
  })
  
  it('navigates using "replace" to a moved page with new params', () => {
    const history = createMemoryHistory({})
    history.replace('/home', {
      superglue: true,
      pageKey: '/home',
      posX: 5,
      posY: 5,
    })
    
    vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {})

    const homeProps = {
      componentIdentifier: 'home',
      restoreStrategy: 'fromCacheOnly',
    }

    const store = buildStore({
      pages: {
        '/home': homeProps,
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

    instance.navigateTo('/home', { action: "replace", search: {hello: "world" }})

    const pages = store.getState().pages
    expect(pages['/home?hello=world']).toBe(
      homeProps
    )

    expect(store.getState().superglue.currentPageKey).toEqual("/home?hello=world")
    expect(history.location.pathname).toEqual('/home')
    expect(history.location.search).toEqual('?hello=world')
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

        const fakeVisit = vi.fn((...args) => {
          return {
            then: vi.fn((fn) => {
              fn({ navigationAction })
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
        const scrollTo = vi
          .spyOn(window, 'scrollTo')
          .mockImplementation(() => {})
        const navigationAction = 'replace'

        const fakeVisit = vi.fn((...args) => {
          return {
            then: vi.fn((fn) => {
              store.dispatch(setActivePage({ pageKey: '/login' }))
              fn({ navigationAction })
            }),
          }
        })

        render(
          <Provider store={store}>
            <NavigationProvider
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About, login: Login }}
              initialPageKey={'/home'}
              history={history}
            />
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
            <NavigationProvider
              store={store}
              visit={fakeVisit}
              mapping={{ home: Home, about: About }}
              history={history}
            />
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

        const fakeVisit = vi.fn((...args) => {})

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
        expect(scrollTo).not.toHaveBeenCalledWith(5, 5)
        await expect.poll(() => scrollTo.toHaveBeenCalledWith(5, 5))
      })
    })
  })
})
