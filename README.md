# Relax
Relax makes it easy (even boring) to create single-page, multi-page, and sometimes-single-page applications with ReactJS and classic Rails.

**WARNING!!!!** this has not been officially released yet. There's still a bit of work left. If this library sounds interesting and you are interested in helping, feel free to reach out! Please don't submit to Hacker News.

## What you can do:

1. Page to page transitions without reloading
2. Russian Doll cache aware JS content with structural sharing that makes implementing `shouldComponentUpdate` as easy as extending ReactJS's `PureComponent`
3. Defered rendering of slow loading parts of your page without API endpoints (e.g. dashboards that load later on direct visits)
4. Async actions that load different parts of your page without API endpoints (e.g. pagination, infinite scroll)


Relax is the lovechild of Turbolinks (also a hard fork), Server Generated Javascript Responses (created with BathTemplates), and ReactJS that bring you all of the above features while keeping complexity low.

Unlike Turbolink's view-over-the-wire approach, a Relax app is content-over-the-wire to your ReactJS frontend. Each controller gets two views, one for your content that you write using the included BathTemplates, and the other for your markup which you write in ReactJS. Relax features are achieved with `XMLHTTPRequest`s for the next page's content (or a branch of it via key paths) before firing a `relax:load` event that you can use with `ReactDOM.render`.

