# The return of Rails UJS

Unobtrusive Javascript is an easy way to added single page app like features to
HTML links and form tags. Its been a staple feature since Rails 6, but will
sunset with the release of Rails 8 in favor of Hotwire and friends.

Superglue puts UJS back in the forefront and embues it with superpowers (curtesy
of props_template) that makes building SPA-like functionality easy and consistent.

Want to reload a shopping cart?

```
<a href="/props_at=data.sideBar.shoppingCart" data-sg-remote>Reload the cart</a>
```

Or maybe load a modal efficiently when the next page has one?

```
<a href="/posts/new?props_at=data.modal" data-sg-visit data-sg-placeholder="/posts">Create Post</a>
```

With Superglue, there is just one concept. No need for the complexity of
Stimulus controllers, Turbo Streams, or Turbo Frames.

## Navigating with UJS

Superglue operates like a multipage application. In other to transition to the
next page without reloading you'll need to use UJS attributes `data-sg-remote`
or `data-sg-visit`.

## `data-sg-visit`

Use `data-sg-visit` when you want to navigate to the next page and update the
address bar without reloading.

```javascript
<a href='/posts/new' data-sg-visit />
```

In the above example, when the link is clicked, Superglue will intercept the click,
make a request for `/posts/new.json`, swap your page component, and pass the payload.


!!! note
    You are not able to specify the HTTP method used in a UJS link. This is
    intentional. If you want to create a link that can support different HTML
    methods, create a form component that looks like a link and use props
    generated from [form_props](https://github.com/thoughtbot/form_props)

You can also use `data-sg-visit` on forms:

```javascript
<form action='/some_url' data-sg-visit />
```

### `data-sg-placeholder`

A companion attribute for use with `data-sg-visit`. By specifiying a
placeholder, superglue will take the page props at that placeholder and
optimistically copies it as the page props for the next page while a request is
made.

It's for cases when you know with certainty how the next page is going to
look like, but you want to selectively fetch just the content you need to make
an update without loading the entirety of the next page. For example, modals,
tabs, notifications, etc.

```jsx
<a href="/posts/new?props_at=data.modal" data-sg-visit data-sg-placeholder="/posts">
  Create Post
</a>
```

## `data-sg-remote`

Use `data-sg-remote` when you want to update parts of the **current page** without
reloading the screen.

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: See differences](requests.md#differences-from-ujs)
     from `remote`
</div>

Combine this with props_template's [digging] to selectively load content.

```jsx
<a href='/posts?page_num=2&props_at=data.body.postsList' data-sg-remote/>
  Next Page
</a>
```

You can also use `data-sg-remote` on forms.

```jsx
<form action="/posts"  method="GET" data-sg-remote>
  <input type="search" .... />
  ....
</form>
```

