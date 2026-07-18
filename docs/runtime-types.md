# Working with types

End-to-end typing is a common way to ensure correctness across the frontend
and backend, but it's not the only way. Tools like Typelizer annotate types in
Ruby and regenerate them in TypeScript, but now you're learning two different
type languages and wondering how one maps to the other.

Superglue takes a different approach, a typescript first approach. Instead of
end-to-end typing, we use
[contracts](https://martinfowler.com/articles/consumerDrivenContracts.html).
You write your types in TypeScript and treat them as the UI contract, declaring
what the component needs (a header, a list of posts, each with a title and
body) via `useContent<T>()`. Then you build the props template to fulfill it.
The UI shape comes first, the business logic follows.

Superglue ships an experimental [Deepkit](https://deepkit.io/) plugin that
validates your server responses against your TypeScript types during
development. Write the type, load the page, and the errors will guide you.

## Getting started with Deepkit

To get started, run the installation generator with the typescript flag.

```terminal
rails g superglue:install --typescript
```

The installation generator will ask if you'd like to enable Deepkit and set up
the build plugin for your bundler. If you prefer to set it up manually, add the
plugin to your build config:

```javascript
// esbuild
import { esbuild as deepkitPlugin } from '@thoughtbot/superglue/deepkit'

// vite
import { vite as deepkitPlugin } from '@thoughtbot/superglue/deepkit'

// webpack
const { webpack: deepkitPlugin } = require('@thoughtbot/superglue/deepkit')
```

Then include it conditionally in your plugins array:

```javascript
plugins: isDev ? [deepkitPlugin()] : []
```

## How It Works

The Superglue Deepkit plugin transforms `useContent<T>()` and
`useFragment<T>()` calls to inject a `validate` callback via AST
transformation. Deepkit's compiler generates the runtime type metadata.
When the page loads, the hooks validate server responses against your
types and log errors to the console.

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
  header: string
  post: Post
}

export default function PostShow() {
  const { header, post } = useContent<PostShowProps>()

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
