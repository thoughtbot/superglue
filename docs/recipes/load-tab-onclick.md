## Loading tab content `onClick`

Some features require loading content `onCLick`. For example, when a user clicks
on an inactive tab to load its content async.

```ruby
# /posts.json.props

json.posts do
  json.all do
  end

  json.pending(defer: :manual) do
  end
end
```

```javascript
//...in your component
  render() {
    return (
      <ol className='tabs'>
        <li> tab1 </li>
        <li> <a href="/posts?bzq=data.posts.pending" data-bz-remote={true}>tab2</a> </li>
      <ol>
      ....
    )
  }
```

`defer: :manual` will instruct PropsTemplate to render the page without that
node. You need to manually request the missing content using
[template querying][querying guide] like the example above.


[querying guide]: ../traversal-guide.md
