# Replicating Turbolinks behavior

With `visit`, Breezy will always wait for a response before a navigation
transition. Turbolink's behavior is to transition first if possible while
waiting for the response. To replicate this behavior:

In your `application_visit.js` file:

```javascript

import { urlToPageKey } from '@thoughtbot/breezy/utils/url'

const appVisit = (...args) => {

  const pageKey = urlToPageKey(args[0])
  // attempt to navigate first
  this.ref.current.navigateTo(pageKey)

  return store
    .dispatch(visit(...args))
    ....
```

