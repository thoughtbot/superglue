import path from 'node:path'

/**
 * ttsc plugin descriptor factory.
 *
 * Used when the plugin is listed in `compilerOptions.plugins[]` or
 * auto-discovered via the `ttsc.plugin` package.json marker.
 *
 * Points ttsc at the native Go source directory shipped alongside this
 * package. ttsc builds it lazily with its bundled Go toolchain and caches
 * the resulting binary.
 */
export function createTtscPlugin(context: {
  dirname: string
  [key: string]: unknown
}) {
  return {
    name: 'superglue-typia',
    source: path.resolve(context.dirname, '..', 'native'),
  }
}

/**
 * Bundler plugin via `@ttsc/unplugin`.
 *
 * Wraps ttsc's transform pipeline as a bundler plugin for vite, esbuild,
 * webpack, rollup, etc. The plugin reads `compilerOptions.plugins` from the
 * project's tsconfig and runs the ttsc transform (which includes our Go
 * native plugin) on every TypeScript source file.
 *
 * Usage:
 * ```ts
 * import { superglueTypia } from '@superglue/web/typia'
 * export default { plugins: [superglueTypia.vite()] }
 * ```
 */
export const superglueTypia = /* @__PURE__ */ (() => {
  // Lazy import so the package works even without @ttsc/unplugin installed
  // (e.g. when only using the ttsc descriptor via tsconfig.json plugins[])
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@ttsc/unplugin').default
  } catch {
    return null
  }
})()

export default createTtscPlugin
