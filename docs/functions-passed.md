All page components receives the following functions.

## visit and remote

These are the methods described in [advanced requests].

[advanced requests]: requests.md

## navigateTo

Superglue comes with a basic `Nav` component that manages swapping of
the different page components. The component comes with a `navigateTo` method
that is passed to all your page components which you can use to perform a
full-page navigation using your cached state.

```javascript
navigateTo('/posts', {ownProps:{something: true}})
```

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: See complete reference](reference/components.Nav.md#navigateto)
     for `navigateTo`
</div>

## saveAndProcessPage

Save and process a rendered view from PropsTemplate. This is the primitive
function that [visit and remote] calls when it receives a [page]. If you are
able to render a [page] outside the normal request response cycle, e.g,
websocket, you can use this function to save the payload.

[page]: page-response.md

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| pageKey | `String` | The key that Superglue uses to store the response |
| page | `String` | A rendered PropsTemplate|

### copyPage

Copies an existing page in the store, and sets it to a different `pageKey`.
Useful for optimistic updates on the next page before you navigate.

```js
copyPage({
  from: '/current_page',
  to '/next_page'
})
```

| Arguments | Type | Notes |
| :--- | :--- | :--- |
| {from} | `String` | The key of the page you want to copy from.
| {to} | `String` | The key of the page you want to copy to.


[digging guide]: digging.md
[PropsTemplate]: https://github.com/thoughtbot/props_template#partial-fragments
[visit and remote]: requests.md
