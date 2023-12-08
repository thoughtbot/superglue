# Philosophy

## Lean on Rails

Move as much logic as you can into Rails. For example, instead of doing
this:

```ruby
  json.firstName @user.first_name
```

```js
const Header = ({firstName}) => (<h1>{firstName.toUpperCase()}</h1>)
```

we do

```ruby
  json.firstName @user.first_name.capitalize
```

```js
const Header = ({firstName}) => (<h1>{firstName}</h1>)
```

## Shape with presentation

As an end user, its easy to look at any regular web page and understand all the
actions that you can take. Its the strength of HTML and of HATEOAS. Superglue is
inspired by this and encourages you to shape your JSON in the same way.

Shape your pages roughly how you'll organize your components. Some may critic
the addition of presentation, but there is intentionally only one consumer of
your shape, your page components.

?> **What about forms?** You can use [form_props] to build the right JSON for your
React components.

  [form_props]: https://github.com/thoughtbot/form_props


## HTML Thinking

Just because you can create a link without a `href` in React doesn't mean you
should. Ultimately, everything renders as HTML. That's why Superglue doesn't
give links the ability to make non-get requests. Instead it encourages you to
create forms that look like links, the same approach Rails uses. This has the
added benefit of easily building for [Server Side Rendering].

  [Server Side Rendering]: ./recipes/server-side-rendering.md

## Embrace Unobtrusive Javascript (UJS)

You may have noticed that we've been using `data-sg-remote` or `data-sg-visit`
in the examples.

```jsx
  <a href='/posts?props_at=data.dashboard.keyMetricsChart' data-sg-visit />
```

Superglue embraces Unobtrusive Javascript. Any link or form with a `data-sg`
attribute receives superpowers inspired by Rails data attributes.

For more advanced use cases, an action creator is [passed] to all your connected
page components.

  [passed]: ./navigation.md


## You can dig it!

```
/dashboard?props_at=data.greet
```

A single keypath will dig your template for content and place it to where it
belongs in your Redux state. That's incredibly productive and can be used for a
variety of rich applications. See the the [digging docs] or recipes section.

## Its still just Rails

We might using React components, but most of what gives Superglue superpowers is that
its driven by all the conveniences of old fashion and boring Rails.

```treeview
app/
|-- controllers/
|-- views/
|   |-- posts/
|   |   |-- index.js
|   |   |-- index.json.props
|   |   |-- index.html.erb
```

[props_template]: https://github.com/thoughtbot/props_template
[digging docs]: ./traversal-guide.md
