# Breezy

Frontend work in React and Redux doesn't need to be tedious. Breezy returns to the productivity and happiness of vanilla Rails and combines it with all the goodness of React and Redux.

Breezy saves you time by shipping with an opinionated state shape for your Redux store, a set of thunks and selectors that work nicely with most usecases, a jbuilder-forked library to build your container props, and a AJAX workflow that doesn't require you to build any APIs.

## Features
1. **A vanilla Rails workflow.** Breezy lets you use a classic multi-page workflow and still get all the benefits of React. Its like replacing ERB with JSX.
2. **No Private APIs.** Want a SPA, but don't like the hassle of building another set of routes/controllers/serializers/tests for your API? With Breezy, you don't need to!
2. **Less Javascript.** Go ahead and use your `link_to` helpers. Use your i18n helpers!
3. **Mix normal HTML and React pages.** Need some pages to be in React and some pages, maybe the login page, to be in plain ERB? No Problem!
4. **Use Rails routing.** You don't need a javascript router.
5. **Want to build React-native using the same Rails workflow?** We're working on it!

## How does it work?

Here's a typical view structure in classic rails:

```
views/
  posts/
    index.html.erb
```

The larger your application gets, the larger your ERB. Instead of jumping head first into the complexities of SPA and REST-ful endpoints. Breezy does the following:

```
views/
  posts/
    index.js.props <- your content goes here
    index.jsx <- your markup goes here
```

The idea is to separate your content from your markup. Your content props lives as a queryable tree written using jbuilder syntax that sits on a seperate mimetype. It then gets injected as props into your container component through a provided `mapStateToProps` selector that you can import for your react-redux `connect` function.

```javascript
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyComponent)
```

Then use one of the provided thunks for SPA functionality. For example, to selectively reload parts of your page:
```javascript
import {remote} from '@jho406/breezy/dist/action_creators'


store.dispatch(remote('?_bz=header.shopping_cart'))
```
The above will query for a node from `index.js.props`, and update the equivalent keypath in your store.

By sitting on a different mimetype, there are no additional API routes that we have to add to our `routes.rb` beyond the client facing ones. And since the relationship between content and markup is always one-to-one, we can get away with just integration tests. This means less testing, less code, and greater productivity.


## Installation

Make sure you have webpacker installed on your Rails application

1. Install BreezyJS

```
yarn add @jho406/breezy --save
```

2. Add the following to your Gemfile and run bundle
```
gem 'breezy'
```

3. Run the installation generator
```
rails breezy:install:web
```

4. Generate a view
```
rails g breezy:view Post index
```

### Configuration
The `rails breezy:install:web` step adds a preconfigured entrypoint to `app/javascript/packs/application.js`. It sets up Breezy, Redux, and comes with a bare bones Nav component.

The relevant parts to configuring Breezy is as follows:

```javascript
...bunch of imports...

// This mapping can be auto populate through
// Breezy generators, for example:
// Run `rails g breezy:view Post index`
const mapping = {
}

const history = createHistory({}) // you will need the history library
const initialPage = window.BREEZY_INITIAL_PAGE_STATE // gets populated automatically
const baseUrl = '' //Normally blank, but you can change this if you are using react-native

const {reducer, initialState, Nav, connect} = Breezy.start({
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
      <Nav mapping={mapping}/>
    </Provider>
  }
}
```

## The Breezy store shape
Breezy occupies 2 nodes in your Redux state tree.

```javascript
{
  breezy, // <-breezy's private store.
  pages, // where the results of your props live
  ...yourStuff
}
```

`pages` is where the results of your props templates live. Its a hash where the keys are the path of your visited url. Internally, it looks like this:
```javascript
pages: {
  '/bar': {
    data:{...propsFromBreezyTemplates},
    ...otherMetaInfoLikeCSRFTokensOrPartials
  },
  '/bar?foo=123': {
    data:{...propsFromBreezyTemplates},
    ...otherMetaInfoLikeCSRFTokensOrPartials
  },
  '/foo':{
    data:{...propsFromBreezyTemplates},
    ...otherMetaInfoLikeCSRFTokensOrPartials
  }
}

```

