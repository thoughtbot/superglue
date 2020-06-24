# Unreleased changes

# 0.15
visit and remote can now be customized to place code before and after the thunk
gets called. These thunks are pre-wrapped with a dispatch and gets passed to the
NavComponent which then gets passed to the page components as props.

The generator will also generate a new application.js file that includes entry
points for this customization. This is a BREAKING CHANGE for the NavComponent.

Redux-Persist is now included as part of the generators. This solves an issue with
modifications to the state that is not persisted when a user leave a breezy
enabled page, and then loads the page from the disk cache later on only to see
no changes. This is due to the initial state that gets loaded from the DOM.

Redux-Persist does add another layer to the stack, but with a simplified migration
approach outlined in the commit, the pross outweigh the cons.

Browser navigation with hashes are now supported. The change leans on browser
defaults of jumping to the element. Interanally as long as the pathname and
query match, breezy will treat them as the same pageKey.
