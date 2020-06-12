# Breezy

[![Build Status](https://travis-ci.org/jho406/Breezy.svg?branch=master)](https://travis-ci.org/jho406/Breezy)

Build modern React/Redux applications using classic Rails. Batteries included. Turbolinks inspired. APIs and client-side routing not required.

## At a Glance
Breezy bootstraps your Rails and React application, and helps with data and navigation. It makes page-to-page transitions and partial page updates painless to implement, and doesn't require any APIs or client-side routing.

Additionally, it offers deep integration with Rails and makes React feel like a view replacement for ERB. Features you enjoyed when working in classic Rails; form helpers, tag helpers, the flash, cookie auth; can continue to add value in your day-to-day.


### No APIs

Instead of APIs, Breezy leans on Rail's ability to respond to different [mime types](https://apidock.com/rails/ActionController/MimeResponds/InstanceMethods/respond_to) on the same route. In a Breezy application, if you direct your browser to `/dashboard.html`, you would see the HTML version of the content, and if you went to `/dashboard.json` you would see the JSON version of the exact same content down to the footer.

The end result would be something like this:

![No Apis](docs/images/no_apis.png)

### Powered by Classic Rails
Breezy is mostly classic Rails. Features like the flash, cookie auth, and url helpers continue to be useful. Here's a look at the directory structure of a typical Rails application with Breezy.

```
MyRailsApp/
  app/
    views/
      dashboard/
        index.html.erb <- where index.json.props gets rendered as initial state
        index.jsx <- Gets packaged with application.js
        index.json.props <- will also respond to `.json` requests
```

### PropsTemplate
Powering these JSON responses is PropsTemplate, a traversable JSON templating language inspired by JBuilder. With PropsTemplate you can specify a path of the node you want, and PropsTemplate will walk the tree to it, skipping execution of nodes that don't match the keypath.

![No Apis](docs/images/props_template.png)

### All together now!
Breezy comes with batteries that bring all the above concepts together to make building popular SPA features easy, painless, and productive.

#### SPA Navigation
A popular ask of SPAs is page-to-page navigation without reloading. If you were on `/dashboard` and you wanted to click on a link to go to `/posts` without a hard reload, you can use Breezy's own UJS attributes:

```jsx
  <a href='/posts' data-bz-visit={true} />
```


The above will request for `/posts` with an accept of `application/json`, and when the client receives the response, swap out the current component for the component the response asks for, and `pushState` on history.

#### Same-page updates
Other features of SPA rely on updating some part of the existing page. In addition to `data-bz-visit` and its equivalent `this.props.visit`, Breezy also provides `data-bz-remote` or `this.props.remote`, which you can use to update parts of your page in async fashion without changing `window.history`.

Imagine having to implement search, where you enter some text, hit enter, and results would show without reloading the screen. In traditional applications, you may need a new controller, routes, a discussion over versioning, JSON serializer, plenty of new JS code, etc.

![haircuts](docs/images/haircuts.png)

With Breezy, one line of code enough:

```javascript
  this.props.remote('/dashboard?qry=haircut&bzq=data.header.search')
```

The above will make a request to `/dashboard?qry=haircut`, walk your props to the `data.header.search` node, return it in a response, and immutably graft it in the exact same path on the redux store before finally letting React re-render.

For more on what you can do, check out our documentation.

## Documentation

Documentation is hosted on [Gitbook](https://jho406.gitbook.io/breezy). Be sure to select the correct version. `master` will always be in development.

## Special Thanks

Thanks to [jbuilder](https://github.com/rails/jbuilder), [scour](https://github.com/rstacruz/scour), [turbolinks3](https://github.com/turbolinks/turbolinks-classic), [turbograft](https://github.com/Shopify/turbograft/)
