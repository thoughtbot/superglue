import React from 'react'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import Breezy, {
  rootReducer,
  remote,
  pageToInitialState,
} from '@jho406/breezy'
import {visit} from '@jho406/breezy/dist/action_creators'
import { StackNavigator } from 'react-navigation'

//Change the below when you have your first screen
const baseUrl = 'http://localhost:3000'
const initialPath = '/example'
const initialPage = {
  data: {},
  screen: 'ExampleScreen'
}

// Remove me when you have your first screen
import {View, Text} from 'react-native'
class ExampleScreen extends React.Component {
  render() {
    return (
      <View>
        <Text>Looks like you're up and running!</Text>
        <Text>Next create your rails routes and controllers as usual</Text>
        <Text>Then run the view generators `rails g breezy:view Post index -t mobile`</Text>
        <Text>When ready, remove this ExampleScreen from App.js</Text>
      </View>
    )
  }
}

// This mapping can be auto populate through
// Breezy generators, for example:
// Run `rails g breezy:view Post index --mobile`
const mapping = {
  ExampleScreen, //Remove me when you have your first screen
}


const navMapping = Object.entries(mapping).reduce((memo, [key, value])=> {
  return {[key]: {screen: value}}
}, {})


function start({url, baseUrl='', initialPage={}}) {
  const store = createStore(
    rootReducer,
    pageToInitialState(url, initialPage),
    applyMiddleware(thunk)
  )

  Breezy.connect(store)
  store.dispatch({type: 'BREEZY_SET_BASE_URL', baseUrl})

  // Uncomment below if you need to fetch on the initial screen
  // store.dispatch(visit({url}))

  const Nav = StackNavigator(navMapping, {
    initialRouteName: initialPage.screen,
    initialRouteParams: {url}
  })

  return class extends React.Component {
    render() {
      return <Provider store={store}>
        <Nav url={url}/>
      </Provider>
    }
  }
}


const App = start({
  url: initialPath,
  baseUrl,
  initialPage
})

export default App

