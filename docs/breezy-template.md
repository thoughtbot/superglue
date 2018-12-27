# BreezyTemplate

## The BreezyTemplate DSL

BreezyTemplate is a queryable Server-generated Javascript Response \(SJR\) templating library based on JBuilder that builds the props your container components receive. It has support for partials, russian-doll caching, and can selectively render paths of your props tree without executing others. It supports most of JBuilder syntax, but it does have a few key [differences](breezy-template.md#differences-from-jbuilder).

Example:

```ruby
json.menu do
  # all keys will be formatted as camelCase for JS
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

json.flash flash.to_h

json.footer nil, partial: 'footer'
```

In general, BreezyTemplate functionality like partials or deferment, can only be enabled as options on a node.

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

### Lists

To support [filtering nodes](breezy-template.md#filtering-nodes), any list passed to `array!` must implement `member_at(index)` and `member_by(attr, value)`. For example, if you were using a delegate:

```text
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

```text
data = ObjectCollection.new([{id: 1, name: 'foo'}, {id: 2, name: 'bar'}])

json.array! data do
  ...
end
```

Similarly for ActiveRecord:

```text
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

```text
json.array! Post.all do
  ...
end
```

#### **Array core extension**

For convenience, BreezyTemplate includes a core\_ext that adds these methods to `Array`. For example:

```text
require 'breezy_template/core_ext'
data = [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]

json.posts
  json.array! data do
    ...
  end
end
```

Unfortunately, BreezyTemplate doesn't know what the elements are in your collection. The example above will be fine for [filtering](breezy-template.md#filtering_nodes) by index `\posts?_bz=posts.0`, but will raise a `NotImplementedError` if you filter by attribute `/posts?_bz=posts.id=1`. So you may still have to provide your own delegator.

### Partials

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

### Partial Fragments

Breezy does not normalize your store, instead it relies on your partial's metadata to make it easy to update cross cutting concerns like a shared header. To enable this behavior, we use the `fragment_name` option.

A fragment helps to identify a rendered partial across the all pages. For example, to update all your headers across all pages like so:

```javascript
switch(action.type) {
case SOME_ACTION: {
  return produce(state, draft => {
    Object.entries(state).forEach(([pageKey, {fragments=[]}]) => {
      fragments['header'].forEach(pathToFragment => {
        const node = getIn(draft, ['data', pathToFragment].join('.'))
        node.profile.address = '123 new st.'
      })
    })
  })
}
default:
  return state
}
```

You would need use partials and add the option `fragment_name: 'header'`. Then the key `header` will be accessible in your page's fragments.

```ruby
# index.js.breezy
json.header null, partial: ["header", fragment_name: 'header']


# _profile.js.breezy
json.profile do
  json.address do
    json.state "New York City"
  end
end
```



When using fragments with Arrays, the argument **MUST** be a lamda that returns a string:

```ruby
require 'breezy_template/core_ext' #See (lists)[#Lists]

json.array! ['foo', 'bar'], partial: ["footer", fragment_name: ->(x){"somefoo_#{x}"}]
```

### Caching

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

### Deferment

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

If `:manual` is used, Breezy will no-op the block and do nothing after it recieves the response. Its up to you to use [node filtering](breezy-template.md#filtering_nodes) to fetch the node seperately. A common usecase would be tab content that does not load until you click the tab.

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

## Differences from JBuilder

### Blocks, Arrays, Sets are NOT additive.

The last one wins! So

```ruby
json.author do
  json.name 'john'
end

json.author do
  json.age '30'
end
```

would only produce

```text
{author: {age: 30}}
```

* No shortcut `extracts!` syntax. This means, in order to do something like this:

```ruby
json.author person, :name, :age

or

json.(person, :name, :age)
```

you have to use `extract!` explicity

```ruby
json.extract! person, :name, :age
```

### No collection shortcuts

So this:

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

### Change in Array! method signature

`json.array!` method signature is `json.array!(collection, options) {}`. So this

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

### No JBuilder objects

You can't pass JBuilder objects as values. The following will error out.

```ruby
to_nest = Jbuilder.new{ |json| json.nested_value 'Nested Test' }

json.set! :nested, to_nest
```

### Collections must implement interface

Any collection passed to `array!` must implement `member_at(index)` and `member_by(attr, value)`. See [lists](breezy-template.md#lists)

### key format defaulted to camelCase

Key formatting is defaulted to `camelCase`

