# Configuration

The `rails breezy:install:web` step adds a preconfigured entry point to `app/javascript/packs/application.js`. It sets up Breezy, Redux, and comes with a bare-bones `Nav` component.

The relevant parts to configuring Breezy is as follows:

```javascript
...bunch of imports...

// Mapping between your props template to Component, you must add to this
// to register any new page level component you create. If you are using the
// scaffold, it will auto append the identifers for you.
//
// e.g {'posts/new': PostNew}
const identifierToComponentMapping = {
}

const history = createBrowserHistory({})
const initialPage = window.BREEZY_INITIAL_PAGE_STATE

// The base url is an optional prefix to all calls made by the `visit` and
// `remote` thunks
const baseUrl = ''

const {reducer, initialState, initialPageKey, connect} = Breezy.start({
  window,
  initialPage,
  baseUrl,
  history
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const {
  breezy: breezyReducer,
  pages: pagesReducer,
} = reducer

const store = createStore(
  combineReducers({
    breezy: breezyReducer,
    pages: reduceReducers(pagesReducer, applicationReducer),
  }),
  initialState,
  composeEnhancers(applyMiddleware(thunk))
)

// This ref is for Breezy's UJS handlers
const navigatorRef = React.createRef()

connect(store)

class App extends React.Component {
  //The Nav is bare bones. Feel free to inherit or replace the implementation.
  render() {
    return <Provider store={store}>
      <Nav
        store={store}
        ref={navigatorRef}
        mapping={this.props.mapping}
        history={history}
        initialPageKey={initialPageKey}
      />
    </Provider>
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const appEl = document.getElementById('app')
  if (appEl) {
    // Create the ujs event handlers. You can change the ujsAttributePrefix
    // in the event the data attribute conflicts with another.
    const {onClick, onSubmit} = ujsHandlers({
      navigatorRef,
      store,
      ujsAttributePrefix: 'data-bz'
    })

    appEl.addEventListener('click', onClick)
    appEl.addEventListener('submit', onSubmit)

    render(<App mapping={identifierToComponentMapping}/>, appEl)
  }
})

```

## The Nav Mapping

```javascript
// Mapping between your props template to Component
// e.g, {'posts/new': PostNew}
const identifierToComponentMapping = {
}
```

Breezy uses a mapping that you configure to determine which set of props to render with which page component. If you used the generator, this is configured in `application.json.props` as the virtual path of the template. For example: `posts/new`

```ruby
# application.json.props
json.component_identifier local_assigns[:virtual_path_of_template]
```

To link `new.json.props` with `new.jsx`, add the following to your mapping:

```javascript
const identifierToComponentMapping = {
  'posts/new': PostNew
}
```

## The Base url
```
const baseUrl = ''
```

The base url that will be prefixed to all requests using `visit` and `remote`.

## Configuring Reloads

Breezy will do a hard reload whenever a successful response returns new asset fingerprints. Add an initializer to control how Breezy tracks sprockets and webpack assets:

```ruby
# defaults
Breezy.configure do |config|
  config.track_sprockets_assets = ['application.js', 'application.css']
  config.track_pack_assets = ['application.js']
end
```

