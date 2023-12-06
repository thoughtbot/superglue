# Usage with Kaminari

Pagination without reload is easy to add.

<!-- panels:start -->

<!-- div:title-panel -->

#### Starting point

<!-- div:left-panel -->
Lets pretend that we're already able to see a list of posts.

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`posts_controller.rb`**

```ruby
# app/controllers/posts_controller.rb

def index
  @posts = Post.all
end
```

#### **`index.json.props`**

```ruby
# app/views/posts/index.json.props

json.rightNav do
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
end
```

#### **`index.js`**

```js
# app/views/posts/index.js

import React from 'react'
import PostList from './PostList'
import RightNav from './RightNav'

export default PostIndex = ({
  posts,
  rightNav
}) => {
  return (
    <>
      <RightNav {...rightNav}>
      <PostList items={posts}>
    </>
  )
}

```


<!-- tabs:end -->

<!-- div:title-panel -->

#### Add gems

<!-- div:left-panel -->
Lets also add Kaminari.

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`terminal`**

```terminal
bundle install kaminari
```

<!-- tabs:end -->

<!-- div:title-panel -->

#### Add pagination

<!-- div:left-panel -->

The changes here aren't indifferent from using Kaminari with
`.erb`. We're using `path_to_next_page` and `path_to_prev_page`
which come with Kaminari.

?> Some [helpers] like `paginate` output HTML instead of
JSON, but we can still use more primitives methods.

  [helpers]: https://github.com/kaminari/kaminari#the-paginate-helper-method

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`posts_controller.rb`**

```diff
# app/controllers/posts_controller.rb

def index
  @posts = Post.all
+   .page(params[:page_num])
+   .per(10)
+   .order(created_at: :desc)
end
```

#### **`index.json.props`**

```diff
# app/views/posts/index.json.props

json.rightNav do
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
+
+ json.pathToNextPage path_to_next_page(@posts)
+ json.pathToPrevPage path_to_prev_page(@posts)
end
```

#### **`index.js`**

```diff
# app/views/posts/index.js
import React from 'react'
import PostList from './PostList'
import RightNav from './RightNav'

export default PostIndex = ({
  posts,
  rightNav
+  pathToNextPage,
+  pathToPrevPage
}) => {
  return (
    <>
      <PostList items={posts}>
+     <a
+       href={pathToNextPage}
+     >
+       Next Page
+     </a>
+     <a
+       href={pathToPrevPage}
+     >
+       Prev Page
+     </a>
    </>
  )
}

```

<!-- tabs:end -->

<!-- div:title-panel -->

#### Smooth navigation

<!-- div:left-panel -->

The above adds pagination, but each click on **Next Page** adds
a new page load.

Lets navigate without a reload. In this example, we're using `data-sg-remote`,
which would set the current page's state to the response without changing the URL.

?> `data-sg-visit` adds a new page to the store and changes the URL, but can't make use
of `props_at` unless a `data-sg-placeholder` is present. `data-sg-remote` can add a new page,
make use of the `props_at` parameter, but does not change the URL.

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`index.js`**

```diff
# app/views/posts/index.js
import React from 'react'
import PostList from './PostList'
import RightNav from './RightNav'

export default PostIndex = ({
  posts,
  rightNav,
  pathToNextPage,
  pathToPrevPage
}) => {
  return (
    <>
      <PostList items={posts}>
      <a
        href={pathToNextPage}
+       data-sg-remote
      >
        Next Page
      </a>
      <a
        href={pathToPrevPage}
+       data-sg-remote
      >
        Prev Page
      </a>
    </>
  )
}

```

<!-- tabs:end -->

<!-- div:title-panel -->

#### Optimize!

<!-- div:left-panel -->
Lets skip `data.rightNav` when navigating and dig for `data.posts`. For the
user, only the posts lists change, but the rightNav stays the same.

?> In effect, this achieves the same functionality as [Turbo Frames], but
Superglue leans more on Unobtrusive Javascript and a simple `props_at` for
better ergonomics.

[Turbo Frames]: https://turbo.hotwired.dev/handbook/frames

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`index.json.props`**

Recall how [digging] for content works. We'll add a `props_at` that digs for
the `json.posts` while skipping other content on that page.

  [digging]: ../tutorial.md#digging-for-content

```diff
# app/views/posts/index.json.props

json.rightNav do
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

<!-- tabs:end -->
<!-- panels:end -->
