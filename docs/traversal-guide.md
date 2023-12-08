# Digging

Superglue's thunks work hand-in-hand with [PropsTemplate] to query your JSON
template for nodes. This guide helps you understand how the tools work with
each other.

## The props_at param
The `props_at` param is a keypath to nodes in your tree and is used almost
exclusively with the `remote` thunk. On the PropsTemplate side, we pass that
param over to an internal node in order to walk your templates.

?> `props_at` can be used with `data-sg-visit`, but only combined with
`data-sg-placeholder` to [build placeholders].

[build placeholders]: ./navigation.md#placeholders

For example, with a template below.

```ruby
path = param_to_search_path(params[:props_at])
json.data(search: path) do
  json.header do
    json.search do
      # Results is a leaf node
      json.results Post.search(params[:some_search_str])
    end
  end

  json.content do
    json.barChart do
       ...bar chart data
    end

    ...
  end

  ...
end
```

To fetch the `json.search` node, we would need to walk to `data` then `header`
then `search`. Translating that to a remote call with a `props_at` param:

```js
remote('/dashboard?props_at=data.header.search&some_search_str=haircuts')
```

## Collections
There are two ways to query collections. Looking at the following example:

```ruby
path = param_to_search_path(params[:props_at])
json.data(search: path) do
  json.posts do
    json.array! @posts do |post|
      json.details do
        json.title post.title
      end
    end
  end
end
```

### Index-based selection
You may use an index-based key to fetch an item in a list like so:

```js
remote('/dashboard?props_at=data.posts.0.details')
```

To enable this functionality, you are required to implement `member_at(index)`
on the passed collection.

?> PropsTemplate includes a `Array` extension which delegates to `at`. If you've
used the Superglue generators, it will be included in an initializer.

While traversing by index works fine, it can lead the wrong post being updated
if your Redux state has changed by the time the request comes back.

### Attribute-based selection
Attribute-based keys for collections look like this:

```js
remote('/dashboard?props_at=data.posts.some_id=1.details')
```

Notice that we're now referencing the collection member by `some_id=1` instead
of index. This will fetch the node from the backend and graft it correctly in
Redux.

To enable this, you are required to implement `member_by(attribute, value)` on
the passed collection AND use the option `:key` in `json.array!`. For example:

```ruby
path = param_to_search_path(params[:props_at])
json.data(search: params[:props_at]) do
  json.posts do
    json.array! @posts, key: :some_id do |post|
      json.details do
        json.title post.title
      end

      # The following will be auto appended by the key: option
      # json.some_id post.some_id
    end
  end
end
```

## Partials

You can even query into partials.

```js
remote('/dashboard?props_at=data.posts.some_id=1.details')
```

```ruby
json.data(search: params[:props_at]) do
  json.posts(partial: 'list_of_posts')do
  end
end
```

```ruby
# list_of_posts.json.props
json.array! @posts , key: :some_id do |post|
  json.details do
    json.title post.title
  end

  # The following will be auto appended by the key: option
  # json.some_id post.some_id
end
```

!> When querying, Superglue will disable
[caching](https://github.com/thoughtbot/props_template#caching) and
[deferment](https://github.com/thoughtbot/props_template#deferment) until the
target node is reached.

That's the basics of traversing with Superglue. Many modern SPA functionality
can be achieved by just a few lines of code. For examples, see our recipes
section.

[PropsTemplate]: https://github.com/thoughtbot/props_template
