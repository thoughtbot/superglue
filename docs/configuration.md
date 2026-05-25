You've installed Superglue and now you're ready to configure your app.

## `application.js`

This is the entry point of your application. You can add a custom layout here.

```jsx
const { Provider, Outlet, ujs } = createApp({
  // The base url prefixed to all calls made by `visit` and `remote`.
  baseUrl: location.origin,
  // The global var SUPERGLUE_INITIAL_PAGE_STATE is set by your erb
  // template, e.g., index.html.erb
  initialPage: window.SUPERGLUE_INITIAL_PAGE_STATE,
  // The initial path of the page, e.g., /foobar
  path: location.pathname + location.search + location.hash,
  // Callback used to setup visit and remote
  buildVisitAndRemote,
  // Mapping between the page identifier to page component
  mapping: pageIdentifierToPageComponent,
});

const root = createRoot(appEl);
root.render(
  <div onClick={ujs.onClick} onSubmit={ujs.onSubmit}>
    <Provider>
      <MyLayout>
        <Outlet />
      </MyLayout>
    </Provider>
  </div>,
);
```

## `page_to_page_mapping.js`

!!! info
    Stop by the [tutorial] to learn how to work with this file.

    **Vite Users** This step can be entirely optional if you're using Vite. See
    the [recipe](recipes/vite.md) for more information.

This file exports a mapping between a `componentIdentifier` to an imported page
component. This gets used in your `application.js` so that superglue knows
which component to render with which identifier.

For example:

```js
const pageIdentifierToPageComponent = {
  'posts/edit': PostsEdit,
  'posts/new': PostsNew,
  'posts/show': PostsShow,
  'posts/index': PostsIndex,
}
```

[tutorial]: tutorial.md

## `application_visit.js`

Modify the `application_visit.js` file to intercept and enhance Superglue's core
navigation functions. It contains a single exported factory that builds the
[remote] and [visit] functions that will be used by Superglue, your application,
and the UJS attributes [data-sg-visit] and [data-sg-remote].

The pattern looks like this:

```js
export const buildVisitAndRemote = ({navigateTo, visit, remote}) => {
  // Your custom logic here
  return { visit: appVisit, remote: appRemote }
}
```

To get you started, the generator creates an application_visit.js file with your
first custom UJS attribute: data-sg-replace, which allows a link click or form
submission to replace history instead of the usual push.

```js
  const navigationAction = !!dataset?.sgReplace
    ? "replace"
    : result.navigationAction
```

This is where you'll add [progress bars], error handling, custom UJS attributes,
analytics tracking, or any navigation behavior your app needs. Since every
navigation goes through these functions, you have complete control over the
developer experience.

[remote]: requests.md#remote
[visit]: requests.md#visit
[data-sg-remote]: ujs.md#data-sg-remote
[data-sg-visit]: ujs.md#data-sg-visit
[progress bars]: recipes/progress-bar.md