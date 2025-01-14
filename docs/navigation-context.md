# NavigationContext

In addition to `visit` and `remote`, the `NavigationContext` provides a few
other methods and properties that are best decribed in the context of
`navigateTo`.

```
import { NavigationContext } from '@thoughtbot/superglue'

const {
  navigateTo,
  visit,
  remote,
  pageKey,
  search
} = useContext(NavigationContext)
```

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: See complete reference](../reference/types/#navigationcontextprops)
     for `NavigationContext`
</div>

## `navigateTo`

Fundamentally, `visit` is responsible for `fetch`ing a page, [saving] it, and
lastly use `navigateTo` to load the page, update the url, and swap the page
component. The NavigationContext exposes `navigateTo` for you to use
use independently. For example:

```javascript
navigateTo('/posts')
```

!!! Note
    The page must exist in the store, or `navigateTo` will throw a error. Use [copyPage]
    to prepopulate before navigating.


`navigateTo` is especially useful for optimistic navigation like local facted
search and works best when combined with `search` and `pageKey` from the same
NavigationContext, and the [copyPage] action.

In this example, we'll assume we're on pageKey "/posts":

```
import { copyPage, NavigationContext } from '@thoughtbot/superglue'
import { myAppDispatch } from '@myJavascript/store'

// In your component somewhere
const {
  navigateTo,
  pageKey,
  search
} = useContext(NavigationContext)

const nextPageKey = pageKey + "?active=true"
dispatch(copyPage({from: pageKey, to: nextPageKey}))

// On a click handler
navigateTo(nextPageKey, { action: 'push'})

// later after navigation.
console.log(search) // would return {active: "true"}
```

With the above, we're able to make use of the URL search param as a source of
state. And by using `navigateTo`, we're able to filter local results while updating
the URL.

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: See complete reference](reference/types.md#navigateto-1)
     for `navigateTo`
</div>

[saving]: ../reference/#saveandprocesspage
[copyPage]: ../reference/#copypage
