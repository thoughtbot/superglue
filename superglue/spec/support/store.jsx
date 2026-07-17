import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../lib/reducers'

export const buildStore = (preloadedState) => {
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
