# Getting Started

## Installation

Make sure you have webpacker installed on your Rails application.

```text
bundle exec rails webpacker:install:react
```

Remove Turbolinks from your project. Breezy is actually a fork of Turbolinks 3/Turbograft, and shares many of the same strategies for page-to-page transitions. Unfortunately, this means it conflicts with Turbolinks at the moment.

Add the following to your Gemfile and run bundle

```text
gem 'breezy'
```

Run the installation generator

```text
rails breezy:install:web
```

Generate a scaffold

```text
rails generate scaffold post body:string --force --no-template-engine --breezy
```

## Configuration

The `rails breezy:install:web` step adds a preconfigured entrypoint to `app/javascript/packs/application.js`. It sets up Breezy, Redux, and comes with a bare bones `Nav` component.

The relevant parts to configuring Breezy is as follows:

```javascript
...bunch of imports...

// Mapping between your props template to Component
// e.g, {'posts/new': PostNew}
const screenToComponentMapping = {
}

const history = createHistory({}) // you will need the history library
const initialPage = window.BREEZY_INITIAL_PAGE_STATE // gets populated automatically
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
        mapping={this.props.mapping}
        history={history}
        initialPageKey={initialPageKey}
      />
    </Provider>
  }
}


document.addEventListener("DOMContentLoaded", function() {
  render(<App mapping={screenToComponentMapping}/>, document.getElementById('app'))
})
```

### The Nav Mapping

```javascript
const screenToComponentMapping = {
}
```

Breezy uses a mapping that you configure to determine which set of props to render \(the `screen`\) with which component. By default, the template's id \(path to file sans the Rails.root and any extensions\) is used as the screen. For example:

```ruby
class PostsController < ApplicationController
  before_action :use_breezy

  def new
  end
end
```

To link `new.js.props` with `new.jsx`, you would need to add the following to your mapping:

```javascript
const screenToComponentMapping = {
  'posts/new': PostNew
}
```

You can override this in the controller using the screen option:

```ruby
class PostsController < ApplicationController
  before_action :use_breezy

  def new
    render :new, breezy:{screen: 'helloworld'}
  end
end
```

```javascript
const screenToComponentMapping = {
  'helloworld': PostNew
}
```

## Configuring Reloads

Breezy will do a hard reload whenever the asset fingerprints change. Add an initializer to control how Breezy tracks sprockets and webpack assets:

```ruby
# defaults
Breezy.configure do |config|
  config.track_sprockets_assets = ['application.js', 'application.css']
  config.track_pack_assets = ['application.js']
end
```

