# Superglue

Use classic Rails to build rich React Redux applications with **NO APIs** and
**NO client-side routing**.

[![Build Status](https://circleci.com/gh/thoughtbot/superglue.svg?style=shield)](https://circleci.com/gh/thoughtbot/superglue)

Superglue is a React Redux starter and library inspired by Turbolinks and designed
to complement classic Rails. You can enjoy the benefits of Redux state
management and React components without giving up the productivity of Rails form
helpers, UJS, tag helpers, the flash, cookie auth, and more.

## Caution

This project is in its early phases of development. Its interface, behavior,
and name are likely to change drastically before a major version release.

### No APIs

Instead of APIs, Superglue leans on Rail's ability to respond to different
[mime types](https://apidock.com/rails/ActionController/MimeResponds/InstanceMethods/respond_to)
on the same route. In a Superglue application, if you direct your browser to
`/dashboard.html`, you would see the HTML version of the content, and if you
went to `/dashboard.json` you would see the JSON version of the exact same
content down to the footer.

The end result would be something like this:

![No Apis](https://thoughtbot.github.io/superglue/images/no_apis.png)

### Powered by Classic Rails
Superglue is mostly classic Rails. Features like the flash, cookie auth, and URL
helpers continue to be useful. Here's a look at the directory structure of a
typical Rails application with Superglue.

```
MyRailsApp/
  app/
  views/
  dashboard/
    index.html.erb <- Mostly empty. Where `index.json.props` gets rendered as initial state
    index.js <- Your page component, will receive `index.json.props`. Gets packaged with application.js
    index.json.props <- will also respond to `.json` requests
```

### PropsTemplate
Powering these JSON responses is PropsTemplate, a traversable JSON templating DSL
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
  <a href='/posts' data-sg-visit={true} />
```

The above will request for `/posts` with an `accept` of `application/json`, and
when the client receives the response, swap out the current component for the
component the response asks for, and `pushState` on history.


#### Partial updates
Some features rely on updating some parts of the existing page. In
addition to `data-sg-visit` and it's equivalent `this.props.visit`, Superglue
also provides `data-sg-remote` or `this.props.remote`, which you can use to
update parts of your page in async fashion without changing `window.history`.

Imagine having to implement search, where you enter some text, hit enter, and
results would show without reloading the screen. In traditional applications,
you may need a new controller, routes, a discussion over versioning, JSON
serializer, plenty of new JS code, etc.

![haircuts](https://thoughtbot.github.io/superglue/images/haircuts.png)

With Superglue, this can be done in one line:

```javascript
  this.props.remote('/dashboard?qry=haircut&props_at=data.header.search')
```

The above will make a request to `/dashboard?qry=haircut`, walk your props to
the `data.header.search` node, return it in the response, and immutably graft it
in the exact same path on the redux store before finally letting React
re-render.

For more on what you can do, check out our documentation.

#### Server-Side Rendering
Server-Side Rendering is supported via [Humid](https://github.com/thoughtbot/humid).
See the [documentation for server-side rendering][ssr docs].

  [ssr docs]: ./recipes/server-side-rendering.md

## Documentation

Documentation is hosted on [Github pages](https://thoughtbot.github.io/superglue).

## Contributing

See the [CONTRIBUTING] document. Thank you, [contributors]!

  [CONTRIBUTING]: CONTRIBUTING.md
  [contributors]: https://github.com/thoughtbot/superglue/graphs/contributors

## Special Thanks

Thanks to [jbuilder](https://github.com/rails/jbuilder),
[scour](https://github.com/rstacruz/scour),
[turbolinks3](https://github.com/turbolinks/turbolinks-classic),
[turbograft](https://github.com/Shopify/turbograft/),
[turbostreamer](https://github.com/malomalo/turbostreamer)


