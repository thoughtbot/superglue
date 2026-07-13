import { JSONMappable } from './json'

/**
 * A Fragment is a rendered Rails partial with an identity. The use
 * of this type is optional, but it makes usage with unproxy and
 * useUpdateFragment type friendly.
 *
 * In general, Fragments enable normalized state management where Rails partials
 * become referenceable entities on the client. The server renders partials as
 * fragments with unique IDs, then Superglue normalizes them into a separate
 * fragments store while replacing the original data with fragment references.
 *
 * @example Server Response (normalized)
 * ```json
 * {
 *   "data": { "cart": { items: [...], totalCost: 69.97 } },
 *   "fragments": [{ "type": "userCart", "path": ["cart"] }]
 * }
 * ```
 *
 * @example Client State (denormalized)
 * ```js
 * {
 *   pages: { "/page": { data: { cart: { __id: "userCart" } } } },
 *   fragments: { "userCart": { items: [...], totalCost: 69.97 } }
 * }
 * ```
 *
 * @example Usage
 * ```tsx
 * type PageData = {
 *   cart: Fragment<{ items: Item[]; totalCost: number }, true>;
 *   user?: Fragment<{ name: string; email: string }>; // Optional fragment
 * }
 *
 * const content = useContent<PageData>()
 * const cart = content.cart // Resolves fragment reference to actual data
 * ```
 *
 * @example Usage
 * ```tsx
 * // You can also nest fragments within other fragments
 * interface Post {
 *  title: string
 *  author: Fragment<Author, true>
 *  comments: Array<Fragment<Comment, true>>
 * }
 *
 * const page = useContent<{ post: Fragment<Post, true> }>()
 * ```
 *
 * @typeParam T The shape of the fragment's data.
 * @typeParam Present Indicates whether the fragment is guaranteed to be
 * present. It's possible that a fragment was deleted from the store due to
 * client side mutations. If you are sure that the fragment will ALWAYS be
 * present, set this to `true`, otherwise its `false` by default.
 */

export type Fragment<T, Present = false> = Present extends true
  ? T & { __id: string }
  : (T & { __id: string }) | undefined

/**
 * Utility type for unproxy that converts Fragment types to fragment references.
 * This recursively processes objects and arrays to convert Fragment<T> to { __id: string }.
 */
export type Unproxy<T> = T extends Fragment<infer U, infer P>
  ? P extends boolean
    ? FragmentRef<U, P>
    : FragmentRef<U, false>
  : T extends (infer U)[]
  ? Unproxy<U>[]
  : T extends object
  ? { [K in keyof T]: Unproxy<T[K]> }
  : T

/**
 * A FragmentRef is a reference to a Fragment.
 *
 * @prop __id A user supplied string identifying the fragment. This is usually created using
 * [props_template](https://github.com/thoughtbot/props_template?tab=readme-ov-file#jsonfragments)
 * @interface
 */

export type FragmentRef<T = unknown, Present extends boolean = false> = {
  __ref: true
  __id: string
  __type?: T
  __present?: Present
}

/**
 * The store where all page responses are stored indexed by PageKey. You are encouraged
 * to mutate the Pages in this store.
 */
export type AllFragments = Record<string, JSONMappable>
