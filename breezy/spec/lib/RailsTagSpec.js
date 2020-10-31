import { JSDOM } from 'jsdom'
import { render } from 'react-dom'
import React from 'react'
import RailsTag from '../../lib/components/RailsTag'

const createScene = (html) => {
  const dom = new JSDOM(`${html}`, { runScripts: 'dangerously' })
  return { dom, target: dom.window.document.body.firstElementChild }
}

describe('RailsTag', () => {
  it('renders nothing', () => {
    const { dom, target } = createScene('<div id="hello"></div>')
    render(
      <RailsTag html={''}/>,
      target
    )
    expect(target.innerHTML).toEqual('')
  })

  it('renders HTML', () => {
    const { dom, target } = createScene('<div id="hello"></div>')
    render(
      <RailsTag html={'<a id="ok"><span>hello</span></a>'}/>,
      target
    )
    expect(target.innerHTML).toEqual('<a id="ok"><span>hello</span></a>')
  })

  it('passes other props to the HTML', () => {
    const { dom, target } = createScene('<div id="hello"></div>')
    render(
      <RailsTag className="hello" html={'<a id="ok"><span>hello</span></a>'}/>,
      target
    )
    expect(target.innerHTML).toEqual('<a class="hello" id="ok"><span>hello</span></a>')
  })

  it('passes handlers', () => {
    const { dom, target } = createScene('<div id="hello"></div>')
    const handler = jasmine.createSpy()
    render(
      <RailsTag onClick={handler} html={'<a id="ok"><span>hello</span></a>'}/>,
      target
    )
    target.getElementsByTagName('a')[0].click()
    expect(handler).toHaveBeenCalled()
  })
})
