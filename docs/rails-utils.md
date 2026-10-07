# Rails utils

## Page templates

A Superglue page is made of two templates that sit next to each other:

```
app/views/
  posts/
    index.html.jsx    # or index.html.tsx
    index.json.props
```

The `.html.jsx` file is your page component. Superglue registers `jsx` and
`tsx` as template handlers, so Rails will find and render it like any other
view. What it renders depends on the request:

- **HTML requests** render the page with the application layout. The layout
  calls `render_props`, which renders `index.json.props` and hands it to
  your JavaScript as the initial page state. If you've set up an
  [`ssr_context`](#ssr_context), the page component is also server side
  rendered into the layout. Otherwise, the template renders as an empty string
  and the page is rendered on the client.
- **JSON requests**, made by `visit` and `remote`, render `index.json.props`.

The `.json.props` file is optional. When it's missing, Superglue renders an
empty `data` node in the `application.json.props` layout, which is useful for
pages with no content:

```
app/views/
  about/
    index.html.jsx
```

## `render_props`

A helper used in your `application.html.erb` layout. It renders the current
action's `.json.props` template with the `application.json.props` layout and
returns the JSON as a string. The installation generator adds it for you:

```erb
<script type="text/javascript">
  window.SUPERGLUE_INITIAL_PAGE_STATE=<%= render_props %>;
</script>
```

## `ssr_context`

A controller class method that enables server side rendering. The block
returns a prepared [Humid](./humid.md) context, or `nil` to skip server side
rendering. The installation generator adds it to your `ApplicationController`:

```ruby
class ApplicationController < ActionController::Base
  ssr_context { Humid.prepare(MINI_RACER_SSR[:context]) if defined?(MINI_RACER_SSR) }
end
```

When a page is server side rendered, the response includes an
`X-Superglue-SSR: 1` header. To turn off server side rendering for a
controller, override the block:

```ruby
class DashboardController < ApplicationController
  ssr_context { nil }
end
```

## `param_to_dig_path`

Converts a `props_at` parameter into a path that PropsTemplate can use to
[dig](./digging.md) into your template. The generated
`application.json.props` layout uses it:

```ruby
path = request.format.json? ? param_to_dig_path(params[:props_at]) : nil

json.data(dig: path) do
  yield json
end
```

## `redirect_back_with_props_at`

A helper to help retain the `props_at` parameter as part of the redirect `location`.
This helper has the same options as Rails own `redirect_back`.

```ruby
def create
  redirect_back_with_props_at fallback_location: '/'
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

## Generators

| Generator | Description |
| --------- | ----------- |
| `rails g superglue:install` | Installs Superglue. See [installation](./installation.md) for options. |
| `rails g superglue:scaffold post body:string` | Like `rails g scaffold`, with Superglue pages and props templates. |
| `rails g superglue:scaffold_controller post body:string` | Like `rails g scaffold_controller`, with Superglue pages and props templates. |
| `rails g superglue:view_collection post body:string` | Only the `index`, `show`, `new`, and `edit` pages and props templates. |

The scaffold generators create TypeScript pages when a `tsconfig.json`
exists. Pass `--typescript` or `--no-typescript` to override.

## Configuration

| Setting | Default | Description |
| ------- | ------- | ----------- |
| `config.superglue.signed_stream_verifier_key` | derived from `secret_key_base` | Key used to sign [stream](./super-turbo-streams.md) names. |
