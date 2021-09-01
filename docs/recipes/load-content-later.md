# Loading content later

When parts of your page become slow, e.g, a metrics table that is expensive to
render:

```ruby
# /dashboard.json.props
json.header do
 ...
end

json.metrics do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```

A common approach is to load content in async fashion by building out another
set of routes, controllers, tests, with more work on the frontend to manage
state, call fetch, etc.

With Breezy, we can turn content async with a single setting.

```ruby
json.metrics(defer: :auto) do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```

With `defer: :auto`, PropsTemplate will render `order.json.props` as usual, but
without `json.metrics`, then when the content is received by the client, Breezy
will automatically make an `remote` request for anything that was skipped:

```javascript
remote('/dashboard?bzq=data.metrics')
```

It is up to you to handle the case when `metrics` starts out empty. For example:

```javascript
//...in your component

  render() {
    return (
      <div>
        {_.isEmpty(this.props.metrics) ? this.renderLoading() : this.renderDashboard()}
      </div>
    )
  }
```

Alternatively, you can use a placeholder like so:

```ruby
json.metrics(defer: [:auto, placeholder: {total_visitors: 0}]) do
  sleep 10 # expensive operation
  json.total_visitors 30
end
```

