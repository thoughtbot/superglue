import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: {
      superglue: 'lib/index.tsx',
    },
    sourcemap: true,
    ...options,
  }

  return [
    {
      ...commonOptions,
      format: ['esm'],
      dts: true,
      clean: true,
    },

    {
      ...commonOptions,
      format: 'cjs',
      outDir: './dist/cjs/',
      dts: false,
    },

    // Deepkit unplugin
    {
      entry: { deepkit: 'lib/deepkit.ts' },
      format: ['esm', 'cjs'],
      dts: true,
      sourcemap: true,
      external: ['unplugin', '@deepkit/type-compiler', '@deepkit/type', 'typescript'],
    },
  ]
})
