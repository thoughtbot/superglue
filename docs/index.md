# Overview

__Superglue is The Rails Way of building React applications.__ Refreshingly
familiar. No APIs. No client-side routing. Batteries included.

<div class="grid cards" markdown>

-   __Super Turbo Streams__

    Turbo Streams [ported](./super-turbo-streams.md) for Superglue and React. Use `broadcast_append_to`
    and more to easily update your UI.

-   __Unobtrusive Javascript (UJS)__

    [Bringing back](ujs.md) a classic to make developing SPA features easy and familiar

-   __Fragments__

    Giving Rails partials [identity and super powers](./fragments.md) on the frontend.

-   __Deferment__

    Easily [defer](./deferments.md) any part of your page. Great for modals, tabs, and more!


-   `props_template`

    [A very fast JSON builder](./props-template.md) inspired by Jbuilder to [shape](./shaping.md) backend
    state. The secret sauce that give UJS superpowers.

-   `form_props`

    A `form_with` [FormBuilder](./form-props.md) that lets you use Rails forms with React.

-   `candy_wrapper`

    [Lightweight wrapper components](./candy-wrapper.md) around popular React UI libraries made to work with
    FormProps.

-   `humid`

    [Server Side Rendering](./humid.md) using MiniRacer and V8 isolates.

</div>

## Who is it for?

Superglue is built from the ground up for **Rails developers** who want to use the 
concepts they already know to: turbo streams, controllers, server-side
routing, views, form helpers, and more — to create seamless, interactive React
applications.

**It's for large teams** seeking a way out of JavaScript complexity without losing the
investment in React components.

**Its for nimble teams** wanting to move fast with the speed of Rails development 
and React's vast ecosystem of prebuilt UI libraries.

## Refreshingly familiar

Here's how basic functionality looks like:

=== "`routes`"
    ```ruby
    resource :posts
    ```

=== "`controller`"
    in `app/config/routes.rb`

    ```ruby
    class PostsController < ApplicationController
      def show
        @post = Post.find(params[:id])
      end

      def update
        @post = Post.find(params[:id])
        @post.body = "Updated" #no save

        redirect_back fallback_location: root_path
      end
    end
    ```

=== "`views`"

    ```ruby
    # views/posts/show.json.props
    json.spotlight do
      json.body @post.body
    end

    json.updateBodyForm do
      form_props(model: @post) do |f|
        f.submit
      end
    end
    ```

    ```jsx
    // views/posts/show.jsx
    import React from 'react';
    import { useContent } from '@thoughtbot/superglue'
    import Spotlight from '@components/Spotlight'
    import {Form, SubmitButton} from '@components/forms/vanilla'

    export default function PostsShow() {
      const {updateBodyForm, spotlight} = useContent()
      const {form, extras, inputs} = updateBodyForm

      return (
        <>
          <Spotlight {...spotlight} />
          <Form {...form} extras={extras}>
            <SubmitButton {...inputs.submit} />
          </Form>
        </>
      );
    }
    ```

## Respecting Rails favorites 

Beyond the basics, Rails is already effective at building world class apps.
Instead of ignoring the toolset, Superglue adapts it for React.

Navigate like Turbo:

```
<a href="/posts" data-sg-visit>Next page</a>
```

Bring back the power of Unobtrusive JavaScript with surgical updates:

```
<a href="/posts/1?props_at=data.postContent" data-sg-remote> Reload post </a>
```

Build forms The Rails Way with `form_props`, a fork of `form_with` with the same API.

```
  form_props(model: @post) do |f|
    f.submit
  end
```

Respond with Super Turbo Streams

```ruby
class PostsController < ApplicationController
  def update
    @post = Post.find(params[:id])
    @post.body = "Updated" #no save

    respond_to do |format|
      format.html { redirect_back fallback_location: root_path}
      format.json { render layout: "stream" }
    end
  end
end
```

```ruby
# posts/update.json.props
broadcast_save_props(model: @post) # Updates all connected clients instantly
```

Give rendered partials identity with Fragments, and optimistically update them
client side.

```ruby
json.cart(partial: ["cart", fragment: "userCart"]) do
end
```

```jsx
const set = useSetFragment()

set('userCart', (cartDraft) => {
  cartDraft.lineItems[0].qty += 1
})
```