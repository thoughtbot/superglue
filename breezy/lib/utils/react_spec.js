import { JSDOM } from 'jsdom'
import { render } from 'react-dom'
import start from '../index'
import fetchMock from 'fetch-mock'
import * as rsp from '../../spec/fixtures'
import React from 'react'
import getStore from '../connector'
import {mapStateToProps, mapDispatchToProps} from './react'
import { Provider, connect } from 'react-redux'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'
import Nav from '../../lib/NavComponent.js'

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
    this.props.navigateTo('/foo')
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

describe('mapStateToToProps', ()=>{
  it('returns the state of the url and the csrfToken', () => {
    let dispatch = jasmine.createSpy('dispatch')
    let slice = {
      pages:{
        '/foo': {
          data: {heading: 'hi'}
        }
      },
      breezy: {
        csrfToken: 'token123'
      }
    }

    let props = mapStateToProps(slice, {pageKey: '/foo'})
    expect(props).toEqual({heading: 'hi', pageKey: '/foo', csrfToken: 'token123'})
  })
})
