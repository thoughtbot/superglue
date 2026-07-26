import { createRequire } from 'node:module'
import path from 'node:path'
import type { ITtscPlugin, ITtscPluginFactoryContext } from 'ttsc'

/**
 * ttsc plugin descriptor factory.
 *
 * Used when the plugin is listed in `compilerOptions.plugins[]` or
 * auto-discovered via the `ttsc.plugin` package.json marker.
 *
 * Resolves the package root via `createRequire` from the project root
 * (matching nestia's pattern) so the path stays correct regardless of
 * hoisting or symlink layout.
 */
export default function createTtscPlugin(
  context: ITtscPluginFactoryContext
): ITtscPlugin {
  const requireFrom = createRequire(
    path.join(context.projectRoot, 'package.json')
  )
  const root: string = path.dirname(
    requireFrom.resolve('@thoughtbot/superglue/package.json')
  )
  return {
    name: 'superglue-typia',
    source: path.resolve(root, 'native'),
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

export { createTtscPlugin }
