# Overview

Superglue and friends [thoughtfully pairs Rails and React]. Its built with a
laser focus on The Rails Way and aims to provide a simple developer experience
on par with Hotwire, Stimulus, and Turbo. Confidently use Rails routes,
controllers, views as you normally would in a multi-page application and
integrate with React's vast ecosystem.

## Who is it for?

Superglue is built from the ground up for

- **The Rails developer**: For those of us who want to harness the full power
  of ALL of Rails --controllers, server-side routing, views, form helpers,
  and more — to create seamless, interactive React applications **without** the
  hassle of APIs and client side routing.

- **Teams fighting complexity**: Its not easy pivoting from complexity.
  Superglue empowers teams to take small steps back without giving up the
  effort invested in React components.

- **Startups moving fast**: Founders looking to hit the ground running by
  combining the speed of Rails development with React's vast ecosystem of
  prebuilt UI libraries.

- **Javascript fatigue**: Anyone tired of JS complexity and just want to get
  work done.


## How does it work?

### It’s Rails

Superglue leans on Rails' ability to respond to different mime types on the
same route and divides the usual `foobar.html.erb` into three familiar
templates.

- `foobar.json.props` A presenter written in a jbuilder-like template that
  builds your page props.
- `foobar.(jsx|tsx)` Your page component that receives the props from above.
- `foobar.html.erb` Injects your page props into Redux when the browser loads
  it.

Shape your `props` to roughly match your component structure. For example:

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

Familiar Rails conveniences include form_props (a fork of `form_with` made for React),
flash messages integrated as a Redux [slice], and [Unobtrusive Javascript][UJS] helpers.

### It’s React

But there are no APIs! The above is injected as a script tag in the DOM so everything
loads in the initial request. Its added to your [Redux state] and passed to
the page component in a hook, for example:

```js
import React from 'react';
import { useSelector } from 'react-redux';
import { Drawer, Header, Footer, ProductList, ProductFilter } from './components';
import { useContent } from '@thoughtbot/superglue'

export default function FooBar() {
  const {
    header,
    products = [],
    productFilter,
    rightDrawer,
    footer
  } = useContent()

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

### It’s Turbolinks

Superglue drew inspiration fromthe original Turbolinks, but instead of sending
your `foobar.html.erb` over the wire and swapping the `<body>`, it sends
`foobar.json.props` over the wire to your React and Redux app and swaps the
page component.

This behavior is opt-in. Superglue provides UJS helpers that you can use with
your React components to SPA transition to the next page.

```jsx
<a href=”/next_page” data-sg-visit> Next Page </a>
```

### The return of UJS

Superglue’s secret sauce is that your `foobar.json.props` is diggable; making
any part of your page dynamic by using a query string. It’s a simpler approach
to Turbo Frames and Turbo Stream.

Need to reload a part of the page? Just add a query parameter and combine with
the [UJS] helper attribute `data-sg-remote`:

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

[secret sauce]: digging.md
[UJS]: ujs.md

### One-stop shop

We know first hand how complex React can be, but we don't shy away from
complexity. We want to make things better for everyone and to that end, we have
a supporting cast of tooling under one shop to bring ease and consistancy to
your team.

<div class="grid cards" markdown>

-   __Superglue JS__

    ---

    The javascript library thoughfully pairing Rails and React.

    [:octicons-arrow-right-24: SuperglueJs](https://github.com/thoughtbot/superglue)


-   __Superglue Rails__

    ---

    Integration helpers, and generators for installation and scaffolding.

    [:octicons-arrow-right-24: superglue_rails](https://github.com/thoughtbot/superglue/tree/main/superglue_rails)

-   __PropsTemplate__

    ---

    A very fast JSON builder. The [secret sauce] that give [UJS] superpowers.

    [:octicons-arrow-right-24: props_template](https://github.com/thoughtbot/props_template)


-   __Humid__

    ---

    Server Side Rendering using MiniRacer and V8 isolates.

    [:octicons-arrow-right-24: Humid](recipes/ssr.md)

-   __FormProps__

    ---

    A `form_with` FormBuilder that lets you use Rails forms with React.

    [:octicons-arrow-right-24: form_props](https://github.com/thoughtbot/form_props)

-   __CandyWrapper__

    ---

    Lightweight wrapper components around popular React UI libraries made to work with
    FormProps.


    [:octicons-arrow-right-24: candy_wrapper](https://github.com/thoughtbot/candy_wrapper)

</div>


[Redux state]: ./redux-state-shape.md
[modals]: recipes/modals.md
[more]: recipes/
[slice]: ./cross-cutting-concerns.md#slices
[thoughtfully pairs Rails and React]: https://thoughtbot.com/blog/superglue-1-0-react-rails-a-new-era-of-thoughtfulness
