# Concepts

## Inspired by Turbolinks

Superglue is inspired by Turbolinks. When you click on a link like this:
`<a href='/posts' data-sg-visit={true} />`, Superglue fetches the next page's full
content in JSON and swaps it with the current page JSON before handing it
to your next React page component.

## Pages not models

Superglue comes with a simple and denormalized Redux state. Each node in the store
is a copy of your recently visited page in JSON. This concept is very similar
to Turbolink's [page cache][Turbolinks cache], but Superglue exposes the pages to
your Redux reducers to allow you to make optimistic updates.

For example, we can optimistically edit the header on the current and all
previous pages using a reducer.

```javascript
const applicationPagesReducer = (state = {}, action) => {
  switch(action.type) {

  case UPDATE_USER_HEADERS: {
    const nextPages = { ...state }
    const { email } = action.payload

    for (const key in nextPages) {
      if (nextPages[key].email) {
        nextPages[key].email = email
      }
    }

    return nextPages
  }

  default:
    return state
  }
}
```

## No APIs
There are no APIs to build. Instead, Superglue leans on Rail's ability to render
different mime types on the same route.

In a Superglue application, you write your page's content in JSON using
[PropsTemplate], inject that state in HTML, and write your markup in JSX.

Here's how that looks:

```
MyRailsApp/
  app/
  views/
  dashboard/
    index.html.erb <- where index.json.props gets rendered as initial state
    index.js <- Gets packaged with application.js
    index.json.props <- will also respond to `.json` requests
```

The routes remain simple:

```ruby
  resources :posts
```

When a user clicks on a link enabled with Superglue's UJS:

```jsx
  <a href='/posts' data-sg-visit={true} />
```

Superglue will specify the request's mime type as JSON, causing Rails to render
`index.json.props`, and respond with the full page's JSON for your next
page component to consume.

## Make updates easy

Any part of your page can be easily updated in as little as a single line of
code.

For example, here's how to refresh a chart with a button without any APIs:

```jsx
  <a href='/posts?props_at=data.dashboard.key_metrics_chart' data-sg-remote={true} />
```

[PropsTemplate] powers this interaction. Any template you build with
PropsTemplate is queryable using a param that you pass to the root node in your
`layout/application.json.props`:

```ruby
json.data(search: params[:props_at]) do
  json.sideBar do
    # gets skipped
  end
  json.dashboard do
    json.keyMetricsChart do
      #gets rendered
    end
  end
end
```

When the server receives a request, it will query your template and fetch ONLY
the `data.dashboard.key_metrics_chart` node without executing other nodes in
your template.

Finally, Superglue on the client-side will receive the node, immutably graft it
into your Redux state in the same exact path and hand it over to your
component to render.

The syntax of `props_at` is a keypath, here's another example using an array:

```jsx
  <a href='/posts?props_at=data.post_list.0.title' data-sg-remote={true} />
```

Read more about this in the [querying guide]

## Embrace UJS

You may have noticed that we've been using `data-sg-remote` or `data-sg-visit`
in the examples.

```jsx
  <a href='/posts?props_at=data.dashboard.key_metrics_chart' data-sg-visit={true} />
```

Superglue embraces Unobtrusive Javascript. Any link or form with a `data-sg`
attribute receives superpowers inspired by Rails data attributes.

For more advanced use cases, an action creator is passed to all your connected
components when using the included [React helpers]

For example:

```jsx
  this.props.visit('/posts?props_at=data.dashboard.key_metrics_chart')
  .then....
```


[PropsTemplate]: https://github.com/thoughtbot/props_template
[Turbolinks cache]: https://github.com/turbolinks/turbolinks#understanding-caching
[querying guide]: ./traversal-guide.md
[React helpers]: ./react-redux.md
