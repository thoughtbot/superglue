# Changelog

All notable changes to this project will be documented in this file.

## 0.19
Breezy can now be rendered on SSR using [humid](https://github.com/thoughtbot/humid).

Remove helpers and methods no longer needed.
- `props_from_form_with`
-  Let the browser handle xdomain reqs.

Renamed `master` to `main`

## 0.17

Added more fined grained control over deferments by allowing to specify custom
success and fail action creators:
```
json.inner(defer: [:auto, success_action: 'SUCCESS', fail_action: 'FAIL']) do
  json.greeting do
    json.foo 'hello world'
  end
end
```

Fragment auto update is removed as the feature seemed too brittle to use.
Instead I'm encouraging users do this by themselves on the front using standard
redux reducers. The fragment functionality has been changed to as a way to
optionally tag your nodes with information about the partial being used, the
path where the tag occured and the name you give to it. You can use this information to iterate across all your pages in your own reducer.:

```
fragments: [
  {type: 'header', partial: 'header', path: 'data.a.b.c'}
],
```


Using the replace action in navigateTo to change the URL will now also
replace the state in the same location in the store.


## 0.16
Remove reset_encoder! This strategy was not necessary and prevented
props_template from being used in Puma.

Fix potential memory leak in OJ by dup'ing keys before push_key. This does make
props_template a tiny bit slower.

## 0.15
visit and remote can now be customized to place code before and after the thunk
gets called. These thunks are pre-wrapped with a dispatch and gets passed to the
NavComponent which then gets passed to the page components as props.

The generator will also generate a new application.js and an application_visit.js
file that includes entry points for this customization. This is a BREAKING CHANGE
for the NavComponent.

Redux-Persist is now included as part of the generators. This solves an issue with
modifications to the state that is not persisted when a user leave a breezy
enabled page, and then loads the page from the disk cache later on only to see
no changes. This is due to the initial state that gets loaded from the DOM.

Redux-Persist does add another layer to the stack, we add a simplified migration
approach outlined in the commit.

Browser navigation with hashes are now supported. The change leans on browser
defaults of jumping to the element. Interanally as long as the pathname and
query match, breezy will treat them as the same pageKey.

`application.js` refactored to a component. This enables better server side
rendering of HTML using `react-rails`

`RailsTag` is now powered by `html-react-parser` which includes server side
support.

`Breezy.start` expects different and better named arguments, this is a BREAKING
CHANGE.

`fetch` is now injected to Breezy. This enables server side rendering AND
ReactNative use cases. The latter used to be supported but was removed because of
resources

PropsTemplate now uses a single instance of Oj's StringWriter, be sure to update
your rails initializer to call `Props.reset_encoder!`

## v0.14.0
- Add UJS attributes data-bz-remote and data-bz-visit
- Add copyPage action to allow optimistic updates
- Allow visit thunks to use urls with bzq by allowing a placeholder option
- Ensure all requests made by breezy gets a __=0 cache buster retained through redirect
- Remove formik and use Rails forms
- Add RailsTag component to use Rails innerhtml without a container tag
- Updated generators
- Add props_from_form_with to generate props for forms from Rails
- Add redirect_back_with_bzq to redirect back while retaining the bzq param

## v0.13.0
- Breezy only supports rail 6 and on.
- BreezyTemplate is now replaced with PropsTemplate. Notable improvements over BreezyTemplate:
  - Support for application layouts, e.g `application.json.props`
  - Mutli-fetch on `json.array!`
  - `render_collection` like behavior (single lookup for a partial) for `json.array!(partial: 'foobar)'`
  - Explicit control over node traversal via search options e.g `json.foobar(search:'foobar.posts.id=1')`
  - Renders `json` instead of `js`
- BreezyJS no longer uses Server Generated Javascript Responses. It uses JSON and is now easier to use your favorite JSON browser plugin to see the JSON version of your page, for example: `localhost:3000/posts.json`
- Breezy Rails controller requirements is simplified, no macros needed just plain Rails, be sure to `rails generate scaffold post` or `rails breezy:install:web` to see what changed.

## v0.12.0

- Update tests for rails 6
- Remove support for rails 4
- Update gemspec, removed some unneeded dependancies
- Use JSON.dump instead of MultiJSON
- Remove dead comments and methods
- Drop pessimistic version constraint

## v0.11.0
BREAKING CHANGE: partial rendering was passed existing context prefixes when it wasn't supposed to, this broke some parts of caching, and generated the wrong fragment cache key.
Fix: When using node filtering eg. `_bz=foo.bar.my_node`, caching on the targest ancestors is disabled.
Fix: Inline partials were not caching properly, it ran and saved the partial in the cache every time.
BREAKING CHANGE: Rename `_bz` param to `bzq`

## 0.10.0

- BREAKING CHANGE: `withBrowserBehavior` has been renamed to `enhanceVisitWithBrowserBehavior` and only accepts one arg, the visit action creator.
- BREAKING CHANGE: All keys `json.my_key_here` in BreezyTemplate will `key_format` to camelCase `{"myKeyHere": 'foobar'}`. This makes working with props received via `mapStateToProps` easier to work with.
- FIX: `remote` now merges joints on graft requests
- BREAKING CHANGE: `remote` will update all joints before fetching nodes when using deferment. The previous behavior was to update after all deferred fetches were finished, but this caused some issues and confusion around proper behavior. This will be the fix for now.
- NEW: Breezy now dispatches `@@breezy/GRAFTING_ERROR`. This is a listenable action that you can use to retry deferments that fail due to network errors. You will recieve the `pageKey`, the `url` that failed, and the `keyPath` to the missing node.
- `remote` now has a fallback `pageKey` if one isn't provided.
- `ensureSingleVisit`, the function that powers `visit` is now exposed for use. Come in super handy when you want to create your own `visit` function. For example, instaclick functionality.
- BREAKING CHANGE: Remove immutable helpers. It doesn't seem like good practice to create immutable action creators, probably doing too much work for the user and makes testing more difficult. Instead recommend and document immmer usage and keep getIn (exported for traversing), and setIn (for internal use) around.
- BREAKING CHANGE: `remote` will update all joints before fetching nodes when using deferment. The previous behavior was to update after all deferred fetches were finished, but this caused some issues and confusion around proper behavior. This will be the fix for now.
- BREAKING CHANGE: `visit` will strip all `_bz` from url params.
- BREAKING CHANGE: rename joints to fragments. Makes more sense conceptually.
- BREAKING CHANGE: remove `forEachPathToJointAcrossAllPages` and encourage the users to just iterate through each page and make the changes on their own. There are some attributes that are now moved to `privateOpts`, a key/value meant for internal use only.
- FIX: Deferment wasn't working on multiple nested partials
