// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createRequire } from 'module'
import { execSync, execFileSync } from 'child_process'
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'fs'
import path from 'path'
import os from 'os'

let tmpDir: string
let binaryPath: string
let generatedGoWork: string
const nativeDir = path.resolve(__dirname, '..', '..', 'plugins', 'typia', 'go')

const shimPackages = [
  'shim/ast',
  'shim/bundled',
  'shim/checker',
  'shim/compiler',
  'shim/core',
  'shim/diagnosticwriter',
  'shim/printer',
  'shim/scanner',
  'shim/tsoptions',
  'shim/tspath',
  'shim/vfs',
  'shim/vfs/cachedvfs',
  'shim/vfs/osvfs',
]

function buildGoWork(): string {
  const require_ = createRequire(path.join(nativeDir, 'package.json'))
  const ttscRoot = path.dirname(require_.resolve('ttsc/package.json'))
  const typiaRoot = path.dirname(require_.resolve('typia/package.json'))
  const typiaNative = path.join(typiaRoot, 'native')

  const lines = [
    'go 1.26',
    '',
    'use (',
    '\t.',
    `\t${ttscRoot}`,
    ...shimPackages.map((pkg) => `\t${path.join(ttscRoot, pkg)}`),
    `\t${typiaNative}`,
    ')',
    '',
    `replace github.com/samchon/ttsc/packages/ttsc v0.0.0 => ${ttscRoot}`,
    `replace github.com/samchon/typia/packages/typia/native v0.0.0 => ${typiaNative}`,
    '',
  ]
  return lines.join('\n')
}

const useContentFixture = `
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

const useFragmentFixture = `
export function useFragment<T, K extends boolean = false>(ref: string, options?: { validate?: (data: unknown) => void }): T {
  if (options?.validate) { options.validate({}) }
  return {} as T
}

interface WidgetConfig {
  color: string
}

export function toFragmentRef(name: string): string {
  return name
}

export const MyComponent = () => {
  const devSettings = useFragment<WidgetConfig, true>(toFragmentRef('devSettings'))
  return devSettings.color
}
`

const trailingCommaFixture = `
export function useFragment<T, K extends boolean = false>(ref: string, options?: { validate?: (data: unknown) => void }): T {
  if (options?.validate) { options.validate({}) }
  return {} as T
}

interface WidgetConfig {
  color: string
}

export function toFragmentRef(name: string): string {
  return name
}

export const MyComponent = () => {
  const devSettings = useFragment<WidgetConfig, true>(
    toFragmentRef('devSettings'),
  )
  return devSettings.color
}
`

const mixedFixture = `
export function useContent<T>(pageKey?: string, options?: { validate?: (data: unknown) => void }): T | undefined {
  if (options?.validate) { options.validate({}) }
  return undefined
}

export function useFragment<T, K extends boolean = false>(ref: string, options?: { validate?: (data: unknown) => void }): T {
  if (options?.validate) { options.validate({}) }
  return {} as T
}

interface MyProps {
  title: string
}

interface WidgetConfig {
  color: string
}

