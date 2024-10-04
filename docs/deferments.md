Sometimes you may want to load parts of your page later, like a slow sidebar, a
graph that takes extra time to load, or tab content that shouldn't appear
immediately. These scenarios are perfect use cases for Deferments.

Deferments are a low effort way to load content later, both automatically and
manually. Better yet, most of the work takes place in Rails land in your views.

## `defer: :auto`

This option make it easy to defer content in a single setting.

=== "views/posts/index.json.props"

    ``` ruby
      json.metrics(defer: [:auto, placeholder: {totalVisitors: 0}]) do
        sleep 10 # expensive operation
        json.totalVisitors 30
      end
    ```

=== "views/layouts/application.json.props"

    ``` ruby
      json.data do
        yield
      end
    ```

And that's it! 

### Behind the scenes

When a user lands on a page Superglue will receive

```json
{
  data: {
    metrics: {
      totalVisitors: 0
    }
  },
  defers:[
    {url: '/dashboard?props_at=data.metrics', type: "auto"}
  ],
  ...other
}
```

Your page components will receive `{metrics: {totalVisitors: 0}}` and render. Superglue will then
make a remote request:

```
remote("/dashboard?props_at=data.metrics")
```

10 seconds later the response succeeds with `{total_visitors: 30}`. Superglue
then immutably grafts that payload into the `/dashboard` page at the path
`data.metrics`. The page state would look like the following:

```
{
  data: {
    metrics: {
      totalVisitors: 30
    }
  },
  defers:[...others],
  ...other
}
```

Your page component finally recieves the new props and rerenders. For more
control, you may provide a `success_action` or `fail_action`, and Superglue
will dispatch these actions when the promise resolves successfully or fails.

```ruby
json.metrics(defer: [:auto, placeholder: {totalVisitors: 0}, success_action: "SUCCESS", fail_action: "FAIL"]) do
  sleep 10 # expensive operation
  json.totalVisitors 30
end
```

## `defer: :manual`

When you want control over when deferred content loads, e.g., tabbed content,
use `defer: :manual` to stop the content from loading

```ruby
json.metrics(defer: [:manual, placeholder: {totalVisitors: 0}]) do
  sleep 10 # expensive operation
  json.totalVisitors 30
end
```

and manually use `remote`

```
remote("/dashboard?props_at=data.metrics")
```


