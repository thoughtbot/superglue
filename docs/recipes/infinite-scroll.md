# Infinite scroll

In this recipe, we'll add infinite scroll to our application. Superglue doesn't
have an infinite scroll component, but it has tools that make it easy to
work with React's ecosystem.

Lets begin by adding `react-infinite-scroll-hook`

```
yarn add react-infinite-scroll-hook
```

And continue off from our [pagination] recipe.

!!! tip
    We'll use the `beforeSave` callback to modify the payload before superglue
    saves it to the store. This callback is an option for both `visit` and
    `remote` functions. See the
    [beforeSave reference](../reference/types.requests/#beforesave-2) for more details.

```diff
// app/views/posts/index.js

import React from 'react'
- import {useContent} from '@thoughtbot/superglue'
+ import {useContent, NavigationContext} from '@thoughtbot/superglue'
import PostList from './PostList'
import Header from './Header'
+ import useInfiniteScroll from 'react-infinite-scroll-hook';

export default PostIndex = () => {
  const {
    posts,
    header,
    pathToNextPage,
    pathToPrevPage
  } = useContent()

+ const { remote, pageKey } = useContext(NavigationContext)
+ const { loading, setLoading } = useState(false)
+ const hasNextPage = !!pathToNextPage
+
+ const beforeSave = (prevPage, receivedPage) => {
+   const prevPosts = prevPage.data.posts
+   const receivedPosts = receivedPage.data.posts
+   receivedPage.data.posts = prevPosts + receivedPosts
+
+   return receivedPage
+ }
+
+ const loadMore = () => {
+   setLoading(true)
+   remote(pathToNextPage, {pageKey, beforeSave})
+     .then(() => setLoading(false))
+ }
+
+ const [sentryRef] = useInfiniteScroll({
+   loading,
+   hasNextPage,
+   onLoadMore: loadMore,
+ });

  return (
    <>
      <Header {...header}/>
      <div>
        {
          posts.list.map(({id, body}) => (
            <p key={id}>{body}</p>
          ))
        }
+       {(loading || hasNextPage) && (
+         <p ref={sentryRef}>
+           loading
+         </p>
+       )}
      </div>
-     {pathToPrevPage && <a href={pathToPrevPage} data-sg-visit>Prev Page</a>}
-     {pathToNextPage && <a href={pathToNextPage} data-sg-visit>Next Page</a>}
    </>
  )
}

```

[pagination]: ./spa-pagination.md
