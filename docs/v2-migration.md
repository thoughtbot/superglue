# Migrating from Superglue v1 to v2

This guide covers the breaking changes and new features in Superglue v2, and
how to update your application.

## Entry point: `Application` replaced by `createApp`

The `Application` component and `setup`/`prepareStore` functions have been
removed. Replace them with the new `createApp` factory function.

**Before (v1):**

```tsx
import { Application } from '@thoughtbot/superglue'

function App() {
  return (
    <Application
      initialPage={window.SUPERGLUE_INITIAL_PAGE_STATE}
      baseUrl={location.origin}
      path={location.pathname + location.search + location.hash}
      store={store}
      buildVisitAndRemote={buildVisitAndRemote}
      mapping={mapping}
    />
  )
}
```

**After (v2):**

```tsx
import { createApp } from '@thoughtbot/superglue'

const { Provider, Outlet, ujs } = createApp({
  initialPage: window.SUPERGLUE_INITIAL_PAGE_STATE,
  baseUrl: location.origin,
  path: location.pathname + location.search + location.hash,
  mapping,
  buildVisitAndRemote,
})

createRoot(document.getElementById('app')!).render(
  <div onClick={ujs.onClick} onSubmit={ujs.onSubmit}>
    <Provider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </Provider>
  </div>
)
```

Key differences:

- **No more store prop.** The store is created internally by `createApp`.
  You no longer need to configure or pass a Redux store.
- **Provider and Outlet are separate.** This lets you wrap `<Outlet />` with
  your own layout components.
- **UJS handlers are returned,** not baked into a wrapper `<div>`. Attach
  `ujs.onClick` and `ujs.onSubmit` wherever you need them.

## `buildVisitAndRemote` signature changed

The callback now receives an object instead of positional arguments.

**Before (v1):**

```ts
function buildVisitAndRemote(navigatorRef, store) {
  const visit = (path, options) => {
    // ...
  }
  const remote = (path, options) => {
    // ...
  }
  return { visit, remote }
}
```

**After (v2):**

```ts
function buildVisitAndRemote({ navigateTo, visit, remote }) {
  const appVisit = (path, options) => {
    // Use visit(path, options) — already wired to the store
    return visit(path, options)
  }
  const appRemote = (path, options) => {
    return remote(path, options)
  }
  return { visit: appVisit, remote: appRemote }
}
```

The context object provides:

- `navigateTo` — navigate from cache without a fetch
- `visit` — pre-wired visit thunk (replaces manually dispatching to the store)
- `remote` — pre-wired remote thunk

## Store and reducers are no longer exported

In v1, you built your own store using the exported `superglueReducer`,
`pageReducer`, and `rootReducer`. In v2, store creation is handled internally.

**Removed exports:**

- `superglueReducer`
- `pageReducer`
- `rootReducer`
- `prepareStore`
- `setup`
- `Application`

If you had custom Redux slices, you can no longer pass them into the store
directly. Instead, use the hooks and actions provided by Superglue to interact
with state.

## Response type renames

The server response protocol has been renamed for clarity.

| v1              | v2                                             |
| --------------- | ---------------------------------------------- |
| `VisitResponse` | `SaveResponse`                                 |
| `PageResponse`  | `PageResponse` (now includes `StreamResponse`) |

`SaveResponse` also gains:

- `flash: FlashState` — flash messages are now part of the protocol
- `action: 'savePage'` — a discriminant field

`GraftResponse` gains:

- `flash: FlashState`
- `fragmentContext?: string` — for fragment-scoped grafts

## `slices` removed from the response

In v1, `VisitResponse` included a `slices` field for dispatching extra Redux
slice data. This field has been removed in v2. Use the new flash system or
fragment hooks instead.

## Fragment changes

Fragments have been significantly reworked from simple metadata tags into a
normalized data layer.

### Response format

**Before (v1):**

```json
{
  "fragments": [{ "type": "header", "path": "data.header" }]
}
```

**After (v2):**

```json
{
  "fragments": [{ "id": "header-abc123", "path": "data.header" }]
}
```

The `type` field is now `id`, and fragments are stored in a separate
`fragments` slice in the Redux store.

### New fragment actions

v2 adds dedicated actions for working with fragments:

- `saveFragment({ fragmentId, data, pageKey })`
- `updateFragment({ fragmentId, data })`
- `appendToFragment({ fragmentId, data })`
- `prependToFragment({ fragmentId, data })`
- `removeFragments({ fragmentIds })`

The v1 `updateFragments` action has been removed.

### New fragment hooks

```ts
// Access a single fragment's data
const fragment = useFragment<MyType>('header-abc123')

// Update a fragment with an Immer producer
const updateFragment = useUpdateFragment('header-abc123')
updateFragment((draft) => {
  draft.title = 'New title'
})
```

### Proxy system

Fragment data is now accessed through transparent proxies that automatically
resolve `FragmentRef` objects. Use the `unproxy()` utility to extract raw data
when needed:

```ts
import { unproxy } from '@thoughtbot/superglue'

const rawData = unproxy(proxyData)
```

## New hooks

v2 adds several new hooks:

| Hook                    | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `useFragment(id)`       | Access a single fragment by ID             |
| `useUpdateContent()`    | Immer-based mutations on current page data |
| `useUpdateFragment(id)` | Immer-based mutations on a fragment        |
| `useFlash()`            | Read flash messages from the store         |
| `useSetFlash()`         | Set or clear flash messages                |
| `useStreamSource()`     | Subscribe to ActionCable/AnyCable streams  |

