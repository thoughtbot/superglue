# Overview

Superglue is a library that thoughtfully pairs Rails and React. Its built with
The Rails Way in mind and aims to provide a simple developer experience that is
on par with Hotwire, Stimulus, and Turbo. Confidently use Rails routes,
controllers, views as you normally would in a multi-page application and
integrate with React's vast ecosystem.


!!! warning
    Superglue is in active development as it approaches 1.0.  While its
    interface and behavior are stablizing, changes are expected.

## Who is it for?

Superglue is built from the ground up for Rails developers who

- Have a complex React integration and want to move back to to a simple rails
  workflow without giving up components already built.
- Want to use normal controllers, server side routing, views, helpers, etc. to
  develop interactive React applications
- Want to hit the ground running with React and easily access all the components
  that the React eco-system offers.
- Don't want to write another custom React integration
- Don't want to build APIs.
- Are tired of JS complexity and just want to get work done!

## One-stop shop

We know first hand how complex React can be, but we don't shy away from
complexity. We want to make things better for everyone and to that end, we
built a supporting cast of tooling under one shop to bring ease and consistancy
to your team.

<div class="grid cards" markdown>

-   __Superglue Rails__

    ---

    Integrates Superglue with Rails, and generates a new
    app.


-   __PropsTemplate__

    ---

    A very fast JSON builder. The secret sauce that enabled much more than just Rails/React integration

    [:octicons-arrow-right-24: props_template](https://github.com/thoughtbot/props_template)

-   __Humid__

    ---

    Server Side Rendering using MiniRacer and V8 isolates.

    [:octicons-arrow-right-24: Humid](recipes/ssr.md)

-   __Form Props__

    ---

    Just use Rails forms with React. Combine it with React
    components.

    [:octicons-arrow-right-24: form_props](https://github.com/thoughtbot/form_props)

</div>

## How does it work?

### It’s Rails

Superglue leans on Rails' ability to respond to different mime types on the
same route and divides the usual `foobar.html.erb` into three familiar
templates.

- `foobar.json.props` A presenter written in a jbuilder-like template that
  builds your page props.
- `foobar.js` Your page component that receives the props from above.
- `foobar.html.erb` Injects your page props into Redux when the browser loads
  it.

Shape your `props` to roughly how your components are presented. For example:

```ruby
json.header do
  json.username @user.username
  json.linkToProfile url_for(@user)
end

json.rightDrawer do
  json.cart(partial: 'cart') do
  end
  json.dailySpecials(partial: 'specials') do
  end
end

json.body do
  json.productFilter do
    form_props(url: "/", method: "GET") do |f|
      f.select(:category, ["lifestyle", "programming", "spiritual"])
      f.submit
    end
  end

  json.products do
    json.array! @products do |product|
      json.title product.title
      json.urlToProduct url_for(product)
    end
  end
end

json.footer do
  json.copyrightYear "2023"
end
```

Familiar Rails conveniences include [form props], a fork of `form_with` made for
React; the [flash] is integrated as a [Redux slice]; and [Unobtrusive Javascript] (UJS) helpers.

### It’s React

But there are no APIs! The above is injected as a script tag in the DOM so everything
loads in the initial request. Its added to [your Redux state] and passed to
`foobar.js` as props, for example:

```js
import React from 'react';
import { useSelector } from 'react-redux';
import { Drawer, Header, Footer, ProductList, ProductFilter } from './components';

export default function FooBar({ header, products = [], productFilter, rightDrawer, footer }) {
  const flash = useSelector((state) => state.flash);

  return (
    <>
      <p id="notice">{flash && flash.notice}</p>
      <Header {...header}>
        <Drawer {...rightDrawer} />
      </Header>

      <ProductList {...products}>
        <ProductFilter {...productFilter} />
      </ProductList>

      <Footer {...footer} />
    </>
  );
}
```

### It’s Turbolinks and UJS

At heart, Superglue is a fork of [Turbolinks 3], but instead of sending your
`foobar.html.erb` over the wire and swapping the `<body>`, it sends
`foobar.json.props` over the wire to your React and Redux app and swaps the
page component.

This behavior is opt-in. Superglue provides UJS helpers that you can use with
your React components to SPA transition to the next page.

```jsx
<a href=”/next_page” data-sg-visit> Next Page </a>
```

### It’s more!

Being able to easily use React in place of ERB isn't enough. Superglue’s secret
sauce is that your `foobar.json.props` is diggable; making any part of your page
dynamic by using a query string. It’s a simpler approach to Turbo Frames and
Turbo Stream.

Need to reload a part of the page? Just add a query parameter and combine with
the [UJS helper] attribute `data-sg-remote`:

```jsx
<Header {...header}>
  <Drawer {...rightDrawer} />

  <a data-sg-remote href="/some_current_page?props_at=data.rightDrawer.dailySpecials">
    Reload Daily Specials
  </a>
</Header>
```

The above will traverse `foobar.json.props`, grab `dailySpecials` while
skipping other nodes, and immutably graft it to your Redux store.

This works well for [modals], chat, streaming, and [more]!


