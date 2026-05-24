import { createUnplugin } from 'unplugin'
import { DeepkitLoader } from '@deepkit/type-compiler'
import { findHookCallsToTransform, applyHookEdits } from './unplugin-transform'

const VALIDATE_FN = '__supergluePropsValidator'

const VALIDATE_HELPER = `
import { resolveReceiveType as __sgResolveReceiveType, validate as __sgDkValidate } from '@deepkit/type';
type ReceiveType<T> = unknown;
function ${VALIDATE_FN}<T>(__type?: ReceiveType<T>): (data: unknown) => void {
  return function(data: unknown) {
    var resolved = __sgResolveReceiveType(__type);
    var errors = __sgDkValidate(data, resolved);
    if (errors.length > 0) {
      console.error('[Superglue] Content validation failed:', errors.map(function(e: any) {
        return { path: e.path, message: e.message, code: String(e.code) };
      }));
    }
  };
}
`

export const superglueDeepkit = createUnplugin(() => {
  const loader = new DeepkitLoader()

  return {
    name: 'superglue-deepkit',
    enforce: 'pre' as const,
    transformInclude(id: string) {
      return /\.[jt]sx?$/.test(id) && !id.includes('node_modules')
    },
    transform(code: string, id: string) {
      let transformed = code
      const hasHooks =
        code.includes('useContent') || code.includes('useFragment')

      if (hasHooks) {
        const edits = findHookCallsToTransform(code, id)
        if (edits.length > 0) {
          transformed = applyHookEdits(transformed, edits, VALIDATE_FN)
          transformed = VALIDATE_HELPER + transformed
        }
      }

      // Run DeepkitLoader after our transform so it injects __type
      // metadata into our generated validate calls
      transformed = loader.transform(transformed, id)

      if (transformed === code) return null
      return { code: transformed }
    },
  }
})

export const vite = superglueDeepkit.vite
export const rollup = superglueDeepkit.rollup
export const webpack = superglueDeepkit.webpack
export const esbuild = superglueDeepkit.esbuild
export const bun = superglueDeepkit.bun
