# Working with types

In Superglue, there's no need to annotate your types in ruby just to regenerate
them in typescript. Instead you write **typescript first** and let runtime type
validation give you the developer feedback to build your '.props`.

To get started, run the installation generator with the typescript flag.

```terminal
rails g superglue:install --typescript
```

## How It Works

Superglue uses [Deepkit](https://deepkit.io/) for runtime type validation during development:

1. **Build Time**: Deepkit's compiler transforms TypeScript types into runtime validation code
2. **Development Mode**: `useContent()` validates server responses against your types
3. **Production Mode**: Validation code is stripped entirely

## Writing your types

`useContent` is the generic hook used to access the props [you
build](../docs/shaping.md). To make use of runtime types, simply pass a type
describing your page's props: 

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