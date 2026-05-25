Superglue does not come with a progress bar as it can be a personalized choice
on how the indicator functions and looks. Instead we have
`application_visit.js` where you can add the functionality however you like.

In this recipe, we'll add a simple progress bar that will show when `visit` and `remote`
gets used. You can choose to implement it for only `visit` instead.

```terminal
yarn add request-stripe
```

And make the following edits to `application_visit.js`

````diff
+ import { requestStripe } from 'request-stripe';

export const buildVisitAndRemote = ({navigateTo, visit, remote}) => {
  const appRemote = (path, {dataset, ...options} = {}) => {
    /**
     * You can make use of `dataset` to add custom UJS options.
     * If you are implementing a progress bar, you can selectively
     * hide it for some links. For example:
     *
     * ```
     * <a href="/posts?props_at=data.header" data-sg-remote data-sg-hide-progress>
     *   Click me
     * </a>
     * ```
     *
     * This would be available as `sgHideProgress` on the dataset
     */
+   const done = requestStripe()
    return remote(path, options)
+     .finally(() => done())
  }

  const appVisit = (path, {dataset, ...options} = {}) => {
+   const done = requestStripe()
    return visit(path, options)
      .then(result => {
        const navigationAction = !!dataset?.sgReplace
          ? "replace"
          : result.navigationAction
        navigateTo(result.pageKey, {
          action: navigationAction,
        })

        return result
      })
      .finally(() => {
+       done()
      })
  }

  return { visit: appVisit, remote: appRemote }
}
````
