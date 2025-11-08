# SPA (Single Page Application) Pagination

In this recipe, we'll be adding pagination that works without reloading the
page.

## Starting point

Lets pretend that we're already able to see a list of posts.

=== "`posts_controller.rb`"
    ```ruby
    # app/controllers/posts_controller.rb

    def index
      @posts = Post.all
    end
    ```

=== "`index.json.props`"
    !!! info
        In this example, we have a `sleep` that we will optimize
        for later

    ```ruby
    # app/views/posts/index.json.props

    json.header do
      json.name "bob"
      sleep 2
    end

    json.posts do
      json.list do
        json.array! @posts do |post|
          json.id post.id
          json.body post.body
          json.editPostPath edit_post_path(post)
        end
      end
    end
    ```

=== "`index.js`"
    !!! info
        Let's assume `Header` is a simple component that exist.

    ```js
    // app/views/posts/index.js

    import React from 'react'
    import {useContent} from '@thoughtbot/superglue'
    import Header from './Header'

    export default PostIndex = () => {
      const {
        posts,
        header
      } = useContent()

      return (
        <>
          <Header {...header}/>
          <div>
            {
              posts.list.map(({id, body}) => (
                <p key={id}>{body}</p>
              ))
            }
          </div>
          <PostList items={posts}>
        </>
      )
    }

    ```

## Add gems

Lets also add Kaminari to your gem file

```terminal
gem 'kaminari'
```

and `bundle`

## Add pagination

The changes here are almost same with the `.erb` counterpart. We're using
`path_to_next_page` and `path_to_prev_page` which come with Kaminari, both
methods return `nil` if there are no subsequent pages.

!!! info
    Some [helpers] like `paginate` output HTML instead of
    JSON, but we can still use more primitives methods.

[helpers]: https://github.com/kaminari/kaminari#the-paginate-helper-method


=== "`posts_controller.rb`"
    ```diff
    # app/controllers/posts_controller.rb

    def index
      @posts = Post.all
    +   .page(params[:page])
    +   .per(10)
    +   .order(created_at: :desc)
    end
    ```

=== "`index.json.props`"
    ```diff
    # app/views/posts/index.json.props

    json.posts do
      json.list do
        json.array! @posts do |post|
          json.id post.id
          json.body post.body
          json.editPostPath edit_post_path(post)
        end
      end
    +
    + json.pathToNextPage path_to_next_page(@posts)
    + json.pathToPrevPage path_to_prev_page(@posts)
    end
    ```

=== "`index.js`"


    ```diff
    // app/views/posts/index.js

    import React from 'react'
    import {useContent} from '@thoughtbot/superglue'
    import Header from './Header'

    export default PostIndex = () => {
      const {
        posts,
        header,
    +   pathToNextPage,
    +   pathToPrevPage
      } = useContent()

      return (
        <>
          <Header {...header}/>
          <div>
            {
              posts.list.map(({id, body}) => (
                <p key={id}>{body}</p>
              ))
            }
          </div>
    +     {pathToPrevPage && <a href={pathToPrevPage}>Prev Page</a>}
    +     {pathToNextPage && <a href={pathToNextPage}>Next Page</a>}
        </>
      )
    }
    ```

## Smooth navigation

The above adds pagination, but each click on **Next Page** is
a new page load.

Lets navigate without a reload. In this example, we're using the [UJS] helper `data-sg-visit`,
which would set the current page's state to the response without changing the URL.

**`index.js`**

```diff
// app/views/posts/index.js

import React from 'react'
import {useContent} from '@thoughtbot/superglue'
import PostList from './PostList'
import Header from './Header'

export default PostIndex = () => {
  const {
    posts,
    header,
    pathToNextPage,
    pathToPrevPage
  } = useContent()

  return (
    <>
      <Header {...header}/>
      <div>
        {
          posts.list.map(({id, body}) => (
            <p key={id}>{body}</p>
          ))
        }
      </div>
-     {pathToPrevPage && <a href={pathToPrevPage}>Prev Page</a>}
+     {pathToPrevPage && <a href={pathToPrevPage} data-sg-visit>Prev Page</a>}
-     {pathToNextPage && <a href={pathToNextPage}>Next Page</a>}
+     {pathToNextPage && <a href={pathToNextPage} data-sg-visit>Next Page</a>}
    </>
  )
}
```

## Optimize!

Let's skip `data.header` when navigating and dig for `data.posts`. For the
user, only the posts list changes, but the header stays the same.

!!! info
    In effect, this achieves the same functionality as [Turbo Frames], but
    Superglue leans more on Unobtrusive Javascript for better ergonomics.

[Turbo Frames]: https://turbo.hotwired.dev/handbook/frames

**`index.json.props`**

Recall how [digging] for content works. We'll add a `props_at` that digs for
the `json.posts` while skipping other content on that page.

  [digging]: ../tutorial.md#digging-with-props_at

```diff
# app/views/posts/index.json.props

json.header do
  ...
end

json.posts do
  json.list do
    json.array! @posts do |post|
      json.id post.id
      json.body post.body
      json.editPostPath edit_post_path(post)
    end
  end

- json.pathToNextPage path_to_next_page(@posts)
+ json.pathToNextPage path_to_next_page(@posts, props_at: 'data.posts')
- json.pathToPrevPage path_to_prev_page(@posts)
+ json.pathToPrevPage path_to_prev_page(@posts, props_at: 'data.posts')
end
```

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: Interested in infinite-scroll?](./infinite-scroll.md)
     for `visit`
</div>

[UJS]: ../ujs.md
