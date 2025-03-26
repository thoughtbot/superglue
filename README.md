<div align="center" style="padding: 30px 0px 20px 0px;">
  <img src="https://thoughtbot.github.io/superglue/images/superglue.svg" data-origin="images/superglue.svg" alt="Logo" width=250>
</div>

# Superglue

Use classic Rails to build rich React Redux applications with **NO APIs** and
**NO client-side routing**.

[![Test superglue_js](https://github.com/thoughtbot/superglue/actions/workflows/build_js.yml/badge.svg)](https://github.com/thoughtbot/superglue/actions/workflows/build_js.yml)
[![libs.tech recommends](https://libs.tech/project/72386994/badge.svg)](https://libs.tech/project/72386994/superglue)

Superglue makes React and Redux as productive as Hotwire, Turbo and Stimulus.
Its inspired by Turbolinks and designed to feel like a natural extension of
Rails. Enjoy the benefits of Redux state management and React components
without giving up the productivity of Rails form helpers, UJS, tag helpers,
flash, cookie auth, and more.

### No APIs

Instead of APIs, Superglue leans on Rails' ability to respond to different
[mime types](https://apidock.com/rails/ActionController/MimeResponds/InstanceMethods/respond_to)
on the same route. In a Superglue application, if you direct your browser to
`/dashboard.html`, you would see the HTML version of the content, and if you
went to `/dashboard.json` you would see the JSON version of the exact same
content down to the footer.

The end result would be something like this:

![No Apis](https://thoughtbot.github.io/superglue/images/no_apis.png)

### Powered by Classic Rails
Superglue leans on Rails. Features like the flash, cookie auth, and URL
helpers continue to be useful. Here's a look at the directory structure of a
typical Rails application with Superglue.

```treeview
app/
|-- controllers/
|-- views/
|   |-- dashboard/
|   |   |-- index.jsx # The React page component
|   |   |-- index.json.props # The json for the page component
|   |   |-- index.html.erb
```

### PropsTemplate
Powering the JSON responses is PropsTemplate, a diggable JSON templating DSL
inspired by JBuilder. With PropsTemplate you can specify a path of the node you
want, and PropsTemplate will walk the tree to it, skipping the execution of nodes
that don't match the keypath.

![No Apis](https://thoughtbot.github.io/superglue/images/props_template.png)

### All together now!
Superglue comes with batteries that bring all the above concepts together to make
building popular SPA features easy, painless, and productive.

#### SPA Navigation
A popular ask of SPAs is page-to-page navigation without reloading. This is
easily done with Superglue's own UJS attributes inspired by Turbolinks:

```jsx
  <a href='/posts' data-sg-visit />
```

The above will request for `/posts` with an `accept` of `application/json`, and
when the client receives the response, swap out the current component for the
component the response asks for, and `pushState` on history.


#### Easy Partial updates
Some features rely on updating some parts of the existing page. Imagine
implementing type-ahead search. In traditional applications, you may need a new
controller, routes, a discussion over versioning, JSON serializer, plenty of
new JS code, etc.

![haircuts](https://thoughtbot.github.io/superglue/images/haircuts.png)

With Superglue, this can be done with a simple `onChange`

```js
import {NavigationContext} from '@thoughtbot/superglue'

const {remote} = useContext(NavigationContext)

const onChange = (e) => (
  remote(`/dashboard?qry=${e.target.value}&props_at=data.header.search`)}
)
```

With `props_at`, the above will make a request to `/dashboard?qry=haircut`,
dig your template for the `data.header.search` node, return it in the response,
and immutably graft it in the exact same path on the redux store before finally
letting React re-render.

For more on what you can do, check out our documentation.

#### Server-Side Rendering
Server-Side Rendering is supported via [Humid](https://github.com/thoughtbot/humid).
See the [documentation for server-side rendering][ssr docs].

  [ssr docs]: ./recipes/server-side-rendering.md

## Documentation

Documentation is hosted on [GitHub pages](https://thoughtbot.github.io/superglue).

## Contributing

Thank you, [contributors]!

  [contributors]: https://github.com/thoughtbot/superglue/graphs/contributors

## Special Thanks

Thanks to [jbuilder](https://github.com/rails/jbuilder),
[scour](https://github.com/rstacruz/scour),
[turbolinks3](https://github.com/turbolinks/turbolinks-classic),
[turbograft](https://github.com/Shopify/turbograft/),
[turbostreamer](https://github.com/malomalo/turbostreamer)
