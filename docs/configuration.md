# Configuration

The `rails breezy:install:web` step adds a [preconfigured entry point][https://github.com/jho406/Breezy/blob/master/breezy_rails/lib/install/templates/web/application.js] in `app/javascript/packs/application.js`. It sets up Breezy, Redux, and comes with a bare-bones `Nav` component.

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

Its also common to have multiple identifiers pointing to the same component for effects like modals:

```javascript
const identifierToComponentMapping = {
  'posts/index': PostIndex,
  'posts/show': PostIndex
}
```

## The Base url
```javascript
const baseUrl = ''
```

The base url that will be prefixed to all requests using `visit` and `remote`.

## Redux Persist
The generator will also install Redux-Persist for persisting modified state.

```javascript
const persistKey = window.BREEZY_INITIAL_PAGE_STATE.assets.filter( asset => asset.endsWith('.js'))
const persistConfig = {
  key: JSON.stringify(persistKey),
  storage,
}
```

The persist key is set to the JS asset fingerprint, this prevents the need to migrate data stored in storage.

## Custom Reducers
The generator will also add a `reducer.js` file for any custom reducer you'd like to add. Included in the reducer are a `pagesReducer` for any cross page updates and a `applicationRootReducer` for the entire store. The latter is used for Redux-Persist, which you can customize to your needs.

## Custom Visit and Remote

The `visit` and `remote` thunks can be customized in the provided `application_visit.js` file. Functionality like loading indicators can be added here.

## Configuring Reloads

Breezy will do a hard reload whenever a successful response returns new asset fingerprints. Add an initializer to control how Breezy tracks sprockets and webpack assets:

```ruby
# defaults
Breezy.configure do |config|
  config.track_sprockets_assets = ['application.js', 'application.css']
  config.track_pack_assets = ['application.js']
end
```

