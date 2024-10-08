# Rails utils

## `redirect_back_with_props_at`

A helper to help retain the `props_at` parameter as part of the redirect `location`.
This helper has the same method signature as Rails own `redirect_back`.

```ruby
def create
  redirect_back_with_props_at fallback_url: '/'
end
```

## Setting the content location

You can override the URL Superglue uses to display on the address bar and
store your response directly from the server using `content-location`. This
is optional. For example:

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


