import { createUnplugin } from 'unplugin'
import { DeepkitLoader } from '@deepkit/type-compiler'

export const superglueDeepkit = createUnplugin(() => {
  const loader = new DeepkitLoader()

  return {
    name: 'superglue-deepkit',
    enforce: 'pre' as const,
    transformInclude(id: string) {
      return /\.[jt]sx?$/.test(id) && !id.includes('node_modules')
    },
    transform(code: string, id: string) {
      const transformed = loader.transform(code, id)

      if (transformed === code) {
        return null
      }

      return { code: transformed }
    },
  }
})

export const vite = superglueDeepkit.vite
export const rollup = superglueDeepkit.rollup
export const webpack = superglueDeepkit.webpack
export const esbuild = superglueDeepkit.esbuild
export const bun = superglueDeepkit.bun
