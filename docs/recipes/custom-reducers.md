# Custom reducers

Superglue generators will `yarn add reduce-reducers` and set up a `reducers.js`. If
you find yourself needing additional functionality beyond what the generated
reducers provide, just add your own reducers:

```javascript
....
import reduceReducers from 'reduce-reducers'
import {getIn} from '@thoughtbot/superglue'
import produce from "immer"

function myCustomReducer(state = {}, action) {
  ....
}

...

const store = createStore(
  combineReducers({
    superglue: superglueReducer,
    pages: reduceReducers(pagesReducer, applicationReducer),
    additionalFoobar: myCustomReducer
  }),
  initialState,
  applyMiddleware(thunk)
)
```

