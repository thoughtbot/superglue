# Rails

## API

### use\_breezy

```ruby
class PostsController < ApplicationController
  # `use_breezy` enables breezy functionality
  # on application.html.erb
  before_action :use_breezy

  def index
...
```

Enables Breezy funtionality, and renders a blank HTML view, allowing for JSX to take over on `application.html.erb`.

### render

You can override behavior through the `breezy` option:

```ruby
  def index
    render :index, breezy: {..more_options..}
  end
```

| Option | Type | Notes |
| :--- | :--- | :--- |
| screen | `String` | Override which screen the will render. Defaults to the template id \(path to template without the rails root and file ext\). |

When using the screen option, remember that Breezy determines which React component to render via the mapping in `application.js`.

```javascript
const screenToComponentMapping = {
  'posts/index': PostIndex
}
```

## Setting the content location

On non-GET requests, Breezy uses the response's `content-location` to create the key used to store your props. This is because when you render in a `create` or `update`, the returned response does not neccesarily reflect the url the user should see. For example, if i'm on `posts/new` and you make a POST request to `posts/`, you may render `posts/new` for any errors you'd like to show.

It is recommended that set this header in your `create` and `update` methods.

```text
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

