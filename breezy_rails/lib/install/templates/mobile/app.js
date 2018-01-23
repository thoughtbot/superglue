import React from 'react'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import Breezy from '@jho406/breezy'
import {visit} from '@jho406/breezy/dist/action_creators'
import { StackNavigator } from 'react-navigation'
import { reducer as formReducer } from 'redux-form'

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
  return {[key]: {screen: value}, ...memo}
}, {})

const {reducer, initialState, connect} = Breezy.start({
  initialPage,
  baseUrl
})

const store = createStore(
  combineReducers({
    ...reducer,
    form: formReducer
  }),
  initialState,
  applyMiddleware(thunk)
)

connect(store)
store.dispatch({type: 'BREEZY_SET_BASE_URL', baseUrl})

// Uncomment below if you need to fetch on the initial screen
store.dispatch(visit(initialPath))
window.store = store
const Nav = StackNavigator(navMapping, {
  initialRouteName: initialPage.screen,
  initialRouteParams: {pathQuery: initialPath},
  headerMode: 'none',
})

export default class extends React.Component {
  render() {
    return <Provider store={store}>
      <Nav pathQuery={initialPath}/>
    </Provider>
  }
}

