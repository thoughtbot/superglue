import React from 'react'
import parse from 'url-parse'
import {rootReducer} from './reducers'
import {setWindow, unsetWindow, hasWindow} from './window'
import {Nav} from './utils/react'
import connect from './connector'
import {withoutBZParams} from './utils/url'
import {persist} from './action_creators'

export {mapStateToProps, mapDispatchToProps, withBrowserBehavior} from './utils/react'
export {breezyReducer, pageReducer, rootReducer} from './reducers'
export {setWindow, unsetWindow}

export function stop () {
  unsetWindow()
}

export function argsForHistory (url, page) {
  const pathq = withoutBZParams(url)

  return [pathq, {
    breezy: true,
    pageKey: pathq,
    screen: page.screen
  }]
}

export function argsForNavInitialState (url, page) {
  return {
    screen: page.screen,
    pageKey: withoutBZParams(url)
  }
}

export function pageToInitialState (url, page) {
  return {
    pages: {[withoutBZParams(url)]: page}
  }
}

export function start ({window, baseUrl='', history, initialPage={}}) {
  let nav
  let url

  if (window) {
    setWindow(window)
    url = window.location.href
    history.replace(...argsForHistory(url, initialPage))

    nav = class extends React.Component {
      render () {
        return (
          <Nav
            mapping={this.props.mapping}
            initialState={argsForNavInitialState(url, initialPage)}
            history={history}
          />
        )
      }
    }
  }

  const csrfToken = initialPage.csrf_token

  return {
    reducer: rootReducer,
    Nav: nav,
    connect: function (store){
      connect(store)

      if(hasWindow()) {
        store.dispatch({
          type: 'BREEZY_HISTORY_CHANGE',
          url:  parse(url).href
        })
      }

      store.dispatch(persist({
        pageKey: withoutBZParams(url),
        page: initialPage,
        dispatch: store.dispatch,
      }))

      store.dispatch({type: 'BREEZY_SET_BASE_URL', baseUrl})
      store.dispatch({type: 'BREEZY_SET_CSRF_TOKEN', csrfToken})
    },
    initialState: pageToInitialState(url, initialPage)
  }
}

export default {
  start,
  stop
}
