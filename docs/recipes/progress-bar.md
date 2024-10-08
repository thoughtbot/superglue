Superglue does not come with a progress bar as it can be a personalized choice
on how the indicator functions and looks. Instead we have
`application_visit.js` where you can add the functionality however you like.

In this recipe, we'll add a simple progress bar that will show when `visit` and `remote`
gets used. You can choose to implement it for only `visit` instead.

```terminal
yarn add request-stripe
```

And make the following edits to `application_visit.js`

```diff
import { visit, remote } from '@thoughtbot/superglue/action_creators'
+ import { requestStripe } from 'request-stripe';

export function buildVisitAndRemote(ref, store) {
  const appRemote = (...args) => {
+   const done = requestStripe();
    return store.dispatch(remote(...args))
+       .finally(() => done())
  }

  const appVisit = (...args) => {
+   const done = requestStripe();

    // Do something before
    // e.g, show loading state, you can access the current pageKey
    // via store.getState().superglue.currentPageKey
    let { action } = args

    return store
      .dispatch(visit(...args))
      .then((meta) => {
        // The assets fingerprints changed, instead of transitioning
        // just go to the URL directly to retrieve new assets
        if (meta.needsRefresh) {
          window.location = meta.url
          return
        }

        ref.current.navigateTo(meta.pageKey, {
          action: meta.suggestedAction,
        })

        // always return meta
        return meta
      })
      .finally(() => {
        // Do something after
        // e.g, hide loading state, you can access the changed pageKey
        // via getState().superglue.currentPageKey
+       done()
      })
      .catch((err) => {
        const response = err.response

        if (!response) {
          console.error(err)
          return
        }

        if (response.ok) {
          // err gets thrown, but if the response is ok,
          // it must be an html body that
          // superglue can't parse, just go to the location
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
```
