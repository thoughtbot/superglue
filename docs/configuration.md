You've installed Superglue and now you're ready to configure your app.

## `application_visit.js`

!!! tip
    If you want a [progress bar], this is the first thing you'll want to
    configure after installation.

This file contains the factory that builds the [remote] and [visit]
function that will be passed to your page components and used by the
[data-sg-visit] and [data-sg-remote] UJS attributes.

This file is meant for you to customize. For example, you'll likely
want to add a [progress bar], control how visits work, or flash
when the internet is down.

[remote]: requests.md#remote
[visit]: requests.md#visit
[data-sg-remote]: ujs.md#data-sg-remote
[data-sg-visit]: ujs.md#data-sg-visit
[progress bar]: recipes/progress-bar.md


## `page_to_page_mapping.js`

!!! info
    Stop by the [tutorial] to learn how to work with this file.

    **Vite Users** This step can be entirely optional if you're using Vite. See
    the [recipe](recipe/vite.md) for more information.

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

The installation generator will add a `flash.js` slice to `app/javascript/slices`
and will work with the Rails `flash`. You can modify this however you like, out of the box:

  - When using `data-sg-visit`, all data in the flash slice will be cleared before the request.
  - When using `data-sg-visit` or `data-sg-remote`, the recieved flash
    will be merged with the current flash. You can change this behavior
    by modifying the flash slice.


!!! hint
    If you're curious how this works, in your layout, `application.json.props`,
    the flash is serialized using `flash.to_h`


To use in your page components, simply use a selector.

```jsx
import { useSelector } from 'react-redux'

...

const flash = useSelector((state) => state.flash)
```

then use the flash as you would normally in a controller

```ruby
def create
  flash[:success] = "Post was saved!"
end
```

[buildStore]: reference/index.md#buildstore
[visitAndRemote]: requests.md
[mapping]: reference/index.md#mapping
[installation]: installation.md

