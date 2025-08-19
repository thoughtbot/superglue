## Redux

If you have a usecase that requires complex updates to frontend state, you can
bring your own state management, or use redux-toolkit slices. Superglue
includes a few useful redux actions that you can use with redux slices if you
decide to create custom slices.

### `flash.js`

Your first custom slice will be a `flash` slice. Superglue's installation
generator adds this to your project to integrate with Rail's flash.

To start off, the slice is shaped exactly like the Rails flash.

```js
{
  alert: "Something went wrong",
  Success: "You've logged in!"
}
```

and works with the [BEFORE_VISIT](#before_visit) and [RECEIVE_RESPONSE](#receive_response) actions
to 

- [Clear the flash] before each [visit](./requests.md#visit) or [`data-sg-visit`](./ujs.md#data-sg-visit) visit.
- [Merge any new flashes] recieved from any [page response].

[Clear the flash]: https://github.com/thoughtbot/superglue_rails/blob/6737b7536f120368235db695f1cf0634a5c3ea4d/lib/generators/superglue/install/templates/js/flash.js#L30
[Merge any new flashes]: https://github.com/thoughtbot/superglue_rails/blob/6737b7536f120368235db695f1cf0634a5c3ea4d/lib/generators/superglue/install/templates/js/flash.js#L33

__You are enocouraged to modify this slice however you'd like__. For example, if
you prefer a different shape, just modify how the slice is received in your
layout, `application.json.props`

```ruby
json.slices do
  myFlash = flash.to_h.map { |key, value| {type: key.to_s, value: value} }
  json.flash myFlash
end
```

The `slices` key in `application.json.props` is a boundary for you to render
state. Its commonly used to set the intial state of your slice, and update
the slice when receiving a new page.

#### Usage

To use in your page components, simply use a selector.

```jsx
import { useSelector } from 'react-redux'

const flash = useSelector((state) => state.flash)
```

then use the flash as you would normally in a controller

```ruby
def create
  flash[:success] = "Post was saved!"
end
```

### initialState

You can render your slice's initial state in the [slices] `key` of the [page
response]. This has been configured for you in the `application.json.props`
layout.  It'll be merged with the `initialState` passed to your `buildStore`
function in your [application.js](./configuration.md#applicationjs)

### Updating your slice state
If you receive new state for your slice from a subsequent [page response], you
can use `RECEIVE_RESPONSE` to update your slice. Its the same mechanism your
`flash.js` slice uses to update the internal state whenever a [page response] is
received. 

##### RECEIVE_RESPONSE

```
{
  type: "@@superglue/RECEIVE_RESPONSE",
  payload: {
    pageKey: "/posts",
    response: {...the page response},
  },
}
```

#### Other actions
There are also other actions that gets dispatched during lifecycle events that
you can make use of.

To higlight a few:

##### BEFORE_FETCH

`BEFORE_FETCH` - Action created before a before a fetch is called.

```
{
  type: "@@superglue/BEFORE_FETCH",
  payload: [..array args that are passed to fetch]
}
```

##### BEFORE_VISIT
`BEFORE_VISIT` - Same as above, but called only for a `visit` action. Your
`flash` slice has been setup to use this to clear the flash before navigating.

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



[page response]: ./page-response.md
[extraReducers]: https://redux-toolkit.js.org/api/createSlice#extrareducers
[slices]: ./page-response.md#slices