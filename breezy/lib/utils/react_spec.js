import { JSDOM } from 'jsdom'
import { render } from 'react-dom'
import start from '../index'
import fetchMock from 'fetch-mock'
import * as rsp from '../../spec/fixtures'
import React from 'react'
import getStore from '../connector'
import {Nav, mapStateToProps, mapDispatchToProps} from './react'
import { Provider, connect } from 'react-redux'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'

const createScene = (html) => {
  const dom = new JSDOM(`${html}`, {runScripts: 'dangerously'})
  return {dom, target: dom.window.document.body.firstElementChild}
}

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.visit = this.visit.bind(this)
  }

  visit() {
    this.props.navigateTo('about', '/foo')
  }

  render() {
    return (
      <div>
      Home Page
      <button onClick={this.visit}> click </button>
      </div>
    )
  }
}

class About extends React.Component {
  render() {
    return <h1>About Page</h1>;
  }
}

describe('Nav', () => {
  describe('navigateTo', () => {
    it('navigates to the specified page', (done) => {
      const history = createMemoryHistory({});
      const {dom, target} = createScene('<div></div>')

      class ExampleAbout extends About {
        componentDidMount(){
          let expected = '<div><h1>About Page</h1></div>'
          expect(dom.window.document.body.innerHTML).toEqual(expected)
          done()
        }
      }

      render(
        <Nav
          mapping={{'home': Home, 'about': ExampleAbout}}
          initialState={{screen:'home', url: '/bar'}}
          history={history}
        />,
        target
      )
      target.getElementsByTagName('button')[0].click()
    })

    it('navigates to the specified page and calls the action when used with react-redux', (done) => {
      const history = createMemoryHistory({});
      const {dom, target} = createScene('<div></div>')

      const mockStore = configureMockStore()
      const store = mockStore({})

      class ExampleAbout extends About {
        componentDidMount(){
          const expectedActions = [
            { type: 'BREEZY_HISTORY_CHANGE', url: '/foo' }
          ]
          expect(store.getActions()).toEqual(expectedActions)
          done()
        }
      }

      render(
        <Provider store={store}>
          <Nav
            mapping={{'home': Home, 'about': ExampleAbout}}
            initialState={{screen:'home', url: '/bar'}}
            history={history}
            />
        </Provider>,
        target
      )
      target.getElementsByTagName('button')[0].click()
    })

    it('navigates to the page when history changes', (done) => {
      const history = createMemoryHistory({});
      history.replace('/bar', {breezy: true, screen: 'home', pageKey: '/bar'})
      const {dom, target} = createScene('<div></div>')
      const mockStore = configureMockStore()
      const store = mockStore({
        pages: {
          '/bar': {}
        }
      })

      let mountTimes = 0

      class ExampleHome extends Home {
        componentDidMount() {
          if (mountTimes == 1) {
            let expected = '<div><div>Home Page<button> click </button></div></div>'
            expect(dom.window.document.body.innerHTML).toEqual(expected)
            done()
          }
          mountTimes++
        }
      }

      class ExampleAbout extends About {
        componentDidMount(){
          history.goBack()
        }
      }

      render(
        <Provider store={store}>
          <Nav
            mapping={{'home': ExampleHome, 'about': ExampleAbout}}
            initialState={{screen:'home', url: '/bar'}}
            history={history}
            />
        </Provider>,
        target
      )
      target.getElementsByTagName('button')[0].click()
    })
  })

  describe('mapStateToToProps', ()=>{
    it('returns the state of the url', () => {
      let dispatch = jasmine.createSpy('dispatch')
      let slice = {
        pages:{
          '/foo': {
            data: {heading: 'hi'}
          }
        }
      }

      let props = mapStateToProps(slice, {pageKey: '/foo'})
      expect(props).toEqual({heading: 'hi', pageKey: '/foo'})
    })
  })
})
