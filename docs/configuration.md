## `application_visit.js`

!!! hint
    If you want a progress bar, this is likely the first thing you'll
    want to configure after installation.

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

!!! hint
    Stop by the [tutorial] to get an idea of how to work with this file.

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

It's not uncommon to have multiple identifiers pointing to the same component.
This can be used when building `index` pages use modals instead of a new page for
`show`.

```js
const pageIdentifierToPageComponent = {
  'posts/index': PostsIndex,
  'posts/show': PostsIndex,
}
```

[tutorial]: tutorial.md

## `application.js`

!!! hint
    Normally you wouldn't need to configure this class as it'll be generated
    for you.

Your `Application` component inherits from Superglue's [ApplicationBase]
abstract class and is the entry point for your Superglue app. It overrides
the methods [buildStore], [visitAndRemote], and [mapping], to perform
setup of redux, UJS, and other functionality.


```js
import { ApplicationBase } from '@thoughtbot/superglue'

export default class Application extends ApplicationBase {
  ...
}
```


<div class="grid cards" markdown>
  -  [:octicons-arrow-right-24: See complete reference](reference/index.md#abstract-applicationbase)
     for `ApplicationBase`
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

[ApplicationBase]: reference/index.md#abstract-applicationbase
[buildStore]: reference/index.md#buildstore
[visitAndRemote]: requests.md
[mapping]: reference/index.md#mapping
[installation]: installation.md