The existing hooks remain:

- `useContent()` — still works, now resolves fragments via proxies
- `useSuperglue()` — unchanged

## Flash messages: first-class support

Flash is now built into the core instead of being a user-managed Redux slice.

**v1:** Flash handling was left to the user via custom Redux slices.

**v2:**

```ts
// Reading flash
const flash = useFlash<{ notice?: string; alert?: string }>()

// Setting flash
const setFlash = useSetFlash()
setFlash({ notice: 'Saved!' })
```

Flash state lives at `state.flash` in the Redux store and is automatically
populated from `SaveResponse.flash`.

## Redux state shape changes

The root state gained two new top-level keys:

```ts
// v1
interface RootState {
  superglue: SuperglueState
  pages: AllPages
}

// v2
interface RootState {
  superglue: SuperglueState
  pages: AllPages
  fragments: AllFragments // NEW
  flash: FlashState // NEW
}
```

## Streaming support (new feature)

v2 adds real-time updates via ActionCable or AnyCable. Pass a `cable`
consumer to `createApp`:

```tsx
import { createConsumer } from '@rails/actioncable'

const { Provider, Outlet, ujs } = createApp({
  // ...existing options
  cable: createConsumer(),
})
```

In your page components, subscribe to streams:

```tsx
import { useStreamSource } from '@thoughtbot/superglue'

function ChatPage() {
  useStreamSource('ChatChannel', { room: 'general' })
  // Content updates automatically via fragments
}
```

Server-side stream responses use the new `StreamResponse` type with
`append`, `prepend`, and `update` actions.

## Action changes

### Removed

- `updateFragments` — replaced by fragment-specific actions
- `GRAFTING_SUCCESS` — no longer exported
- `GRAFTING_ERROR` — no longer exported

### Added

- `receiveResponse({ pageKey, response })` — internal response handling
- `resetStore` — reset Superglue state
- `saveFragment` / `updateFragment` / `appendToFragment` / `prependToFragment` / `removeFragments`
- `updateContent({ pageKey, data })` — update page content
- `flash({ flash })` / `clearFlash({ key? })` — flash management

### Changed

- `saveResponse` now accepts `SaveResponse` (was `VisitResponse`)

## Visit and remote return types

Return values now use discriminated unions for better error handling.

**Before (v1):**

```ts
const result = await visit('/posts')
// result: Meta (single type, check properties)
```

**After (v2):**

```ts
const result = await visit('/posts')
if (result.hasError) {
  // result: ErrorResult — access result.response
} else {
  // result: VisitResult — access result.navigationAction, etc.
}
```

## New exports

- `webVisit(store, path, options)` — visit with asset-refresh detection
- `webRemote(store, path, options)` — remote wrapper
- `SuperglueResponseError` — error class for failed requests
- `NavigationOutlet` — component for rendering the current page
- `unproxy()` — extract raw data from proxy objects

## Removed exports

- `Application`
- `setup`
- `prepareStore`
- `superglueReducer`
- `pageReducer`
- `rootReducer`
- `updateFragments`
- `GRAFTING_SUCCESS`
- `GRAFTING_ERROR`

## NavigationContext changes

The context now includes a `copyTo` method for optimistic updates:

```ts
const { navigateTo, copyTo, visit, remote } = useContext(NavigationContext)

// Copy page state before navigating (for optimistic UI)
copyTo('/posts/1/edit')
```

## Dependency changes

### New peer dependencies (optional)

- `@rails/actioncable` (^7 || ^8) — for streaming
- `@anycable/web` (^1) — alternative streaming transport

### Moved to direct dependencies

- `@reduxjs/toolkit` and `react-redux` are now direct dependencies (were peer
  dependencies in v1). You no longer need to install them separately.

### New direct dependencies

- `immer` — used internally for content mutations
- `uuid` — fragment ID generation
- `lodash.debounce` — internal debouncing

## Configuration

The configuration API changed from a mutable object to getter/setter functions:

**Before (v1):**

```ts
import { config } from '@thoughtbot/superglue'
config.baseUrl = '/api'
config.maxPages = 10
```

**After (v2):**

```ts
import { setConfig, getConfig } from '@thoughtbot/superglue'
setConfig({ baseUrl: '/api', maxPages: 10 })
const current = getConfig() // Readonly
```

Note: In practice, `baseUrl` is set via `createApp` and rarely needs manual
configuration.

## Migration checklist

1. Replace `<Application>` with `createApp()` and render `<Provider>` +
   `<Outlet>` separately
2. Remove your custom store setup — `createApp` handles it
3. Update `buildVisitAndRemote` to accept a context object instead of
   positional arguments
4. Rename `VisitResponse` to `SaveResponse` in your type annotations
5. Update fragment usage: `type` → `id`, use new fragment hooks
6. Replace custom flash slices with `useFlash()` / `useSetFlash()`
7. Remove `slices` from your server responses
8. Update any direct imports of removed exports (`superglueReducer`,
   `pageReducer`, `rootReducer`, `setup`, `prepareStore`)
9. Handle the new discriminated union return types from `visit`/`remote`
10. (Optional) Add streaming support with the `cable` option
