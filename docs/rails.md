# Rails

## Setting the content location

On non-GET `visit`s, Superglue uses the response's `content-location` to create
the key used to store your props.

This is because when you render in a `create` or `update`, the returned
response does not necessarily reflect the url the user should see.

For example, when the user is on `posts/new` and they make a POST request to
`posts/`, we may decide to render `posts/new` for any errors you'd like to
show.

It is recommended that you set this header in your `create` and `update`
methods. If you used the generators, this is done for you.

```ruby
def create
  @post = Post.new(post_params)

  if @post.save
    redirect_to @post, notice: 'Post was successfully created.'
  else
    response.set_header("content-location", new_post_path)
    render :new
  end
end
```

## Rails Flash

The installation generator will add a `flash.js` slice to `app/javascript/slices`
and will work with the Rails `flash`.

To use in your page components, simply use a selector.

```jsx
import { useSelector } from 'react-redux'

...

const flash = useSelector((state) => state.flash)
```

then use the flash as you would normally in a controller

```ruby
def create
  flash[:success] = "Post was saved!"
end
```

?> When using `data-sg-visit`, all flash in slice will be cleared before the request.

?> When using `data-sg-visit` or `data-sg-remote`, the recieved flash will be merged with the current flash.


## `redirect_back_with_props_at`

A helper to help retain the `props_at` parameter as part of the redirect `location`.
This helper has the same method signature as Rails own `redirect_back`.

```ruby
def create
  redirect_back_with_props_at fallback_url: '/'
end
```
