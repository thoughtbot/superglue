import { JSDOM } from 'jsdom'
import { start, stop } from '../../lib/index'
import fetchMock from 'fetch-mock'
import * as rsp from '../fixtures'
import { render } from 'react-dom'
import thunk from 'redux-thunk'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import { Provider, connect } from 'react-redux'
import React from 'react'
import { mapStateToProps, mapDispatchToProps } from '../../lib/utils/react'
import { getStore } from '../../lib/connector'
import { createMemoryHistory } from 'history'
import Nav from '../../lib/NavComponent.js'

process.on('unhandledRejection', (r) => console.log(r))

const createScene = (html, url = 'http://localhost') => {
  const dom = new JSDOM(`${html}`, { runScripts: 'dangerously', url })
  return { dom, target: dom.window.document.body.firstElementChild }
}

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.enhancedVisit = this.visit.bind(this)
  }

  visit() {
    this.props.visit('/foo').then(() => this.props.navigateTo('/foo'))
  }

  render() {
    return (
      <div>
        Home Page, {this.props.heading}
        <button onClick={this.enhancedVisit}> click </button>
      </div>
    )
  }
}

class About extends React.Component {
  render() {
    return <h1>About Page, {this.props.heading}</h1>
  }
}

describe('navigation', () => {
  beforeEach(() => {
    fetchMock.restore()
  })

  describe('when successfully visiting', () => {
    it('saves the page', (done) => {
      let history = createMemoryHistory({})
      let { dom, target } = createScene(`<div></div>`, 'http://localhost/bar')
      let initialPage = {
        data: {
          heading: 'this is page 1',
        },
        componentIdentifier: 'home',
      }

      const bz = start({
        window: dom.window,
        initialPage,
        url: '/bar',
      })
      const { reducer, initialState, initialPageKey } = bz

      const store = createStore(
        combineReducers(reducer),
        initialState,
        applyMiddleware(thunk)
      )

      bz.connect(store)

      const VisibleHome = connect(mapStateToProps, mapDispatchToProps)(Home)

      class ExampleAbout extends About {
        componentDidMount() {
          const state = getStore().getState()
          expect(state).toEqual(newState)
          stop()
          done()
        }
      }

      const VisibleAbout = connect(
        mapStateToProps,
        mapDispatchToProps
      )(ExampleAbout)

      render(
        <Provider store={store}>
          <Nav
            store={store}
            mapping={{ home: VisibleHome, about: VisibleAbout }}
            history={history}
            initialPageKey={initialPageKey}
          />
        </Provider>,
        target
      )

      const mockResponse = rsp.visitSuccess()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('/foo?__=0', mockResponse)

      const newState = {
        breezy: {
          currentUrl: '/foo',
          baseUrl: '',
          csrfToken: 'token',
          controlFlows: {
            visit: jasmine.any(String),
          },
        },
        pages: {
          '/bar': {
            data: { heading: 'this is page 1' },
            componentIdentifier: 'home',
            pageKey: '/bar',
            fragments: {},
          },
          '/foo': {
            data: { heading: 'Some heading 2' },
            csrfToken: 'token',
            assets: ['application-123.js', 'application-123.js'],
            componentIdentifier: 'about',
            pageKey: '/foo',
            fragments: {},
          },
        },
      }

      target.getElementsByTagName('button')[0].click()
    })
  })

  describe('when successfully grafting', () => {
    it('grafts the node', (done) => {
      let history = createMemoryHistory({})
      let { dom, target } = createScene(`<div></div>`, 'http://localhost/foo')
      let initialPage = {
        data: {
          heading: 'this is page 1',
          address: undefined,
        },
        componentIdentifier: 'home',
      }

      const bz = start({
        window: dom.window,
        initialPage,
        url: '/foo',
      })
      const { reducer, initialState, initialPageKey } = bz
      const store = createStore(
        combineReducers(reducer),
        initialState,
        applyMiddleware(thunk)
      )

      bz.connect(store)

      class ExampleHome extends Home {
        visit() {
          this.props.remote('/foo?bzq=address')
        }

        componentDidUpdate() {
          const state = getStore().getState()
          expect(state.pages['/foo'].data.address).toEqual({ zip: 91210 })
          stop()
          done()
        }
      }

      const VisibleHome = connect(
        mapStateToProps,
        mapDispatchToProps
      )(ExampleHome)

      render(
        <Provider store={store}>
          <Nav
            store={store}
            mapping={{ home: VisibleHome }}
            history={history}
            initialPageKey={initialPageKey}
          />
        </Provider>,
        target
      )

      const mockResponse = rsp.graftSuccessWithNewZip()
      mockResponse.headers['x-response-url'] = '/foo'
      fetchMock.mock('/foo?bzq=address&__=0', mockResponse)

      target.getElementsByTagName('button')[0].click()
    })
  })
})