## Quick Peek
Starting with a Rails project with Relax [installed](#installation), ReactJS in your asset pipeline, and [something](https://github.com/reactjs/react-rails) [to](https://github.com/Shopify/sprockets-commoner) transform JSX to JS.

Add a route and controller as you normally would.
```ruby
# config/routes.rb
resources :posts

# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  # Allow relax to take over HTML requests
  before_action :use_relax_html

  def index
    @greeting = 'hello'
  end

  def new
    ....some stuff here...
  end
end
```

Use the included BathTemplates to create your content.

```ruby
#app/views/posts/index.js.bath

json.heading @greeting

# `defer: true` will no-op the following block on a direct
# visit and append additional javascript in the response to
# fetch only this content node (no-oping other sibiling blocks)
# and graft it in the right place on the client side.
json.dashboard(defer: true) do
  sleep 10
  json.num_of_views 100
end

# Go ahead, use your rails helpers, including i18n.
json.new_post_path new_post_path

json.footer 'something'
```

Then write your remaining view in JSX. The content you wrote earlier gets passed here.

```ruby
# app/assets/javascripts/views/PostIndex.js.jsx

App.Views.PostsIndex = function(json) {
  // Deferment will use `null` as the standin value.
  // Hence the need for `json.dashboard || {}`.
  // Relax will then fetch the missing node
  // and call `ReactDOM.render` a second time

  var dashboard = json.dashboard || {};

  return (
    <h1> {json.heading}</h1>
    <div> {dashboard.num_of_views} </div>

    # Page to page without reloading
    <a href={json.new_post_path} data-rx-remote> Create </a>

    <div>{json.footer}</div>
  )
}
```

## Installation
Relax does not include ReactJS, you'll have to download it seperately and include it in your path. Or just include [react-rails](https://github.com/reactjs/react-rails).

```
gem 'relax', git: 'https://github.com/jho406/Relax.git'
```

Then use the provided installation generator:
```
rails g relax:install
```

If you need to add bath and JSX views:
```
rails g relax:view Posts new index
```

# Navigation and Forms
Relax intercepts all clicks on `<a>` and all submits on `<form>` elements enabled with `data-rx-remote`. Relax will `preventDefault` then make the same request using XMLHttpRequest with a content type of `.js`. If there's an existing request, Relax will cancel it unless the `data-rx-async` option is used.

Once the response loads, a `relax:load` event will be fired with the JS object that you created with BathTemplates. If you used the installation generator, the event will be set for you in the `<head>` element of your layout:

```javascript
document.addEventListener('relax:load', function(event){
  var props = {
    view: event.data.view,
    data:  event.data.data
  }
  ReactDOM.render(React.createElement(window.App.Components.View, props), document.getElementById('app'));
});
```

## The data-rx-* attribute API

Attribute          | default value            | description
-------------------|--------------------------|------------
`data-rx-remote`   | For `<a>` the default is `get`. For forms, the default is `post` if a method is not specified. | Use this to create seamless page to page transitions. Works for both links and forms. You can specify the request method by giving it a value, e.g `<a href='foobar' data-rx-remote=post>`. For forms, the request method of the form is used. `<form action=foobar method='post' data-rx-remote>`.
`data-rx-async`      | `false`                  | Fires off an async request. Responses are pushed into a queue will be evaluated in order of click or submit.
`data-rx-push-state` | `true`                   | Captures the element's URL in the browsers history. Normally used with `data-rx-async`.
`data-rx-silent`     | false                    | To be used with the `relax_silent?` ruby helper. Useful if you don't want to perform a redirect or render. Just return a 204, and Relax will not fire a `relax:load` event.


# Events
Event                 | Argument `originalEvent.data`  | Notes
----------------------|--------------------------------|-------
`relax:load`          | {data}                         | Triggered on document, when Relax has succesfully loaded content, to be used with `ReactDOM.render`. Yes the key is a bit weird. You have to access it like so `event.data.data`.
`relax:click`         | {url}                          | Triggered on the element when a form or a link enabled with data-rx-remote is clicked. Cancellable with event.preventDefault().
`relax:request-error` | null or {xhr}                  | Triggered on the element when on XHR onError (network issues) or when async option is used and recieves an error response.
`relax:request-start` | {url}                          | Triggered on the element just before a XHR request is made.
`relax:request-end`   | {url}                          | Triggered on the element, when a XHR request is finished.
`relax:restore`       | null                           | Triggered on document, when a page cached is loaded, just before `relax:load`

## JS API Reference

### Relax.visit

Usage:
```javascript
Relax.visit(location)
Relax.visit(location, { pushState, silent, async })
```
Performs an Application Visit to the given _location_ (a string containing a URL or path).

- If the pushState option is specified, Relax will determine wheather to add the visitation to the browsers history. The default value is `true`.
- If async is specified, Relax will make an async request and add the onload callback to a queue to be evaluated (calling `relax:load`) in order of fire. The default value is `false`, this means if there's an existing request or a queue of async requests, Relax will cancel all of them and give priority to the most recent call.
- If silent is specified, a request header X-SILENT will be set. use in tadem with the `relax_silent?` ruby method for when you want to perform an action but return a 204 instead of a redirect or render. Relax will ignore 204s and will not attempt to fire `relax:load`.


### Relax.graftByKeypath

Usage:
```javascript
Relax.graftByKeypath(keyPath, object, {type});
```
Place a new object at the specified keypath of Relax's content tree on the current page and across other pages in its cache. Parent objects are clone and `relax:load` is finally called.

When referencing an array of objects, you have the option of providing an id instead of an index. For example:

```
a.b.some_array_element_id_of_your_choice=1.c.d
```

If type is specified as `add`. Relax will push the object at the keyPath (assuming its an array) instead of of replacing.


### Relax.replace
Usage:
```javascript
Relax.replace({data, title, csrf_token, assets})
```
Replaces the current page content and triggers a `reload:load`. Normally used to inject content to Relax on a direct visit. Relax's generators will set this up for you.

## Ruby Helpers


### use_relax_html
Usage:
```ruby
  class PostController < ApplicationController
    before_action :use_relax_html
  end
```

On direct visits, Relax will render an empty page. If you used the installation generator, Relax will also inject your content view created by BathTemplates into a script header, then fire a `relax:load` event that you can use with `ReactDOM.render`.

### relax_silient?
Usage:

```
class PostController < ApplicationController
  def create
  ...
    if relax_silent?
      ...
    end
  end
end
```

Used in conjuction with `data-rx-silent` for `204` responses. Great for when you want to run a job and don't want to render anything back to the client.

## Bath Templates, your content view
BathTemplates is a sibling of JBuilderTemplates, both inheriting from the same [parent](https://github.com/rails/jbuilder/blob/master/lib/jbuilder.rb). Unlike Jbuilder, BathTemplate generates Server Generated Javascript and has a few differences listed below.

###Partials
Partials are only supported as an option on attribute or array! `set!`s.
Usage:

```ruby
# We use a `nil` because of the last argument hash. The contents of the partial is what becomes the value.
json.post nil, partial: "blog_post"

or

# Set @post as a local `article` within the `blog_post` partial.
json.post @post, partial: "blog_post", as: 'article'

or
# Add more locals
json.post @big_post, partial: "blog_post", locals: {email: 'tests@test.com'}

or

# Use a partial for each element in an array
json.array! @posts, partial: "blog_post", as: :blog_post
```

### Caching
Caching is only available as an option on an attribute and can be used in tandem with partials.

Usage:

```ruby
json.author(cache: ["some_cache_key"]) do
  json.first_name "tommy"
end

or

json.profile "hello", cache: "cachekey"

or

json.profile nil, cache: "cachekey", partial: "profile", locals: {email: "test@test.com"}
```


### No merge of duplicate `set!`s
Unlike Jbuilder, BathTemplates will not merge duplicate `set!`s. Instead, the last duplicate will override the first.

Usage:
```ruby
json.address do
  json.street '123 road'
end

json.address do
  json.zip 10002
end
```

would become

```json
{address: {zip:10002}}
```

### Deferment
You can defer rendering of expensive content using the `defer: true` option available in blocks. Behind the scenes BathTemplates will no-op the block entirely, replace the value with a `null` as a standin, and append a `Relax.visit(/somepath?_relax_filter=keypath.to.node)` to the response. When the client recieves the payload, `relax:load` will be fired, then the appended `Relax.visit` will be called to fetch and graft the missing node before firing `relax:load` a second time.

Usage:
```ruby
json.dashboard(defer: true) do
  sleep 10
  json.some_fancy_metric 42
end
```

#### Working with arrays
If you want to defer elements in an array, you should add a key as an option on `array!` to help relax generate a more specific keypath, otherwise it'll just use the index.

```ruby
data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]

json.array! data, key: :id do
  json.greeting defer: true do
    json.greet 'hi'
  end
end
```

### Filtering nodes
As seen previously, Relax can filter your content tree for a specific node. This is done by adding a `_relax_filter=keypath.to.node` in your URL param and setting the content type to `.js`. BathTemplates will no-op all node blocks that are not in the keypath, ignore deferment and caching (if an `ActiveRecord::Relation` is encountered, it will append a where clause with your provided id) while traversing, and return the node. Relax will then graft that node back onto its tree on the client side and call `relax:onload` with the new tree. This is done automatically when using deferment, but you can use this param separately in tandem with `data-rx-remote`.

For example, to create seamless ajaxy pagination for a specific part of your page, just create a link like the following:

```html
  <a href="posts?page_num=2&_relax_filter=key.path.to.posts" data-rx-remote> Next Page </a>
```

Filtering works off your existing route and content tree, so no additional API necessary.


##Running the tests

Ruby:

```
BUNDLE_GEMFILE=Gemfile.rails50 bundle
BUNDLE_GEMFILE=Gemfile.rails50 rake test
```

JavaScript:

```
bundle install
bundle exec blade runner
```
