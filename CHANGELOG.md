# Changelog

All notable changes to this project will be documented in this file.

<!-- Unreleased changes should go to UNRELEASED.md -->

## v0.20.0
- Breezy only supports rail 6 and on.
- BreezyTemplate is now replaced with PropsTemplate. Notable improvements over BreezyTemplate:
  - Support for application layouts, e.g `application.json.props`
  - Mutli-fetch on `json.array!`
  - `render_collection` like behavior (single lookup for a partial) for `json.array!(partial: 'foobar)'`
  - Explicit control over node traversal via search options e.g `json.foobar(search:'foobar.posts.id=1')`
  - Renders `json` instead of `js`
- BreezyJS no longer uses Server Generated Javascript Responses. It uses JSON and is now easier to use your favorite JSON browser plugin to see the JSON version of your page, for example: `localhost:3000/posts.json`
- Breezy Rails controller requirements is simplified, no macros needed just plain Rails, be sure to `rails generate scaffold post` or `rails breezy:install:web` to see what changed.

---
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
