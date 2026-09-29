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
    source: path.resolve(root, 'plugins', 'typia', 'go', 'driver'),
  }
}

export { createTtscPlugin }