Breezy does not normalize the client state, infact there's likely duplication across all pages. For example, a header being duplicated across multiple pages.

Instead of normalizing state, Breezy provides tools that makes it easy to update cross-cutting concerns like a shared header.

### Automatically updating cross cutting concerns
Breezy can automatically update all `pages` using meta information about partial usage from the last request. You just have to add the option `joint: true` to your partials.

For example:
```ruby
json.header do
  json.cart 30
end
```

Extract your header into a partial and add the option `joint: true`
```ruby
json.header partial: ['header', joint: true]
```

### Manually updating cross cutting concerns
If you want finer control, or want to perform optimistic updates, breezy provides a set of `action_creators` that will immutably update across `pages`.


## Immutability Helpers

### API
Breezy includes immutability helpers inspired by (Scour.js)[https://github.com/rstacruz/scour] out of the box. You would need to use keypaths to traverse the prop tree. For example, given a page that looks like this:

```
'/posts': {
  posts: [
  {
    post_id: 1
    title: 'hello world'
    comments: [
      {
        comment_id: 1,
        body: 'Here's a comment
      }
    ]
  }
  ]
}
```

To reach the comment body you could do this:

```
'posts.0.comment.0.body'
```

or use Breezy's lookahead syntax

```
'posts.post_id=1.comment.0.body'
```

The above would find the first occurance where post_id=1 before continuing traversing.

#### setInJoint
```javascript
setInJoint({name, keypath, value})
```
Traverses to the node by joint name, then keypath, and immutably sets a value across all `pages`.
```javascript

this.props.setInJoint({
  name: 'header',
  keypath: 'cart.total',
  value: 100
})

```

#### extendInJoint
```javascript
extendInJoint({name, keypath, value})
```
Traverses to the node by joint name, then keypath, and immutably extends the value across all `pages`.
```javascript

this.props.extendInJoint({
  name: 'header',
  keypath: 'profile.address',
  value: {zip: 11214}
})

```

#### delInJoint
```javascript
delInJoint({name, keypath})
```
Traverses to the node by joint name, then keypath, and immutably delete the value across all `pages`.
```javascript

this.props.extendInJoint({
  name: 'header',
  keypath: 'profile.address',
  value: {zip: 11214}
})

```


#### setInPage
```javascript
setInPage({url, keypath, value})
```

At the page specificed by the URL, traverses to the node by keypath and immutably set the value.

```javascript
this.props.setInPage({
  url: '/foo?bar=5',
  keypath: 'header.cart.total',
  value: 100
})

```


#### extendInPage
```javascript
extendInPage({url, keypath, value})
```

At the page specificed by the URL, traverses to the node by keypath and immutably extend the value.

```javascript
this.props.extendInPage({
  url: '/foo?bar=5',
  keypath: 'header.cart',
  value: {total: 100}
})

```

#### delInPage({url, keypath})
```javascript
delInPage({url, keypath})
```

At the page specificed by the URL, traverses to the node by keypath and immutably delete the value.

```javascript
this.props.delInPage({
  url: '/foo?bar=5',
  keypath: 'header.cart'
})

```


## BreezyTemplate
BreezyTemplate is a queryable Server-generated Javascript Response (SJR) templating library based on JBuilder that you use to bulid the props that your container components receive. It has support for partials, russian-doll caching, and can selectively render paths of your props tree without executing others. It supports most of JBuilder syntax, but it does have a few key [differences](#differences_from_jbuilder).

### API

In general, BreezyTemplate functionality like partials or deferement, can only be enabled as options on a node.

For inline attributes, the first parameter is the value, and the last parameter are feature options.

```ruby
json.post @post, partial: "blog_post", some_feature: true
json.post @post, partial: ["blog_post", as: 'article'], some_feature: [true, {more_options: '123'}]
```

For blocks, the first parameter are always feature options.

```ruby
json.comments partial: "blog_post", some_feature: true do
end

#or

options = partial: ["blog_post", as: 'article'], some_feature: [true, {more_options: '123'}]

json.post options do
  json.title 'Hi!'
end
```


#### Partials
Partials are supported. The following will render the file views/posts/_blog_posts.js.props, and set a local variable `foo` assigned with @post, which you can use inside the partial.


```ruby
json.posts @post, partial: ["blog_post", as: 'foo']
```


More usage:

```ruby
# We use a `nil` because of the last argument hash. The contents of the partial is what becomes the value.
json.post nil, partial: "blog_post"

#or

# Set @post as a local `article` within the `blog_post` partial.
json.post @post, partial: ["blog_post", as: 'article']

#or
# Add more locals
json.post @big_post, partial: ["blog_post", locals: {email: 'tests@test.com'}]

#or

# Use a partial for each element in an array
json.array! @posts, partial: ["blog_post", as: :blog_post]
```

#### Partial Joints
Breezy does not denormalize your store, instead it relies on your partial metadata to make it easy to update cross cutting concerns like a header. To enable this behavior, we use the `joint` option.

For example, to update all your headers across all pages like so:

```javascript
extendInJoint({
  name: 'header',
  keypath: 'profile.address',
  value: {zip_code: 11214}
})
```

You would need use partials and add the option `joint: true`. Then the key `header` will be accessible by `extendInJoint`.

```ruby
### index.js.breezy
json.header null, partial: ["profile", joint: true]


### _profile.js.breezy
json.profile do
  json.address do
    json.state "New York City"
  end
end

```

You can also rename the joint.
```ruby
### index.js.breezy
json.header null, partial: ["profile", joint: 'super_header']
```

When using joints with Arrays, the argument **MUST** be a lamda:

```ruby
json.array! ['foo', 'bar'], partial: ["footer", joint: ->(x){"somefoo_#{x}"}]
```


#### Caching

Usage:

```ruby
json.author(cache: "some_cache_key") do
  json.first_name "tommy"
end

#or

json.profile "hello", cache: "cachekey" #

#or

json.profile nil, cache: "cachekey", partial: ["profile", locals: {foo: 1}]

#or nest it

json.author(cache: "some_cache_key") do
  json.address(cache: "some_other_cache_key") do
    json.zip 11214
  end
end

#or use it on arrays

opts = {
  cache: ->(i){ ['a', i] }
}
json.array! [4,5], opts do |x|
  json.top "hello" + x.to_s
end

#or on arrays with partials

opts = {
  cache: (->(d){ ['a', d.id] }),
  partial: ["blog_post", as: :blog_post]
}
json.array! @options, opts

```


#### Deferment
You can defer rendering of expensive content using the `defer: :auto` option. Behind the scenes BreezyTemplates will no-op the block entirely, replace the value with a `null` as a standin, and append a meta data to the response. When the client recieves the payload, breezy will use the meta data to issue an `remote` dispatch to fetch the missing node and graft it at the appropriate keypath on the client side.


Usage:
```ruby
json.dashboard(defer: :auto) do
  sleep 10
  json.some_fancy_metric 42
end
```

A manual option is also available:

```ruby
json.dashboard(defer: :manual) do
  sleep 10
  json.some_fancy_metric 42
end
```
If `:manual` is used, Breezy will no-op the block and do nothing after it recieves the response. Its up to you to use [node filtering](#filtering_nodes) to fetch the node seperately. A common usecase would be tab content that does not load until you click the tab.


#### Working with arrays
If you want to defer elements in an array, you should add a key as an option on `array!` to help breezy generate a more specific keypath, otherwise it'll just use the index.

```ruby
data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]

json.array! data, key: :id do
  json.greeting defer: :auto do
    json.greet 'hi'
  end
end
```

### Behavior with ActiveRecord
Breezy's `array!` has support for ActiveRecord objects if you decide to pass in an `ActiveRelation`.


Given this example:

```ruby
post = Post.create
post.notes.create title: 'first'
post.notes.create title: 'second'

json.hit do
  json.hit2 do
    json.array! post.notes do |x|
      json.title x[:title]
    end
  end
end
```

and this dispatch

```javascript
store.dispatch(remote('?_bz=hit.hit2.id=1'))
```

Breezy will append a `where(id: 1)` to `post.notes` when filtering for a node before continuing traversing your prop tree.


Similarly with this dispatch:


```javascript
store.dispatch(remote('?_bz=hit.hit2.0'))
```

Breezy will append a `offset(0).limit(1)` to `post.notes` when filtering for a node before continuing traversing your prop tree.


### Differences from JBuilder

1. Blocks, Arrays, Sets are NOT additive. The last one wins! So

```ruby
json.author do
  json.name 'john'
end

json.author do
  json.age '30'
end
```

would only produce
```
{author: {age: 30}}
```

2. No shortcut `extracts!` syntax. This means, in order to do something like this:

```ruby
json.author person, :name, :age

or

json.(person, :name, :age)
```

you have to use `extract!` explicity

```ruby
json.extract! person, :name, :age
```

3. No collection shortcuts. So this:

```ruby
json.comments comments do |comment|
  json.content comment.content
end
```

has to become this:


```ruby
json.comments do
  json.array! comments do |item|
    json.content item.content
  end
end
```


4. `json.array!` first args are options. So this

```ruby
json.array! comments, :content, :id
```

has to become this:

```ruby
json.comments do
  json.array! comments do |item|
    json.id item.id
    json.content item.content
  end
end
```


5. You can't pass JBuilder objects as values. The following will error out.

```ruby
to_nest = Jbuilder.new{ |json| json.nested_value 'Nested Test' }

json.set! :nested, to_nest
```


## Thunks
### API

#### visit

```javascript
visit(url, {contentType = null, method = 'GET', body = ''})
```

Makes an ajax call to a page, and sets the response to the pages store.

There can only be one visit anytime, subsequent calls to visit would turn any visits in already progress into a noop.

This thunk is normally used for page to page transitions.

#### remote
```javascript
remote(url, {contentType = null, method = 'GET', body = ''}
```

Makes an ajax call to a page, and sets the response to the pages store.

This is like a normal ajax request. `remote` will fire off and process responses without any flow control.

#### remoteInOrder
```javascript
remoteInOrder(url {contentType = null, method = 'GET', body = ''})
```

Mostly the same as [remote](#remote), the difference is that responses are put in a queue and evaluated in the order of when `remoteInOrder` was dispatched.

### Filtering nodes
Breezy can filter your content tree for a specific node. This is done by adding a `_bz=keypath.to.node` in your URL param and setting the content type to `.js`. BreezyTemplates will no-op all node blocks that are not in the keypath, ignore deferment and caching (if an `ActiveRecord::Relation` is encountered, it will append a where clause with your provided id) while traversing, and return the node. Breezy will then graft that node back onto its tree on the client side.

Breezy's thunks will take care of most of the work for you:

For example:

```javascript
store.dispatch(remote('?_bz=header.shopping_cart'))
```

### Data-attributes API
Breezy started out as a fork of Turbolinks/Turbograft and still retains a DOM attribute API for convienence. If you don't need optimistic updates, and are happy with Turbolinks like behavior, then this is for you.

#### data-bz-dispatch
Use one of the thunks provided by breezy

```html
<a href='/posts?_bz=path.to.node' data-bz-dispatch='visit'></a>

or

<a href='/posts?_bz=path.to.node' data-bz-dispatch='remote'></a>

or

<a href='/posts?_bz=path.to.node' data-bz-dispatch='remote-in-order'></a>

```

Also works with forms

```html
<form data-bz-dispatch=visit method='post'>
</form>
```

#### data-bz-method
Sets the request verb for the thunk

```html
<a href='/posts?_bz=path.to.node' data-bz-dispatch='visit' data-bz-method='POST'></a>
```


## Tutorial
Soon!
