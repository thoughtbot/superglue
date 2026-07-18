# Overview

**Superglue is The Rails Way of building React Rails applications.**
Refreshingly familiar. No APIs. No client-side routing.

## Why Superglue?

Superglue provides the absolute best interop between Rails and React's massive
ecosystem.

We're guided to NOT have a Superglue-specific component ecosystem. No infinite
scroll API, no specialized modal or virtual table component, no lock-in. We do
this with a small set of primitives that compose well with any React
library you want.

!!! tip "Primitives and Patterns"
See [Primitives and Patterns](./primitives.md) for how these tools compose
to build modals, infinite scroll, optimistic updates, and more.

And of course, batteries are included:

<div class="grid cards" markdown>

- **Super Turbo Streams**

  Turbo Streams [ported](./super-turbo-streams.md) for Superglue and React. Use `broadcast_append_to`
  and more to easily update your UI.

- **Unobtrusive Javascript (UJS)**

  [Bringing back](ujs.md) a classic to make developing SPA features easy and familiar

- **Fragments**

  Giving Rails partials [identity and super powers](./fragments.md) on the frontend.

- **Deferment**

  Easily [defer](./deferments.md) any part of your page. Great for modals, tabs, and more!

- `props_template`

  [A very fast JSON builder](./props-template.md) inspired by Jbuilder to [shape](./shaping.md) backend
  state. The secret sauce that give UJS superpowers.

- `form_props`

  A `form_with` [FormBuilder](./form-props.md) that lets you use Rails forms with React.

- `candy_wrapper`

  [Lightweight wrapper components](./candy-wrapper.md) around popular React UI libraries made to work with
  FormProps.

- `humid`

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

Here's how basic functionality looks:

=== "`routes`"
`ruby
    resource :posts
    `

=== "`controller`"
in `app/config/routes.rb`

    ```ruby
    class PostsController < ApplicationController
      def show
        @post = Post.find(params[:id])
      end

      def update
        @post = Post.find(params[:id])
        @post.body = "Updated"

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
broadcast_update_props(model: @post) # Updates all connected clients instantly
```

Give rendered partials identity with [Fragments](./fragments.md), and optimistically update them
client side.

```ruby
json.cart(partial: ["cart", fragment: "userCart"]) do
end
```

```jsx
const update = useUpdateFragment()

update('userCart', (cartDraft) => {
  cartDraft.lineItems[0].qty += 1
})
```
