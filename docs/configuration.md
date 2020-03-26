# Configuration

The `rails breezy:install:web` step adds a preconfigured entrypoint to `app/javascript/packs/application.js`. It sets up Breezy, Redux, and comes with a bare bones `Nav` component.

The relevant parts to configuring Breezy is as follows:

```javascript
...bunch of imports...

// Mapping between your props template to Component
// e.g, {'posts/new': PostNew}
const screenToComponentMapping = {
}

const history = createHistory({}) // you will need the history library
const initialPage = window.BREEZY_INITIAL_PAGE_STATE // gets populated from application.html.erb
const baseUrl = '' //Normally blank, but you can change this if you are using react-native

const {reducer, initialState, initialPageKey, connect} = Breezy.start({
  window,
  initialPage,
  baseUrl,
  history
})

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk)
)

//Connect breezy to the store!
connect(store)

//And use the nav inside the provider
class App extends React.Component {
  render() {
    return <Provider store={store}>
      <Nav
        store={store}
        mapping={this.props.mapping}
        history={history}
        initialPageKey={initialPageKey}
      />
    </Provider>
  }
}


document.addEventListener("DOMContentLoaded", function() {
  render(<App mapping={identifierToComponentMapping}/>, document.getElementById('app'))
})
```

## The Nav Mapping

```javascript
// Mapping between your props template to Component
// e.g, {'posts/new': PostNew}
const screenToComponentMapping = {
}
```

Breezy uses a mapping that you configure to determine which set of props to render with which page component. If you used the generator, this is configured in `application.json.props` as a combination name of the controller and action.

```ruby
# application.json.props
json.component_identifier "#{params[:controller]}/#{params[:action]}"
```

To link `new.json.props` with `new.jsx`, add the following to your mapping:

```javascript
const identifierToComponentMapping = {
  'posts/new': PostNew
}
```

## The Base url
```
const baseUrl = '' //Normally blank, but you can change this if you are using react-native
```

The Base url that will be prefixed to all requests using `visit` and `remote`.

## Configuring Reloads

Breezy will do a hard reload whenever the asset fingerprints change. Add an initializer to control how Breezy tracks sprockets and webpack assets:

```ruby
# defaults
Breezy.configure do |config|
  config.track_sprockets_assets = ['application.js', 'application.css']
  config.track_pack_assets = ['application.js']
end
```

