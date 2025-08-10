# Shared data

If you have state that should be shared between all pages. Just use common Rails
patterns. Simply put them in your layout.

For example, in the generated `application.json.props`

```diff
path = request.format.json? ? param_to_dig_path(params[:props_at]) : nil

json.data(dig: path) do
+  json.header do
+    json.email "foo@foo.com"
+  end

  yield json
end
```

In the above, every page that gets rendered will have `header` as part of
the [page response]. 

You can also use partials:

```treeview
app/
|-- controllers/
|-- views/
|   |-- shared/
|   |   |-- _header.json.props
```

```diff
path = request.format.json? ? param_to_dig_path(params[:props_at]) : nil

json.data(dig: path) do
+  json.header(partial: 'shared/header') do
+  end
  yield json
end
```

## Advanced functionality
The above results in duplicate JSON nodes across our `pages`:

```json
{
  pages: {
    "/posts": {
      data: {
        header: {
          email: "foo@foo.com"
        }
      }
    },
    "/comments": {
      data: {
        header: {
          email: "foo@foo.com"
        }
      }
    },
  }
}
```

For most cases where you don't need client side updates, this may be good
enough. Its a fine tradeoff for simplicity.

In scenarios where you need client side updates, or you need to keep data
with semantic identity consistent across pages. Superglue encourages you to
use:

1. [Fragments](./fragments.md) for most situations
2. And [Redux](./redux.md) slices for more complex usecases.

!!! hint
    You may not need to use fragments or Redux slices. For some apps, the only
    slices you'll ever need is the generated `flash.js` slice that comes with the
    install step.