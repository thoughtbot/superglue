# # Unreleased changes

## 0.10.0

- BREAKING CHANGE: `withBrowserBehavior` has been renamed to `enhanceVisitWithBrowserBehavior` and only accepts one arg, the visit action creator.
- FIX: `remote` now merges joints on graft requests
- BREAKING CHANGE: `remote` will update all joints before fetching nodes when using deferment. The previous behavior was to update after all deferred fetches were finished, but this caused some issues and confusion around proper behavior. This will be the fix for now.
- NEW: Breezy now dispatches `@@breezy/GRAFTING_ERROR`. This is a listenable action that you can use to retry deferments that fail due to network errors. You will recieve the `pageKey`, the `url` that failed, and the `keyPath` to the missing node.
- `remote` now has a fallback `pageKey` if one isn't provided.
- `ensureSingleVisit`, the function that powers `visit` is now exposed for use. Come in super handy when you want to create your own `visit` function. For example, instaclick functionality.
