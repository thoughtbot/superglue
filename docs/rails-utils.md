# Rails utils


## Rendering defaults

Superglue typically requires 3 templates.

```
app/views/
  posts/
    index.html.erb # duplicated
    index.jsx
    index.json.props
  users/
    index.html.erb # duplicated
    index.jsx
    index.json.props
```

Use `use_jsx_rendering_defaults` and `superglue_template` for cleaner
directories.

```ruby
class PostsController < ApplicationController
  before_action :use_jsx_rendering_defaults
  superglue_template "application/superglue" #defaults to application/superglue
end
```

!!! warning
    The `file`, `partial`, `body`, `plain`, `html`, `inline` will not work with
    `render` when using `before_action :use_jsx_rendering_defaults` callback. Make use of
    `:only` and `:except` to narrow down its usage.

Which will allow you to deduplicate the files:

```
app/views
  application/
    superglue.html.erb
  posts/
    index.jsx
    index.json.props
  users/
    index.jsx
    index.json.props
```

and omit `props` files for cases when there is no content.

```
app/views
  application/
    superglue.html.erb
  about/
    index.jsx
```

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


