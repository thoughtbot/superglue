# PropsTemplate

PropsTemplate is a direct-to-Oj, JBuilder-like DSL for building JSON. It has
support for Russian-Doll caching, layouts, and can be queried by giving the
root a key path.

[![Build
Status](https://circleci.com/gh/thoughtbot/props_template.svg?style=shield)](https://circleci.com/gh/thoughtbot/props_template)

It's fast.

PropsTemplate bypasses the steps of hash building and serializing
that other libraries perform by using Oj's `StringWriter` in `rails` mode.

![benchmarks](docs/benchmarks.png)

Caching is fast too.

While other libraries spend time unmarshaling,
merging hashes, and serializing to JSON; PropsTemplate simply takes
the cached string and uses Oj's [push_json](http://www.ohler.com/oj/doc/Oj/StringWriter.html#push_json-instance_method).

## Example:

PropsTemplate is very similar to JBuilder, and selectively retains some
conveniences and magic.

```ruby
json.flash flash.to_h

json.menu do
  json.currentUser do
    json.email current_user.email
    json.avatar current_user.avatar
    json.inbox current_user.messages.count
  end
end

json.dashboard(defer: :auto) do
  sleep 5
  json.complexPostMetric 500
end

json.posts do
  page_num = params[:page_num]
  paged_posts = @posts.page(page_num).per(20)

  json.list do
    json.array! paged_posts, key: :id do |post|
      json.id post.id
      json.description post.description
      json.commentsCount post.comments.count
      json.editPath edit_post_path(post)
    end
  end

  json.paginationPath posts_path
  json.current pagedPosts.current_page
  json.total @posts.count
end

json.footer partial: 'shared/footer' do
end
```

## Installation

```
gem 'props_template'
```

and run `bundle`.

Optionally add the [core ext](#array-core-extension) to an initializer if you
want to [dig](#digging) into your templates.

```ruby
require 'props_template/core_ext'
```


And create a file in your `app/views` folder like so:

```ruby
# app/views/posts/index.json.props

json.greetings "hello world"
```

You can also add a [layout](#layouts).

## API

### json.set! or json.\<your key here\>

Defines the attribute or structure. All keys are not formatted by default. See [Change Key Format](#change-key-format) to change this behavior.

```ruby
json.set! :authorDetails, {...options} do
  json.set! :firstName, 'David'
end

# or

json.authorDetails, {...options} do
  json.firstName 'David'
end


# => {"authorDetails": { "firstName": "David" }}
```

The inline form defines key and value

| Parameter | Notes |
| :--- | :--- |
| key | A json object key|
| value | A value |

```ruby

json.set! :firstName, 'David'

# or

json.firstName 'David'

# => { "firstName": "David" }
```

The block form defines key and structure

| Parameter | Notes |
| :--- | :--- |
| key | A json object key|
| options | Additional [options](#options)|
| block | Additional `json.set!`s or `json.array!`s|

```ruby
json.set! :details do
  # ...
end

or

json.details do
  # ...
end
```

The difference between the block form and inline form is
  1. The block form is an internal node. Functionality such as Partials,
  Deferment and other [options](#options) are only available on the
  block form.
  2. The inline form is considered a leaf node, and you can only [dig](#digging)
  for internal nodes.

### json.extract!
Extracts attributes from object or hash in 1 line

```ruby
# without extract!
json.id user.id
json.email user.email
json.firstName user.first_name

# with extract!
json.extract! user, :id, :email, :first_name

# => {"id" => 1, "email" => "email@gmail.com", "first_name" => "user"}

# with extract! with key transformation
json.extract! user, :id, [:first_name, :firstName], [:last_name, :lastName]

# => {"id" => 1, "firstName" => "user", "lastName" => "last"}
```

The inline form defines object and attributes

| Parameter | Notes |
| :--- | :--- |
| object | An object |
| attributes | A list of attributes |

### json.array!
Generates an array of json objects.

```ruby
collection = [ {name: 'john'}, {name: 'jim'} ]

json.details do
  json.array! collection, {...options} do |person|
    json.firstName person[:name]
  end
end

# => {"details": [{"firstName": 'john'}, {"firstName": 'jim'} ]}
```

| Parameter | Notes |
| :--- | :--- |
| collection | A collection that optionally responds to `member_at` and `member_by` |
| options | Additional [options](#options)|

To support [digging](#digging), any list passed
to `array!` MUST implement `member_at(index)` and `member_by(attr, value)`.

For example, if you were using a delegate:

```ruby
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

```ruby
data = ObjectCollection.new([
  {id: 1, name: 'foo'},
  {id: 2, name: 'bar'}
])

json.array! data do
  # ...
end
```

Similarly for ActiveRecord:

```ruby
class ApplicationRecord < ActiveRecord::Base
  def self.member_at(index)
    offset(index).limit(1).first
  end

  def self.member_by(attr, value)
    find_by(Hash[attr, val])
  end
end
```

Then in your template:

```ruby
json.array! Post.all do
  # ...
end
```

#### **Array core extension**

For convenience, PropsTemplate includes a core\_ext that adds these methods to
`Array`. For example:

```ruby
require 'props_template/core_ext'
data = [
  {id: 1, name: 'foo'},
  {id: 2, name: 'bar'}
]

json.posts
  json.array! data do
    # ...
  end
end
```

PropsTemplate does not know what the elements are in your collection. The
example above will be fine for [digging](#digging)
by index, but will raise a `NotImplementedError` if you query by attribute. You
may still need to implement `member_by`.

### json.deferred!
Returns all deferred nodes used by the [deferment](#deferment) option.

**Note** This is a [SuperglueJS][1] specific functionality and is used in
`application.json.props` when first running `rails superglue:install:web`


```ruby
json.deferred json.deferred!

# => [{url: '/some_url?props_at=outer.inner', path: 'outer.inner', type: 'auto'}]
```

This method provides metadata about deferred nodes to the frontend ([SuperglueJS][1])
to fetch missing data in a second round trip.

### json.fragments!
Returns all fragment nodes used by the [partial fragments](#partial-fragments)
option.

```ruby json.fragments json.fragments!  ```

**Note** This is a [SuperglueJS][1] specific functionality and is used in
`application.json.props` when first running `rails superglue:install:web`

## Options
Options Functionality such as Partials, Deferments, and Caching can only be
set on a block. It is normal to see empty blocks.

```ruby
json.post(partial: 'blog_post') do
end
```

### Partials

Partials are supported. The following will render the file
`views/posts/_blog_posts.json.props`, and set a local variable `post` assigned
with @post, which you can use inside the partial.

```ruby
json.one_post partial: ["posts/blog_post", locals: {post: @post}] do
end
```

Usage with arrays:

```ruby
# The `as:` option is supported when using `array!`
# Without `as:` option you can use blog_post variable (name is based on partial's name) inside partial

json.posts do
  json.array! @posts, partial: ["posts/blog_post", locals: {foo: 'bar'}, as: 'post'] do
  end
end
```

Rendering partials without a key is also supported using `json.partial!`, but use
sparingly! `json.partial!` is not optimized for collection rendering and may
cause performance problems. It's best used for things like a shared header or footer.

Do:

```ruby
json.partial! partial: "header", locals: {user: @user} do
end
```

or

```ruby
json.posts do
  json.array! @posts, partial: ["posts/blog_post", locals: {post: @post}] do
  end
end
```

Do NOT:

```ruby
@post.each do |post|
  json.partial! partial: "post", locals: {post: @post} do
  end
end
```

### Partial Fragments
**Note** This is a [SuperglueJS][1] specific functionality.

A fragment identifies a partial output across multiple pages. It can be used to
update cross cutting concerns like a header bar.

```ruby
# index.json.props
json.header partial: ["profile", fragment: "header"] do
end

# _profile.json.props
json.profile do
  json.address do
    json.state "New York City"
  end
end
```

When using fragments with Arrays, the argument **MUST** be a lamda:

```ruby
require 'props_template/core_ext'

json.array! ['foo', 'bar'], partial: ["footer", fragment: ->(x){ x == 'foo'}] do
end
```

### Caching
Caching is supported on internal nodes only. This limitation is what makes it
possible to for props_template to forgo marshalling/unmarshalling and simply
use [push_json](http://www.ohler.com/oj/doc/Oj/StringWriter.html#push_json-instance_method).

Usage:

```ruby
json.author(cache: "some_cache_key") do
  json.firstName "tommy"
end

# or

json.profile(cache: "cachekey", partial: ["profile", locals: {foo: 1}]) do
end

# or nest it

json.author(cache: "some_cache_key") do
  json.address(cache: "some_other_cache_key") do
    json.zip 11214
  end
end
```

When used with arrays, PropsTemplate will use `Rails.cache.read_multi`.

```ruby
require 'props_template/core_ext'

opts = { cache: ->(i){ ['a', i] } }

json.array! [4,5], opts do |x|
  json.top "hello" + x.to_s
end

# or on arrays with partials

opts = { cache: (->(d){ ['a', d.id] }), partial: ["blog_post", as: :blog_post] }

json.array! @options, opts do
end
```

### Deferment

You can defer rendering of expensive nodes in your content tree using the
`defer: :manual` option. Behind the scenes PropsTemplates will no-op the block
entirely and replace the value with a placeholder. A common use case would be
tabbed content that does not load until you click the tab.

When your client receives the payload, you may issue a second request to the
same endpoint to fetch any missing nodes. See [digging](#digging)

There is also a `defer: :auto` option that you can use with [SuperglueJS][1]. [SuperglueJS][1]
will use the metadata from `json.deferred!` to issue a `remote` dispatch to fetch
the missing node and immutably graft it at the appropriate keypath in your Redux
store.

Usage:

```ruby
json.dashboard(defer: :manual) do
  sleep 10
  json.someFancyMetric 42
end


# or you can explicitly pass a placeholder

json.dashboard(defer: [:manual, placeholder: {}]) do
  sleep 10
  json.someFancyMetric 42
end
```

A auto option is available:

**Note** This is a [SuperglueJS][1] specific functionality.

```ruby
json.dashboard(defer: :auto) do
  sleep 10
  json.someFancyMetric 42
end
```

Finally in your `application.json.props`:

```ruby
json.defers json.deferred!
```

#### Working with arrays
The default behavior for deferments is to use the index of the collection to
identify an element.

**Note** If you are using this library with [SuperglueJS][1], the `:auto` option will
generate `?props_at=a.b.c.0.title` for `json.deferred!`.

If you wish to use an attribute to identify the element. You must:

1. Use the `:key` option on `json.array!`. This key refers to an attribute on
your collection item, and is used for `defer: :auto` to generate a keypath for
[SuperglueJS][1]. If you are NOT using SuperglueJS, you do not need to do this.

2. Implement `member_at`, on the [collection](#jsonarray). This will be called
by PropsTemplate to when [digging](#digging)

For example:

```ruby
require 'props_template/core_ext'
data = [
  {id: 1, name: 'foo'},
  {id: 2, name: 'bar'}
]

json.posts
  json.array! data, key: :some_id do |item|
    # By using :key, props_template will append `json.some_id item.some_id`
    # automatically

    json.contact(defer: :auto) do
      json.address '123 example drive'
    end
  end
end
```

If you are using [SuperglueJS][1], it will automatically kick off
`remote(?props_at=posts.some_id=1.contact)` and `remote(?props_at=posts.some_id=2.contact)`.

## Digging

PropsTemplate has the ability to walk the tree you build, skipping execution of
untargeted nodes. This feature is useful for selectively updating your frontend
state.

```ruby
traversal_path = ['data', 'details', 'personal']

json.data(dig: traversal_path) do
  json.details do
    json.employment do
      # ...more stuff
    end

    json.personal do
      json.name 'james'
      json.zipCode 91210
    end
  end
end

json.footer do
  # ...
end
```

PropsTemplate will walk depth first, walking only when it finds a matching key,
then executes the associated block, and repeats until the node is found.
The above will output:

```json
{
  "data": {
    "name": 'james',
    "zipCode": 91210
  },
  "footer": {
    ...
  }
}
```

Digging only works with blocks, and will NOT work with Scalars
("leaf" values). For example:

```ruby
traversal_path = ['data', 'details', 'personal', 'name'] # <- not found

json.data(dig: traversal_path) do
  json.details do
    json.personal do
      json.name 'james'
    end
  end
end
```

## Nodes that do not exist

Nodes that are not found will remove the branch where digging was enabled on.

```ruby
traversal_path = ['data', 'details', 'does_not_exist']

json.data(dig: traversal_path) do
  json.details do
    json.personal do
      json.name 'james'
    end
  end
end

json.footer do
  # ...
end
```

The above will render:

```json
{
  "footer": {
    ...
  }
}
```

## Layouts
A single layout is supported. To use, create an `application.json.props` in
`app/views/layouts`. Here's an example:

```ruby
json.data do
  # template runs here.
  yield json
end

json.header do
  json.greeting "Hello"
end

json.footer do
  json.greeting "Hello"
end

json.flash flash.to_h
```

**NOTE** PropsTemplate inverts the usual Rails rendering flow. PropsTemplate
will render Layout first, then the template when `yield json` is used.


### Layouts in API-only Rails apps

If your controllers inherit from `ActionController::API` (typical in API-only Rails apps),
the layout feature won’t work out of the box, because `ActionController::API`
does not include layout support.

To enable layout rendering, you can include `ActionView::Layouts` manually,
then use `layout "your_own_layout"` as usual:

```ruby
module Api
  class BaseController < ActionController::API
    include ActionView::Layouts

    layout "api"
  end
end
```

Without this, Rails will silently skip the layout, which can be tricky to notice.

## Change key format
By default, keys are not formatted. This is intentional. By being explicit with your keys,
it makes your views quicker and more easily diggable when working in JavaScript land.

If you must change this behavior, override it in an initializer and cache the value:

```ruby
# default behavior
Props::BaseWithExtensions.class_eval do
  # json.firstValue "first"
  # json.second_value "second"
  #
  # -> { "firstValue" => "first", "second_value" => "second" }
  def key_format(key)
    key.to_s
  end
end

# camelCased behavior
Props::BaseWithExtensions.class_eval do
  # json.firstValue "first"
  # json.second_value "second"
  #
  # -> { "firstValue" => "first", "secondValue" => "second" }
  def key_format(key)
    @key_cache ||= {}
    @key_cache[key] ||= key.to_s.camelize(:lower)
    @key_cache[key]
  end

  def result!
    result = super
    @key_cache = {}
    result
  end
end

# snake_cased behavior
Props::BaseWithExtensions.class_eval do
  # json.firstValue "first"
  # json.second_value "second"
  #
  # -> { "first_value" => "first", "second_value" => "second" }
  def key_format(key)
    @key_cache ||= {}
    @key_cache[key] ||= key.to_s.underscore
    @key_cache[key]
  end

  def result!
    result = super
    @key_cache = {}
    result
  end
end
```

## Escape mode

PropsTemplate runs OJ with `mode: :rails`, which escapes HTML and XML characters
such as `&` and `<`.

## Contributing

See the [CONTRIBUTING] document. Thank you, [contributors]!

  [CONTRIBUTING]: CONTRIBUTING.md
  [contributors]: https://github.com/thoughtbot/props_template/graphs/contributors

## Special Thanks

Thanks to [turbostreamer], [oj], and [jbuilder] for the inspiration.

[1]: https://github.com/thoughtbot/superglue
[turbostreamer]: https://github.com/malomalo/turbostreamer
[jbuilder]: https://github.com/rails/jbuilder
[oj]: https://github.com/ohler55/oj/
