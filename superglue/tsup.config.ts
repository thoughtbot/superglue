import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: {
      superglue: 'lib/index.tsx',
      action_creators: 'lib/action_creators/index.ts',
    },
    sourcemap: true,
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
