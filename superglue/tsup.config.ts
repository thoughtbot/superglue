import type { Options } from 'tsup'
import { defineConfig } from 'tsup'
import { DeepkitLoader } from '@deepkit/type-compiler'
import { readFileSync } from 'fs'
import path from 'node:path'
import type { Plugin, Loader } from 'esbuild'

// Deepkit transformation plugin for tsup/esbuild
const deepkitLoader = new DeepkitLoader()

const deepkitPlugin: Plugin = {
  name: 'deepkit',
  setup(build) {
    const loaderMap: Record<string, Loader> = {
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.js': 'js',
      '.jsx': 'jsx',
    }
    build.onLoad({ filter: /\.(tsx?|jsx?)$/ }, async (args) => {
      if (args.path.includes('node_modules')) {
        return null
      }

      const source = readFileSync(args.path, 'utf8')

      const deepkitTransformed = deepkitLoader.transform(source, args.path)

      const ext = path.extname(args.path)
      const loader = loaderMap[ext] || 'js'

      return {
        contents: deepkitTransformed,
        loader,
      }
    })
  },
}

export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: {
      superglue: 'lib/index.tsx',
      action_creators: 'lib/action_creators/index.ts',
    },
    sourcemap: true,
    esbuildPlugins: [deepkitPlugin],
    ...options,
  }

  return [
    {
      ...commonOptions,
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }), // Add dts: '.d.ts' when egoist/tsup#1053 lands
      dts: true,
      clean: true,
    },
    {
      ...commonOptions,
      format: 'cjs',
      outDir: './dist/cjs/',
      outExtension: () => ({ js: '.cjs' }),
    },
  ]
})
