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
import { visit, remote } from '@thoughtbot/superglue/action_creators'
+ import { requestStripe } from 'request-stripe';

export function buildVisitAndRemote(ref, store) {
  const appRemote = (path, {dataset, options} = {}) => {
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
    return store.dispatch(remote(path, options))
+       .finally(() => done())
  }

  const appVisit = (path, {dataset, ...options} = {}) => {
+   const done = requestStripe()
    return store
      .dispatch(visit(path, options))
      .then((meta) => {
        if (meta.needsRefresh) {
          window.location = meta.url
          return
        }

        ref.current.navigateTo(meta.pageKey, {
          action: meta.navigationAction,
        })

        return meta
      })
      .finally(() => {
+       done()
      })
      .catch((err) => {
        const response = err.response

        if (!response) {
          console.error(err)
          return
        }

        if (response.ok) {
          window.location = response.url
        } else {
          if (response.status >= 400 && response.status < 500) {
            window.location = '/400.html'
            return
          }

          if (response.status >= 500) {
            window.location = '/500.html'
            return
          }
        }
      })
  }

  return { visit: appVisit, remote: appRemote }
}
````
