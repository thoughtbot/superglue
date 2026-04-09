/**
 * Structural types describing the minimal ActionCable-compatible surface
 * that Superglue uses for streaming. Both `@rails/actioncable` and
 * `@anycable/web` satisfy these shapes, so applications can pick whichever
 * client library they prefer and inject the consumer through
 * {@link CreateAppArgs.cable}. Superglue itself never imports from either
 * package, which keeps both as optional peer dependencies.
 */

/**
 * A channel identifier. Either a bare channel name string or an object
 * with a `channel` key plus arbitrary identifier params.
 * @public
 */
export type ChannelNameWithParams = {
  channel: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Mixin passed to `subscriptions.create`. Mirrors the subset of the
 * ActionCable subscription mixin that Superglue invokes.
 * @public
 */
export interface ChannelMixin {
  received(message: string): void
  connected(): void
  disconnected(): void
}

/**
 * The handle returned from `subscriptions.create`.
 * @public
 */
export interface Subscription {
  // Concrete clients (e.g. `@rails/actioncable`) may return the subscription
  // for chaining; `void` here lets both shapes assign structurally and lets
  // callers (like a `useEffect` cleanup) ignore the return.
  unsubscribe(): void
}

/**
 * The `subscriptions` namespace on a Consumer.
 * @public
 */
export interface Subscriptions {
  create(
    channel: string | ChannelNameWithParams,
    mixin: ChannelMixin
  ): Subscription
}

/**
 * The minimal Consumer surface Superglue depends on. Pass an instance of
 * this (e.g. `createConsumer('/cable')` from `@rails/actioncable` or
 * `createCable()` from `@anycable/web`) as `cable` to {@link createApp}.
 * @public
 */
export interface Consumer {
  subscriptions: Subscriptions
}
