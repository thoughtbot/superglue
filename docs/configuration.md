You've installed Superglue and now you're ready to configure your app.

## `application_visit.js`

Modify the `application_visit.js` file to intercept and enhance Superglue's core
navigation functions. It contains a single exported factory that builds the
[remote] and [visit] functions that will be used by Superglue, your application,
and the UJS attributes [data-sg-visit] and [data-sg-remote].

The pattern looks like this:

```js
export const buildVisitAndRemote = (ref, store) => {
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
    : meta.navigationAction
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

## `application.js`

This is the entry point of your application and uses Superglue's [Application]
component. There's nothing to do here, but if you need finer control of
how redux is setup, you can build your own Application using the [source] as
inspiration.

[source]: https://github.com/thoughtbot/superglue/blob/main/superglue/lib/index.tsx#L114

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: See complete reference](reference/index.md#application)
     for `Application`
</div>

## `flash.js`

The installation generator will add a `flash.js` slice to
`app/javascript/slices` and will work with the Rails `flash`. This file is an
example of a custom [slice](./redux.md#flashjs).

<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: Read more](./redux.md)
      about custom slices and `flash.js`.
</div>


[buildStore]: reference/index.md#buildstore
[visitAndRemote]: requests.md
[mapping]: reference/index.md#mapping
[installation]: installation.md

