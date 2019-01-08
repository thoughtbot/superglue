# # Unreleased changes

# v0.11.0
BREAKING CHANGE: partial rendering was passed existing context prefixes when it wasn't supposed to, this broke some parts of caching, and generated the wrong fragment cache key.
Fix: When using node filtering eg. `_bz=foo.bar.my_node`, caching on the targest ancestors is disabled.
Fix: Inline partials were not caching properly, it ran and saved the partial in the cache every time.
BREAKING CHANGE: Rename `_bz` param to `bzq`

