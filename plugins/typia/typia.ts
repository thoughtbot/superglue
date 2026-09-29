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
 *
 * The Go plugin prepends `import ... from "typia"` to every file, so typia
 * must be resolvable from the project or every file fails to type-check.
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
  assertTypiaInstalled(requireFrom)

  return {
    name: 'superglue-typia',
    source: path.resolve(root, 'plugins', 'typia', 'go', 'driver'),
  }
}

function assertTypiaInstalled(requireFrom: NodeRequire): void {
  try {
    requireFrom.resolve('typia/package.json')
  } catch {
    throw new Error(
      '@thoughtbot/superglue/typia requires typia. Install it with `npm install -D typia`.'
    )
  }
}

export { createTtscPlugin }
