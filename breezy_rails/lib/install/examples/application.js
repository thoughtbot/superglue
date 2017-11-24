import React from 'react'
import { render } from 'react-dom'
import { start } from 'breezy'
import createHistory from 'history/createBrowserHistory'

const App = start({
  window: window,
  url: window.location.href,
  initialPage: window.BREEZY_INITIAL_PAGE_STATE,
  history: createHistory({})
})

// This mapping can be auto populate through
// Breezy generators, for example:
// Run `rails g breezy:view Post index`
const mapping = {
}

document.addEventListener("DOMContentLoaded", function() {
  render(<App mapping={mapping}/>, document.getElementById('app'))
})
