# Forms

Rails form helpers are by far one of the most valuable tools in a developer's
arsenal. Working with React doesn't mean we have to abandon this tooling. 

## From `form_with` to `form_props`

Superglue comes with `form_props`, a fork of `form_with` made for
`props_template` and `jbuilder` to output props instead of HTML. 

Before:

```erb
<h1><%= @post.title %></h1>
<%= form_with model: @post do |f| %>
  <%= f.text_field :title %>
  <%= f.text_area :body %>
  <%= f.submit %>
<% end %>
```

After:

```ruby
json.title @post.title

json.postForm do
  form_props model: @post do |f|
    f.text_field :title
    f.text_area :body
    f.submit
  end
end
```

and splat it into your React components

```jsx
import {Form, TextField, SubmitButton} from './maintine_wrappers'

const {form, extras, inputs} = newPostForm

<Form {...form} extras={extras}>
  <TextField {...inputs.title} label="Post title" />
  <TextField {...inputs.body} label="Post body" />
  <SubmitButton {...inputs.submit} />
</Form>
```

## React UI kits

`form_props` outputs props. This means it can work with ANY React UI kit as long
as we're able to shape the props to the component's interface. This can be
accomplished using custom wrapper components, or use ours.

`candy_wrapper` is set of [copyable prebuilt wrappers](./candy-wrapper.md)
around popular React UI libraries. Just copy and go:

```jsx
import {Form, TextField, SubmitButton} from './copied_components_for_mantine'

const {form, extras, inputs} = newPostForm

<Form {...form} extras={extras}>
  <TextField {...inputs.title} label="Post title" />
  <SubmitButton {...inputs.submit} />
</Form>
```

Component tests are included for you to copy as well.

## Form Errors

Form errors can be implemented in a variety of ways. To start off, you'll find
support for inline errors in all of `candy_wrapper` components

```
const validationErrors = {
  post_title: "can't be blank"
}

<Form {...form} extras={extras} validationErrors={validationErrors}>
  <TextField {...inputs.title} label="Post title" errorKey="post_title"/>
  <SubmitButton {...inputs.submit} />
</Form>
```

However, `form_props` does not handle form errors out-of-the-box. Instead, the
recommended way to handle errors is through Rail's `flash`. For example:

```diff
class PostsController < ApplicationController
  def create
    @post = Post.new(post_params)

    if @post.save
      redirect_to :index
    else
+      flash.now[:postFormErrors] = @post.errors.as_json
      render :new
    end
  end
end
```

```jsx
import { useAppSelector } from '@javascript/store'

const validationErrors = useAppSelector((state) => state.flash.postFormErrors)

<Form {...form} extras={extras} validationErrors={validationErrors}>
  <TextField {...inputs.title} label="Post title" errorKey="post_title"/>
  <SubmitButton {...inputs.submit} />
</Form>
```
