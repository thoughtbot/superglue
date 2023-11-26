# Modals

Modals are easy. Let us imagine the following urls:

1. `/seats` - This shows a stadium map of available seats.
2. `/seats/1` - This shows the status of a single seat as a modal over the map
of seats.

Visually, the only difference between the two pages is the modal. So we model
our application as such.

In `/seats/index.json.props`

```ruby
# Other index.json.props content here
...

json.seatDetails do
  json.show false
  # empty
end
```

In `/seats/show.json.props`

```ruby
# Other index.json.props content here
...

json.seatDetails do
  json.show true

  # Add additional modal content here.
end
```

In `packs/application.js`, change your component mapping to use your `ShowIndex`
component as your identifier's component:

```
const pageIdentifierToPageComponent = {
  'seats/index': SeatsIndex,
  'seats/show': SeatsIndex,
};
```

and in `Modal` component's render:

```js
  if (props.show) {
    ....render modal with `props.seatDetails`
  } else {
    return null;
  }
```

and add a [UJS visit] attribute to get the SPA modal effect with history change
and back button support!

In `SeatsIndex.js`, change the `a` tags like so.

```js
  <a
    href="/seats/1"
    data-sg-visit={true}
   > Show Seat Modal </a>
```

### Optimize it!

The above solution will load the entirety of the `show.json.props`. That may
not be what we want as some parts of the template may be slow.

Instead, we can make it more efficient by loading just the modal contents.

```js
  <a
    href="/seats/1?props_at=data.seat"
    data-sg-visit={true}
    data-sg-placeholder="/seats"
   > Show Seat Modal </a>
```

The change above uses Superglue's [copy feature] to

1. Copy the current page, `/seats` and use it as a placeholder for `/seats/1`
2. Navigate to that page optimistically (as defined in our `page_to_page_mapping.js`)
3. Query `show.json.props` and walk to the `data` node, then to the `seat` node,
and return that.
4. Immutably graft it to the placeholder in `/seats/1` in the same location.
5. React will render with the modal contents.

[copy feature]: ../navigation.md#placeholders
[UJS visit]: ../navigation.md#single-page-navigation-using-visit
