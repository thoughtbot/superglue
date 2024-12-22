# The return of Rails UJS

Unobtrusive Javascript is an easy way to added single page app like features to
HTML links and form tags. Its taken a backseat since the introduction of Hotwire,
but Superglue puts UJS back in the forefront and packs it with functionality
that makes building SPA-like functionality easy and consistent.

Want to reload a shopping cart?

```
<a href="/props_at=data.sideBar.shoppingCart" data-sg-remote>Reload the cart</a>
```

Or maybe load a modal efficiently when the next page has one?

```
<a href="/posts/new?props_at=data.modal">Create Post</a>
```

With Superglue, there is just one concept. No need for the complexity of
Stimulus controllers, Turbo Streams, or Turbo Frames.

## Navigating with UJS

Superglue operates like a multipage application. In other to transition to the
next page without reloading you'll need to use UJS attributes `data-sg-remote`
or `data-sg-visit`.

### `data-sg-visit`

Use `data-sg-visit` when you want to navigate to the next page and update the
address bar without reloading.

```javascript
<a href='/posts/new' data-sg-visit />
```

In the above example, when the link is clicked, Superglue will intercept the click,
make a request for `/posts/new.json`, swap your page component, and pass the payload.


!!! note
    You are not able to specify the HTTP method used in a UJS link.

    This is intentional. If you want to create a link that can support `POST`,
    `PUT`, `DELETE` methods, create a form component that looks like a link and
    use props generated from [form_props]

    [form_props]: https://github.com/thoughtbot/form_props

You can also use `data-sg-visit` on forms:

```javascript
<form action='/some_url' data-sg-visit />
```

### `data-sg-remote`

Use `data-sg-remote` when you want to update parts of the **current page** without
reloading the screen.

!!! tip "Differences from `remote`"
    The only difference between `data-sg-remote` and `remote`, is that
    `data-sg-remote` passes the current page as the target `pageKey` of
    `remote`.

    `remote`, normally would work like a background `visit` that doesn't change
    the url and will use the URL of the response to save the payload.

    But most of the time, if you're using `data-sg-remote` on a page, you want
    to dig for `props` and attach that somewhere in the current page. For
    convienence, we've modified the call so that we set the `pageKey` for you.

Combine this with props_template's [digging] to selectively load content.

```jsx
<a href='/posts?page_num=2&props_at=data.body.postsList' data-sg-remote/>
  Next Page
</a>
```

You can also use `data-sg-remote` on forms.

```jsx
<form action="/posts" method="GET" data-sg-remote>
  <input type="search" .... />
  ....
</form>
```

## Expanding UJS

The [dataset] of the element enabled with `data-sg-visit` or `data-sg-remote` is
passed to your [application_visit.js]. You can add your own options to control the
behavior of the UJS helpers. For example, if you want to selectively show a
[progress bar] on some links.


### `data-sg-replace`

Included in [application_visit.js] as an expanded option is `data-sg-replace`.
It pairs with `data-sg-visit` to replace history instead of pushing when a
user clicks on a form or a link. This can be useful when working with data
tables with a large number of click-to-filter options that push history.

[dataset]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
[application_visit.js]: ./configuration.md
[progress bar]: ./recipes/progress-bar.md
