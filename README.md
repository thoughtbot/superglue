# Breezy
[![Build Status](https://travis-ci.org/jho406/Breezy.svg?branch=master)](https://travis-ci.org/jho406/Breezy)

Breezy brings the productivity and happiness of vanilla Rails to your multi or single page React, Redux, Rails application.

Out of the box, Breezy ships with an [opinionated state shape](#the-breezy-store-shape) for your Redux store, a set of thunks and selectors that work nicely with most usecases, immutable helpers, a jbuilder-forked library to build your container props, and a AJAX workflow that does not require you to build REST-ful APIs.

## Features
1. **The Best of Rails, React, and Redux** Use your convienent `link_to` helpers, bring in [out-of-the-box](https://ant.design/components/button/) React components, and, when you need to, get down and dirty with Redux.
2. **API ~~first~~ later development** Save the work for when you actually need it. With Breezy, you can build SPAs [without APIs](#how-does-it-work) and skip the hassle of building another set of routes/controllers/serializers/tests.
3. **All your resources in a single request** Classic multi-page applications already achieves this. Breezy just enhances your Rails views to make it work for React and Redux.
4. **Mix normal HTML and React pages.** Need some pages to be in React and some pages, maybe the login page, to be in plain ERB? No Problem!
5. **No Javascript Router** You do not need a javascript router for SPA functionality. Breezy uses lessons learned from `Turbolinks` and just re-uses the client facing Rails routes.

## How does it work?

Here's a view structure in vanilla Rails:

```
views/
  posts/
    index.html.erb
```

This is simple. There's only one route, and everything that the user sees is packed into `index.html.erb`. However, the more features `/posts` gets, the larger your ERB and the slower the page becomes.

Breezy offers another option in the myriad of possibilities for developers, one that sticks closer to a vanilla Rails workflow without the need for an additional set of routes, controllers, etc. Breezy does this:

```
views/
  posts/
    index.js.props <- your content
    index.jsx <- your markup as JSX

Note that there is no `post.html.xyz` anymore, Breezy takes care of that by rendering a blank `post.html` so that React/Redux can take over. You can override this behavior if you'd like.
```

Your props lives as a [queryable](#filtering-nodes) and [deferable](#deferment) tree written using [jbuilder-like syntax](#breezytemplate) that gets served at `/posts.js`, while your markup lives as a JSX component and gets rendered by React when `/posts.html` loads. The props are injected through a provided `mapStateToProps` selector that you can import for your react-redux `connect` function:

```javascript
import {mapStateToProps, mapDispatchToProps, withBrowserBehavior} from '@jho406/breezy'

class PostsIndex extends React.Component {
  constructor (props) {
    super(props)
    const {visit, remote} = withBrowserBehavior(props.visit, props.remote)
    this.visit = visit.bind(this)
    this.remote = remote.bind(this)
  }

  ...
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostsIndex)
```

Then use one of the provided thunks for SPA functionality. For example,

```javascript

to visit a page without reloading:
this.visit('/next_page', {..fetchOpts})

or selectively reload parts of the current page:
this.remote('?_bz=header.shopping_cart', {..fetchOpts})
```

The last example will query for a node from `index.js.props`, noop unrelated nodes, and immutably update the equivalent keypath in your Redux store.

By sitting on a different mimetype, there are no additional routes that we have to add to our `routes.rb` beyond the client facing ones. And since the relationship between the `index.props` and `index.jsx` is always one-to-one, we can get away with just integration tests. This means less testing, less code, and greater productivity.

### And Navigation?

Breezy started as a fork of Turbolinks 3/Turbograft, and works in similar fashion. As soon as you use `visit` or `remote`, Breezy will request the props of `your_next_page.js.props`, add them to the redux store, push history, and render the correct component. Breezy will also manage the back button for you, pressing back will restore the `previous_page.js.props` and render the previous component.

## Installation

Make sure you have webpacker installed on your Rails application.

```
bundle exec rails webpacker:install:react
```

1. Remove Turbolinks from your project. Breezy is actually a fork of Turbolinks 3/Turbograft, and shares many of the same strategies for page-to-page transitions. Unfortunately, this means it conflicts with Turbolinks at the moment.


2. Add the following to your Gemfile and run bundle
```
gem 'breezy'
```

3. Run the installation generator
```
rails breezy:install:web
```

4. Generate a scaffold
```
rails generate scaffold post body:string --force --no-template-engine --breezy
```

### Configuration
The `rails breezy:install:web` step adds a preconfigured entrypoint to `app/javascript/packs/application.js`. It sets up Breezy, Redux, and comes with a bare bones `Nav` component.

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

#### Custom reducers
If you find yourself needing functionality beyond what the default reducers provide, ensure that you know how [Breezy shapes it store](#how-does-it-look-like), and take alook at the following example on how to update content using breezy's immutability helpers:

```javascript
import {setIn} from '@jho406/breezy/dist/immutability'

export function uploadReducer (state = {}, action) {
  switch(action.type) {
  case 'USER_UPLOADS_FILES': {
    const {pageKey, keypath, files} = action
    const fullPath = [pageKey, 'data', keypath].join('.')
    const nextState = setIn(state, fullPath, value)

    return nextState
  }
}
```

#### Rails Initializer
Breezy will do a hard reload whenever the asset fingerprints change. Add an initializer to control how Breezy tracks sprockets and webpack assets:

```ruby
# defaults
Breezy.configure do |config|
  config.track_sprockets_assets = ['application.js', 'application.css']
  config.track_pack_assets = ['application.js']
end
```

## React Redux helpers
```javascript
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'

....

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyComponent)
```

### API

#### mapStateToProps
An out of the box `mapStateToProps` to be used with react-redux's `connect`.

Breezy will include all props you build in your `xyz.js.props` and the following:

prop | Notes
--- | ---
csrfToken | Breezy will automatically append this to your `POST`, `PUT`, and `DELETE` requests, but if you need to write your own fetch, this prop is available to your components.
pageKey | The pageKey Breezy used to fetch your `xyz.js.props` from the store.

#### mapDispatchToProps
A hash of thunks and useful immutable action creators to be used with react-redux's `connect`.

Here's what's included:
```javascript
export const mapDispatchToProps = {
  visit,
  remote,
  setInPage,
  delInPage,
  extendInPage,
  setInJoint,
  delInJoint,
  extendInJoint,
}
```


## Built-in Thunks
Breezy comes with 2 then-able thunks that should fulfill 90% of your needs. By default they don't add any additional behavior beyond updating the store. I recommend combining it with `withBrowserBehavior` for a reasonable navigation experience.

### API

#### visit
Makes an ajax call to a page, pushes to `History`, and sets the response to the `pages` store. Use `visit` when you want full page-to-page transitions on the user's last click.

```javascript
visit(pathQuery).then(({rsp, page, pageKey, screen, needsRefresh, canNavigate}) => {})

visit(pathQuery, {...fetchRequestOptions}).then(({rsp, page, pageKey, screen, needsRefresh, canNavigate}) => {})

visit(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, pageKey, screen, needsRefresh, canNavigate}) => {})

visit(pathQuery, {...fetchRequestOptions}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})

```

Arguments | Type | Notes
--- | --- | ---
pathQuery| `String` | The path and query of the url you want to fetch from. The path will be prefixed with a `BASE_URL` that you configure.
fetchRequestOptions | `Object` |  Any fetch request options. Note that breezy will override the following headers: `accept`, `x-requested-with`, `x-breezy-request`, `x-xhr-referer`, `x-csrf-token`, and `x-http-method-override`.
pageKey | `String` | Optional. The key that breezy will use to store the recieved page. You wouldn't normally use this when using the visit thunk. If not specified, Breezy will use the response's `x-response-url` (reserved for Breezy's use), or `content-location` headers. It is [recommended](#setting-the-content-locatio) to use `response.set_header("content-location", new_todo_path)` in your `create` and `update` methods.

Callback options | Type | Notes
--- | --- | ---
canNavigate | `Boolean` | There can only be one visit anytime. If 2 visits happen at the same time, both will be fufilled, but only the last one will be passed a `canNavigate = true` in its callback.
needsRefresh | `Boolean` | If the new request has new JS assets to get - i.e., the last fingerprint is different from the new fingerprint, then it will return true.
screen | `String` | The screen that your react application should render next.
page | `Object` | The full parsed page response from your `foobar.js.props` template.
rsp | `Object` | The raw response object
pageKey | `String` | Location in the Breezy store where `page` is stored.


Additional `.catch` error attributes* | Type | Notes
--- | --- | ---
fetchArgs | `Array` | The arguments passed to `fetch`, as tuple `[url, {req}]`. You can use this to implement your own retry logic.
url | `String` | The full url, passed to `fetch`.
pageKey | `String` | Location in the Breezy store where `page` is stored


#### remote
Remote DOES NOT affect your `History`. Remote makes an ajax call and saves the response to the `pages` store in async fashion. Use this if you want to [update parts](#filtering-nodes) of the current page or preload other pages.

```javascript
remote(pathQuery, {}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).then(({rsp, page, screen, needsRefresh, canNavigate}) => {})

remote(pathQuery, {...fetchRequestOptions}, pageKey).catch(({message, fetchArgs, url, pageKey}) => {})

```

Shares the same arguments as `visit` with a few key differences:

1. You must explicitly provide it with a `pageKey`. This is to prevent async requests from saving into the wrong state. Use with the included `mapStateToProps`, which provides a `this.props.pageKey`. For example:

```
this.props.remote(url.toString(), {}, this.props.pageKey)
```

You can also wrap this function with sane defaults using `withBrowserBehavior` which will [automatically](#withBrowserBehavior) add the `pageKey` for you.

2. `canNavigate` is not available as an option passed to your then-able function.

#### withBrowserBehavior
Enhances `visit` and `remote` with navigation behavior on the returned Promises. For example, if the request `500`s, Breezy will navigate to '/500.html'. You can read the full behavior [here](https://github.com/jho406/Breezy/blob/master/breezy/lib/utils/react.js#L131).

```javascript
  constructor (props) {
    const {visit, remote} = withBrowserBehavior(props.visit, props.remote)
    this.visit = visit.bind(this)
    this.remote = remote.bind(this) //Note that the wrapped remote will automatically add the `pageKey` parameter for you. You do not need to explicity provide it if you wrap it.
  }
```

Arguments | Type | Notes
--- | --- | ---
visit| `Function` | The visit function injected by `mapDispatchToProps`
remote| `Function` | The remote function injected by `mapDispatchToProps`. The wrapped `remote` function will add the `pageKey` argument automatically for you.

### Filtering nodes
Breezy can filter your content tree for a specific node. This is done by adding a `_bz=keypath.to.node` in your URL param and setting the content type to `.js`. BreezyTemplates will no-op all node blocks that are not in the keypath, ignore deferment and caching (if an `ActiveRecord::Relation` is encountered, it will append a where clause with your provided id) while traversing, and return the node. Breezy will then graft that node back onto its tree on the client side.

Breezy's thunks will take care of most of the work for you:

For example:

```javascript
store.dispatch(visit('/?_bz=header.shopping_cart'))
```


### The Breezy store shape
How should you structure your store? Should I replicate my business models, like `User`, on the client side? Use an [ORM](https://github.com/tommikaikkonen/redux-orm) to manage it? How much should I denormalize or normalize? How much business logic should I bring over?


Breezy's store shape falls on the extreme end of denormalization, every page is given a node in the redux tree. There is likely duplication of state across children for example, a shared `User` header. Instead of normalizing state, Breezy give you tools that make it [super easy](#automatically-updating-cross-cutting-concerns) to update and manage cross-cutting concerns like a shared header.

Breezy's opinion is that its much saner to leave the business models to the backend, and shape state on the frontend for ~~only~~ mostly presentational purposes. In other words, there is no `User` model on the front end, just pages with `User`-like data.

#### How does it look like

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
If you want finer control, or want to perform optimistic updates, breezy provides [action creators](#setinpage) that will immutably update across `pages`.

## Rails controller helpers and behavior
### API
#### use_breezy_html
```ruby
class PostsController < ApplicationController
  # `use_breezy_html` returns a blank template, allowing for JSX to take over
  # on application.html.erb
  before_action :use_breezy_html

  def index
...
```

Renders a blank view, allowing for JSX to take over on `application.html.erb`. Its the equivalent of creating `index.html.erb` that contains nothing.

#### render
Breezy determines which React component to render for the controller action by using a combination of the class name and action name. For example, `PostIndex` or `AdminPostIndex` for namespaced controllers. You can specificy which component by passing additional options to the render method:

```ruby
  def index
    render :index, breezy: {screen: 'SomeOtherIndexScreen'}
  end
```

### Setting the content location

On non-GET requests, Breezy uses the response's `content-location` to create the key used to store your props. This is because when you render in a `create` or `update`, the returned response does not neccesarily reflect the url the user should see. For example, if i'm on `posts/new` and you make a POST request to `posts/`, you may render `posts/new` for any errors you'd like to show.

It is recommended that set this header in your `create` and `update` methods.

```
def create
  @post = Post.new(post_params)

  if @post.save
    redirect_to @post, notice: 'Post was successfully created.'
  else
    response.set_header("content-location", new_post_path)
    render :new, breezy: {screen: 'PostsNew'}
  end
end
```

## Immutability Helpers

### API
Breezy includes immutability helpers inspired by [Scour.js](https://github.com/rstacruz/scour) out of the box. You would need to use keypaths to traverse the prop tree. For example, given a page that looks like this:

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

or find first by its attribute and value

```
'posts.post_id=1.comment.0.body'
```

The above would find the first occurance where `post_id=1` before continuing traversing.

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
setInPage({pagekey, keypath, value})
```

At the page specificed by the URL, traverses to the node by keypath and immutably set the value.

```javascript
this.props.setInPage({
  pageKey: '/foo?bar=5',
  keypath: 'header.cart.total',
  value: 100
})

```


#### extendInPage
```javascript
extendInPage({pageKey, keypath, value})
```

At the page specificed by the URL, traverses to the node by keypath and immutably extend the value.

```javascript
this.props.extendInPage({
  pageKey: '/foo?bar=5',
  keypath: 'header.cart',
  value: {total: 100}
})

```

#### delInPage
```javascript
delInPage({pageKey, keypath})
```

At the page specificed by the URL, traverses to the node by keypath and immutably delete the value.

```javascript
this.props.delInPage({
  pageKey: '/foo?bar=5',
  keypath: 'header.cart'
})

```


## BreezyTemplate
BreezyTemplate is a queryable Server-generated Javascript Response (SJR) templating library based on JBuilder that you use to bulid the props that your container components receive. It has support for partials, russian-doll caching, and can selectively render paths of your props tree without executing others. It supports most of JBuilder syntax, but it does have a few key [differences](#differences-from-jbuilder).

Example:
```ruby
json.menu do
  json.current_user do
    json.email current_user.email
    json.avatar current_user.avatar
    json.inbox current_user.messages.count
  end
end

json.dashboard(defer: :auto) do
  sleep 5
  json.complex_post_metric 500
end

json.posts do
  page_num = params[:page_num]
  paged_posts = @posts.page(page_num).per(20)

  json.list do
    json.array! paged_posts, key: :id do |post|
      json.id post.id
      json.description post.description
      json.comments_count post.comments.count
      json.edit_path edit_post_path(post)
    end
  end

  json.pagination_path posts_path
  json.current paged_posts.current_page
  json.total @posts.count
end

if notice
  json.notice notice
end

json.footer nil, partial: 'footer'
```

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

#### Lists
To support [filtering nodes](#filtering-nodes), any list passed to `array!` must implement `member_at(index)` and `member_by(attr, value)`. For example, if you were using a delegate:

```
class ObjectCollection < SimpleDelegator
  def member_at(index)
    at(index)
  end

  def member_by(attr, val)
    find do |ele|
      ele[attr] == val
    end
  end
end

```

Then in your template:

```
data = ObjectCollection.new([{id: 1, name: 'foo'}, {id: 2, name: 'bar'}])

json.array! data do
  ...
end
```

Similarly for ActiveRecord:

```
class ApplicationRecord < ActiveRecord::Base
  def self.member_at(index)
    offset(index).limit(1)
  end

  def self.member_by(attr, value)
    find_by(Hash[attr, val])
  end
end
```

Then in your template:

```

json.array! Post.all do
  ...
end
```


##### Array core extension
For convenience, BreezyTemplate includes a core_ext that adds these methods to `Array`. For example:

```
require 'breezy_template/core_ext'
data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]

json.posts
  json.array! data do
    ...
  end
end
```

Unfortunately, BreezyTemplate doesn't know what the elements are in your collection. The example above will be fine for [filtering](#filtering_nodes) by index `\posts?_bz=posts.0`, but will raise a `NotImplementedError` if you filter by attribute `/posts?_bz=posts.id=1`. So you may still have to provide your own delegator.

#### Partials
Partials are supported. The following will render the file `views/posts/_blog_posts.js.props`, and set a local variable `foo` assigned with @post, which you can use inside the partial.


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
Breezy does not normalize your store, instead it relies on your partial's metadata to make it easy to update cross cutting concerns like a shared header. To enable this behavior, we use the `joint` option.

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
# index.js.breezy
json.header null, partial: ["profile", joint: true]


# _profile.js.breezy
json.profile do
  json.address do
    json.state "New York City"
  end
end

```

You can also rename the joint.
```ruby
# index.js.breezy
json.header null, partial: ["profile", joint: 'super_header']
```

When using joints with Arrays, the argument **MUST** be a lamda that returns a string:

```ruby
require 'breezy_template/core_ext' #See (lists)[#Lists]

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
require 'breezy_template/core_ext' #See (lists)[#Lists]

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
You can defer rendering of expensive nodes in your content tree using the `defer: :auto` option. Behind the scenes BreezyTemplates will no-op the block entirely, replace the value with `undefined` as a standin, and append a bit of meta data to the response. When the client recieves the payload, breezy will use the meta data to issue a `remote` dispatch to fetch the missing node and graft it at the appropriate keypath on the client side.

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
If you want to defer elements in an array, you should specify which attribute you want to use to identify the uniqueness of the element via the `key` options. This helps Breezy generate a more specific keypath in its requests, otherwise it'll just use the index.

For example:

```ruby
require 'breezy_template/core_ext' #See (lists)[#Lists]
data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]

json.posts
  json.array! data, key: :some_id do |item|
    json.some_id item.id # the attribute i want to use as `key`.
    json.contact(defer: :auto) do
      json.address '123 example drive'
    end
  end
end
```

When Breezy receives the response, it will automatically kick off `remote(?_bz=posts.some_id=1.contact)` and `remote(?_bz=posts.some_id=2.contact)`.

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

4. `json.array!` method signature is `json.array!(collection, options) {}`. So this

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

6. Any collection passed to `array!` must implement `member_at(index)` and `member_by(attr, value)`. See [lists](#lists)

7. Key formatting via `json.key_format` is removed.


## Tutorial
Soon!
