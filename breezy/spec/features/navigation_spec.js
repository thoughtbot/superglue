import { JSDOM } from 'jsdom'
import {start, stop} from '../../lib/index'
import fetchMock from 'fetch-mock'
import * as rsp from '../fixtures'
import { render } from 'react-dom'
import thunk from 'redux-thunk'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import { Provider, connect } from 'react-redux'
import React from 'react'
import {Nav, mapStateToProps, mapDispatchToProps} from '../../lib/utils/react'
import {getStore} from '../../lib/connector'
import { createMemoryHistory } from 'history'

process.on('unhandledRejection', r => console.log(r));

const createScene = (html, url='http://localhost') => {
  const dom = new JSDOM(`${html}`, {runScripts: 'dangerously', url})
  return {dom, target: dom.window.document.body.firstElementChild}
}

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.visit = this.visit.bind(this)
  }

  visit() {
    this.props.visit('/foo')
      .then(()=> this.props.navigateTo('about', '/foo'))
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
    return <h1>About Page, {this.props.heading}</h1>;
  }
}

describe('navigation', () => {
  beforeEach(() => {
    fetchMock.restore()
  })

  describe('when successfully visiting', () => {
    it('saves the page', (done) => {
      let history = createMemoryHistory({});
      let {dom, target} = createScene(`<div></div>`, 'http://localhost/bar')

      const bz = start({
        window: dom.window,
        initialPage: {
          data: {
            heading: 'this is page 1'
          },
          screen: 'home'
        },
        history
      })

      const {reducer, initialState, Nav} = bz

      const store = createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
      )

      bz.connect(store)

      const VisibleHome = connect(
        mapStateToProps,
        mapDispatchToProps
      )(Home)

      class ExampleAbout extends About {
        componentDidMount(){
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
          <Nav mapping={{'home': VisibleHome, 'about': VisibleAbout}}/>
        </Provider>,
        target
      )
      fetchMock.mock('/foo', rsp.visitSuccess)


      const newState = {
        breezy: {
          currentUrl: '/foo',
          baseUrl: '',
          csrfToken: 'token',
          controlFlows: {
            visit: jasmine.any(String),
            remote: [],
            remoteInOrder: []
          },
        },
        page: {
          '/bar': {data:{heading: 'this is page 1'}, screen: 'home'},
          '/foo':{
            data: { heading: 'Some heading 2' },
            title: 'title 2',
            csrf_token: 'token',
            assets: ['application-123.js', 'application-123.js'],
            cachedAt: jasmine.any(Number),
            positionY: jasmine.any(Number),
            positionX: jasmine.any(Number),
            pathname: '/foo',
            joints: {}
          }
        }
      }

      target.getElementsByTagName('button')[0].click()
    })
  })

  describe('when successfully grafting', () => {
    it('grafts the node', (done) => {
      let history = createMemoryHistory({});
      let {dom, target} = createScene(`<div></div>`, 'http://localhost/foo')

      const bz = start({
        window: dom.window,
        initialPage: {
          data: {
            heading: 'this is page 1'
          },
          screen: 'home'
        },
        history
      })
      const {reducer, initialState, Nav} = bz

      const store = createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
      )

      bz.connect(store)

      class ExampleHome extends Home {
        visit() {
          this.props.visit('/foo?_bz=address')
        }

        componentDidUpdate() {
          const state = getStore().getState()
          expect(state.page['/foo'].data.address).toEqual({zip: 91210})
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
          <Nav mapping={{'home': VisibleHome}}/>
        </Provider>,
        target
      )

      fetchMock.mock('/foo?_bz=address', rsp.graftSuccessWithNewZip)

      target.getElementsByTagName('button')[0].click()
    })
  })
})
