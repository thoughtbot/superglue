import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import path from 'path'
import os from 'os'

let tmpDir: string

const fixture = `
export function useContent<T>(pageKey?: string, options?: { validate?: (data: unknown) => void }): T | undefined {
  if (options?.validate) { options.validate({}) }
  return undefined
}

interface MyProps {
  title: string
  count: number
}

export const result = useContent<MyProps>()
`

beforeAll(() => {
  tmpDir = mkdtempSync(path.join(os.tmpdir(), 'superglue-unplugin-test-'))
  writeFileSync(path.join(tmpDir, 'input.ts'), fixture)
  writeFileSync(
    path.join(tmpDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2021',
        module: 'ESNext',
        strict: true,
        skipLibCheck: true,
      },
    })
  )
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

function hasDeepkitMetadata(code: string): boolean {
  return (
    code.includes('.__type') &&
    (code.includes('\u03A9') || code.includes('\\u03A9'))
  )
}

function hasValidateInjection(code: string): boolean {
  return (
    code.includes('resolveReceiveType') &&
    code.includes('@deepkit/type') &&
    code.includes('Content validation failed')
  )
}

describe('deepkit unplugin integration', () => {
  it('esbuild plugin transforms code with metadata and validate injection', async () => {
    const esbuild = await import('esbuild')
    const { esbuild: deepkitPlugin } = await import('../../lib/deepkit')

    const result = await esbuild.build({
      entryPoints: [path.join(tmpDir, 'input.ts')],
      bundle: false,
      write: false,
      format: 'esm',
      plugins: [deepkitPlugin()],
    })

    expect(result.errors).toHaveLength(0)
    expect(result.outputFiles).toHaveLength(1)

    const output = result.outputFiles[0].text
    expect(hasDeepkitMetadata(output)).toBe(true)
    expect(hasValidateInjection(output)).toBe(true)
  })

  it('vite plugin transforms code with metadata and validate injection', async () => {
    const { build: viteBuild } = await import('vite')
    const { vite: deepkitPlugin } = await import('../../lib/deepkit')

    const result = await viteBuild({
      root: tmpDir,
      build: {
        write: false,
        lib: {
          entry: path.join(tmpDir, 'input.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          external: [/@thoughtbot/, /@deepkit/],
        },
      },
      plugins: [deepkitPlugin()],
      logLevel: 'silent',
    })

    const output = Array.isArray(result) ? result[0] : result
    const chunk = output.output[0]
    expect(hasDeepkitMetadata(chunk.code)).toBe(true)
    expect(hasValidateInjection(chunk.code)).toBe(true)
  })
})
