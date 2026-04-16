Redux is used internally by Superglue to manage state. While the store is not
directly exposed, Superglue dispatches lifecycle actions that you can hook into
if you need advanced state management with custom redux-toolkit slices.

### Flash

Flash is built into Superglue and integrates with Rails `flash` automatically.
Use the `useFlash` hook to access flash messages:

```jsx
import { useFlash } from '@thoughtbot/superglue'

const flash = useFlash()
console.log(flash.success)
```

then use the flash as you would normally in a controller

```ruby
def create
  flash[:success] = "Post was saved!"
end
```

### Lifecycle Actions

Superglue dispatches actions during lifecycle events that you can hook into
using redux-toolkit slices with `extraReducers`.

##### BEFORE_FETCH

`BEFORE_FETCH` - Action created before a before a fetch is called.

```
{
  type: "@@superglue/BEFORE_FETCH",
  payload: [..array args that are passed to fetch]
}
```

##### BEFORE_VISIT
`BEFORE_VISIT` - Same as above, but called only for a `visit` action.

```
{
  type: "@@superglue/BEFORE_VISIT",
  payload: [..array args that are passed to fetch]
}
```

##### BEFORE_REMOTE

`BEFORE_REMOTE` - Same as above, but called only a `remote` action.

```
{
  type: "@@superglue/BEFORE_REMOTE",
  payload: [..array args that are passed to fetch]
}
```

##### SAVE_RESPONSE

`SAVE_RESPONSE` is called before a response is saved as a page.

```
{
  type: "@@superglue/SAVE_RESPONSE",
  payload: {
    pageKey: "/posts",
    page: {...the page response},
  },
}
```

##### RECEIVE_RESPONSE

`RECEIVE_RESPONSE` is called when a page response is received.

```
{
  type: "@@superglue/RECEIVE_RESPONSE",
  payload: {
    pageKey: "/posts",
    response: {...the page response},
  },
}
```

[page response]: ./page-response.md
