# Modals

Modals are easy. Lets imagine a scenario where we have two urls:

1. `/posts`
2. `/posts/new`

When a user visits `/posts/new` from `/posts`, we want a modal to appear
overlaying the existing list of posts. The overlay should work if a user
chooses instead to directly visit `/posts/new`.

<!-- panels:start -->

<!-- div:title-panel -->

#### The setup
<!-- div:left-panel -->

Arriving at both urls results in a seeing list of posts. Lets set up the
controller and the `page_to_page_mapping.js` the same way.

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`posts_controller.rb`**

```ruby
# app/controllers/posts_controller.rb

def index
  @posts = Post.all
end

def new
  @posts = Post.all
  render :index
end
```

?> Notice that we're rendering the `index` for the `new` action. While the
content is the same, the `componentIdentifier` is different as that has
been setup to use the controller and action name.

#### **`page_to_page_mapping.js`**

```js
import PostIndex from '../views/posts/index'

export const pageIdentifierToPageComponent = {
  'posts/index': PostIndex,
  'posts/new': PostIndex,
};
```

?> Similarly, we tie the `componentIdentifier` to the same page component.

<!-- tabs:end -->

<!-- div:title-panel -->
#### Add a link to `/posts/new`
<!-- div:left-panel -->

Imagine a list of posts, lets add a button somewhere on the index page to
direct the user to `/posts/new`. As seen previously, both `/posts` and
`/posts/new` render the same thing.

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`posts/index.json`**

```ruby
# app/views/posts/index.json

...

json.newPostPath new_post_path
```

#### **`posts/index.js`**


```js
export default PostIndex = ({
  newPostPath,
  ...rest
}) => {

  return (
    ...
    <a
      href={newPostPath}
      >
      New Post
    </a>
    ...
  )
}
```

?> Similarly, we tie the `componentIdentifier` to the same page component.

<!-- tabs:end -->



<!-- div:title-panel -->
#### The modal
<!-- div:left-panel -->
Now the link appears and we're able to navigate to `/posts/new`, but
`/posts/new` is missing a modal. Not surprising as both routes are
rendering the same content.

Lets add a modal.

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`index.json`**

?> For simplicity, we'll use a "Hello World" as the modal contents

```diff
# app/views/posts/index.json

...

json.newPostPath new_post_path

+ json.createPostModal do
+   json.greeting "Hello World"
+ end

```

#### **`index.js`**

```diff
+ import Modal from './Modal'

export default PostIndex = ({
  newPostPath,
  createPostModal
  ...rest
}) => {

  return (
    ...
    <a
      href={newPostPath}
    >
      New Post
    </a>
+   <Modal {...createPostModal} />
    ...
  )
}
```

#### **`Modal.js`**

?> This is a simplified modal, in practice you'll use this with `<Dialog>` or
other modal library.

```js
import Modal from './Modal'

export default Modal = ({
  greeting
}) => {
  return (
    <div className="my-modal">{greeting}</div>
  )
}
```

<!-- tabs:end -->



<!-- div:title-panel -->
#### Too many modals
<!-- div:left-panel -->

Unfortunately, now BOTH routes have modals! Lets fix that by adding
a conditional render.

<!-- div:right-panel -->

<!-- tabs:start -->

#### **`index.json`**

```diff
# app/views/posts/index.json

...

json.newPostPath new_post_path

json.createPostModal do
  json.greeting "Hello World"
+ json.showModal @show_modal
end

```

#### **`posts_controller.rb`**

```diff
# app/controllers/posts_controller.rb

def index
  @posts = Post.all
+ @show_modal = false
end

def new
  @posts = Post.all
+ @show_modal = true
  render :index
end
```

#### **`Modal.js`**

```diff
import Modal from './Modal'

export default Modal = ({
  greeting,
+  showModal
}) => {
  return (
-   <div className="my-modal">{greeting}</div>
+   {showModal && <div className="my-modal">{greeting}</div>}
  )
}
```

<!-- tabs:end -->

<!-- div:title-panel -->
#### Finish!
<!-- div:left-panel -->

Awesome! We have modals! Unfortunately, clicking `<a href={newPostPath}>New Post</a>`
will cause a new page load. We can move the page load by adding
`data-sg-visit` to the link. With `data-sg-visit`, Superglue will navigate to the next
page without reloading the page, just like Turbo.


<!-- div:right-panel -->

<!-- tabs:start -->

#### **`posts/index.js`**


```diff
import Modal from './Modal'

export default PostIndex = ({
  newPostPath,
  createPostModal,
  ...rest
}) => {

  return (
    ...
    <a
      href={newPostPath}
+     data-sg-remote
    >
      New Post
    </a>
    <Modal {...createPostModal} />
    ...
  )
}
```

<!-- tabs:end -->

<!-- div:title-panel -->
#### Optimization
<!-- div:left-panel -->

With the above, a click on **New Post** while on `/posts` will

1. Fetch `/posts/new` with
`format=json`
2. Save the page to the store
3. Swap the page components
4. Change the url

Unfortunately, step 1 is still a full page load. Commonly, we
just want to load the modal without loading the entire page.

Lets fix that!



<!-- div:right-panel -->

<!-- tabs:start -->

#### **`index.json`**

Recall how [digging] for content works. We'll add a `props_at` that digs for
the modal on `/posts/new` while skipping other content on that page.

  [digging]: ../tutorial.md#digging-for-content

```diff
# app/views/posts/index.json

...

- json.newPostPath new_post_path
+ json.newPostPath new_post_path(props_at: `data.createPostModal`)

json.createPostModal do
  json.greeting "Hello World"
  json.showModal @show_modal
end

```

#### **`posts/index.js`**

Lastly add `data-sg-placeholder` to the link.

```diff
import Modal from './Modal'

export default PostIndex = ({
  newPostPath,
  createPostModal,
  ...rest
}) => {

  return (
    ...
    <a
      href={newPostPath}
      data-sg-visit
+     data-sg-placeholder="/posts"
      >
      New Post
    </a>
    <Modal {...createPostModal} />
    ...
  )
}
```

With the placeholder, the sequence becomes:

1. Copy the state in `/posts` to `/posts/new` in the store.
2. Fetch `/posts/new?props_at=data.createPostModal`
3. Graft the result to the store at `/posts/new`
3. Swap the page components
4. Change the url

?> Normally, `props_at` cannot be used with `data-sg-visit`, that's because the state
needs to exist for Superglue to know where to graft. With `data-sg-placeholder`, we
take an existing page and copy that over as a placeholder for what doesn't exist yet.

<!-- tabs:end -->
<!-- panels:end -->