export const content = useContent<MyProps>()
export const settings = useFragment<WidgetConfig, true>('ref')
`

function runTransform(
  fixture: string,
  fileName: string
): Record<string, string> {
  writeFileSync(path.join(tmpDir, fileName), fixture)

  const pluginsJson = JSON.stringify([
    {
      name: 'superglue-typia',
      stage: 'transform',
      config: { transform: '@thoughtbot/superglue/typia' },
    },
  ])

  const result = execFileSync(
    binaryPath,
    [
      'transform',
      `--cwd=${tmpDir}`,
      `--tsconfig=tsconfig.json`,
      `--plugins-json=${pluginsJson}`,
    ],
    {
      encoding: 'utf-8',
      timeout: 60_000,
    }
  )

  return JSON.parse(result).typescript
}

beforeAll(() => {
  // Generate go.work from resolved node_modules paths (CI-safe)
  generatedGoWork = path.join(nativeDir, 'go.work')
  writeFileSync(generatedGoWork, buildGoWork())

  // Build the Go binary
  binaryPath = path.join(nativeDir, 'superglue-typia-plugin')
  execSync(`go build -o ${binaryPath} .`, {
    cwd: nativeDir,
    stdio: 'pipe',
    timeout: 120_000,
  })

  // Create temp fixture directory with tsconfig
  tmpDir = mkdtempSync(path.join(os.tmpdir(), 'superglue-ttsc-test-'))
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
}, 120_000)

afterAll(() => {
  if (tmpDir && existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true })
  }
  if (binaryPath && existsSync(binaryPath)) {
    rmSync(binaryPath, { force: true })
  }
  if (generatedGoWork && existsSync(generatedGoWork)) {
    rmSync(generatedGoWork, { force: true })
  }
  const goWorkSum = generatedGoWork + '.sum'
  if (existsSync(goWorkSum)) {
    rmSync(goWorkSum, { force: true })
  }
})

describe('typia ttsc plugin integration', () => {
  it('transforms useContent with inline validation', () => {
    const output = runTransform(useContentFixture, 'input.ts')
    const code = output['input.ts']

    expect(code).toBeDefined()
    expect(code).toContain('validate')
    expect(code).toContain('useContent')
    expect(code).toContain('typeof')
    // Should NOT contain the raw untransformed call
    expect(code).not.toContain('useContent<MyProps>()')
    // Should NOT leak typia.createValidate as a bare call
    expect(code).not.toContain('typia.createValidate')
  })

  it('transforms useFragment with inline validation', () => {
    const output = runTransform(useFragmentFixture, 'input_fragment.ts')
    const code = output['input_fragment.ts']

    expect(code).toBeDefined()
    expect(code).toContain('validate')
    expect(code).toContain('useFragment')
    expect(code).toContain('typeof')
    // Should NOT contain the raw untransformed call
    expect(code).not.toMatch(
      /useFragment<WidgetConfig,\s*true>\(toFragmentRef\('devSettings'\)\)(?!\s*;?\s*\n)/
    )
    // Should NOT leak typia.createValidate
    expect(code).not.toContain('typia.createValidate')
  })

  it('handles trailing commas in useFragment calls', () => {
    const output = runTransform(trailingCommaFixture, 'input_trailing.ts')
    const code = output['input_trailing.ts']

    expect(code).toBeDefined()
    expect(code).toContain('validate')
    expect(code).toContain('useFragment')
    // Should NOT leak typia.createValidate
    expect(code).not.toContain('typia.createValidate')
  })

  it('transforms both useContent and useFragment in the same file', () => {
    const output = runTransform(mixedFixture, 'input_mixed.ts')
    const code = output['input_mixed.ts']

    expect(code).toBeDefined()
    // Both hooks should have validation injected
    expect(code).toContain('useContent')
    expect(code).toContain('useFragment')
    expect(code).toContain('validate')
    // Should have type checks for both MyProps and WidgetConfig
    expect(code).toContain('title')
    expect(code).toContain('color')
    // Should NOT contain raw untransformed calls
    expect(code).not.toContain('useContent<MyProps>()')
    // Should NOT leak internal codegen names into user-facing output
    expect(code).not.toContain('typia.createValidate')
  })

  it('does not transform files without hooks', () => {
    const noHooksFixture = `export const x = 1 + 2\n`
    const output = runTransform(noHooksFixture, 'no_hooks.ts')
    const code = output['no_hooks.ts']

    expect(code).toBeDefined()
    expect(code).not.toContain('validate')
    expect(code).not.toContain('typia')
    expect(code).not.toContain('createValidate')
    expect(code).not.toContain('typeof input')
  })

  it('does not transform hooks without type arguments', () => {
    const noTypeArgFixture = `
export function useContent<T>(pageKey?: string, options?: { validate?: (data: unknown) => void }): T | undefined {
  return undefined
}
export const result = useContent()
`
    const output = runTransform(noTypeArgFixture, 'no_type_arg.ts')
    const code = output['no_type_arg.ts']

    expect(code).toBeDefined()
    // Should NOT inject validate when there's no type argument
    expect(code).not.toContain('{ validate')
    expect(code).toContain('useContent()')
  })

  it('does not double-transform hooks that already have two arguments', () => {
    const alreadyTransformedFixture = `
export function useContent<T>(pageKey?: string, options?: { validate?: (data: unknown) => void }): T | undefined {
  return undefined
}
interface MyProps { title: string }
const existingValidator = (data: unknown) => {}
export const result = useContent<MyProps>(undefined, { validate: existingValidator })
`
    const output = runTransform(
      alreadyTransformedFixture,
      'already_transformed.ts'
    )
    const code = output['already_transformed.ts']

    expect(code).toBeDefined()
    // Should preserve the existing validator, not replace it
    expect(code).toContain('existingValidator')
    // Should NOT add a second validate injection
    expect(code).not.toContain('typeof input')
  })
})
