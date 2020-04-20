# Rails

## Setting the content location

On non-GET `visit`s, Breezy uses the response's `content-location` to create the key used to store your props.

This is because when you render in a `create` or `update`, the returned response does not necessarily reflect the url the user should see.

For example, if I'm on `posts/new` and you make a POST request to `posts/`, you may render `posts/new` for any errors you'd like to show.

It is recommended that you set this header in your `create` and `update` methods. If you used the generators, this is done for you.

```ruby
def create
  @post = Post.new(post_params)

  if @post.save
    redirect_to @post, notice: 'Post was successfully created.'
  else
    response.set_header("content-location", new_post_path)
    render :new, breezy: {screen: 'PostsNew'}
  end
end
```

