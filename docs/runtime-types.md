# Working with types

In Superglue, there's no need to annotate your types in ruby just to regenerate
them in typescript. Instead you write **typescript first** and let runtime type
validation give you the developer feedback to build your `props`.

To get started, run the installation generator with the typescript flag.

```terminal
rails g superglue:install --typescript
```

The installation generator will add

1. a [esbuild plugin](https://github.com/thoughtbot/superglue_rails/blob/af7edd35d3ed211822663ac21a5c9910abcc6d88/lib/generators/superglue/install/templates/esbuild/plugin.js) that enables deepkit to work with Superglue
2. a [build.mjs](https://github.com/thoughtbot/superglue_rails/blob/af7edd35d3ed211822663ac21a5c9910abcc6d88/lib/generators/superglue/install/templates/ts/build.mjs), a esbuild node script that builds your application.
3. And setup deepkit to work with esbuild. If you are using [vite](./recipes/vite.md) or bun with superglue, please use [deepkit/vite](https://deepkit.io/en/documentation/package/vite) or [deepkit/bun](https://deepkit.io/en/documentation/package/bun) plugins.

## How It Works

Superglue uses [Deepkit](https://deepkit.io/) for runtime type validation during development:

1. **Build Time**: Deepkit's compiler transforms TypeScript types into runtime validation code
2. **Development Mode**: `useContent()` validates server responses against your types
3. **Production Mode**: Validation code is stripped entirely

## Writing your types

`useContent` is the generic hook used to access the props [you
build](shaping.md). To make use of runtime types, simply pass a type
describing your page's props as you normally would: 

For example: 

```tsx
  import React from 'react'
  import { useContent } from '@thoughtbot/superglue'

  interface Post {
    id: number
    title: string
    content: string
  }

  type PostShowProps = {
    header: string;
    post: Post;
  }

  export default function PostShow() {
    const { header, post} = useContent<PostShowProps>()

    return (
      <div>
        <h1>{header}</h1>
        
        <ul>
          <li>{post.id}</li>
          <li>{post.title}</li>
          <li>{post.content}</li>
        </ul>
      </div>
    )
  }
```

If the payload from `app/views/posts/show.json.props` was mishaped in anyway, you'd get an error:

![error image](images/runtime-types.png)

Use that error and feedback loop to build your props:

```ruby
json.header "Hello"

json.post do
  json.id 100
  json.title "This is a title"
  json.content "This is a body"
end
```