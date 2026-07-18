# Replicating Turbo behavior

With `data-sg-visit`, Superglue will always wait for a response before a
navigation transition. Turbo's behavior is to transition first if possible
while waiting for the response. To replicate this behavior:

In your `application_visit.js` file:

```diff

+ import { urlToPageKey } from '@thoughtbot/superglue'

  const appVisit = (path, {dataset, ...options} = {}) => {
+   const pageKey = urlToPageKey(path)
+   // attempt to navigate first
+   navigateTo(pageKey)

    return visit(path, options)
      ....
```

This is different from [restore strategy] which controls what happens
when the browser's `history` object pops.

[restore strategy]: ../page-response.md#restorestrategy
