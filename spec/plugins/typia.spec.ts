// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createRequire } from 'module'
import { execSync, execFileSync } from 'child_process'
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from 'fs'
import path from 'path'

let tmpDir: string
let binaryPath: string
let generatedGoWork: string
const repoRoot = path.resolve(__dirname, '..', '..')
const nativeDir = path.join(repoRoot, 'plugins', 'typia', 'go')
const pluginDir = path.join(nativeDir, 'plugin')
const driverDir = path.join(nativeDir, 'driver')

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

  const lines = [
    'go 1.26',
    '',
    'use (',
    '\t.',
    `\t${ttscRoot}`,
    ...shimPackages.map((pkg) => `\t${path.join(ttscRoot, pkg)}`),
    ')',
    '',
    `replace github.com/samchon/ttsc/packages/ttsc v0.0.0 => ${ttscRoot}`,
    '',
  ]
  return lines.join('\n')
}

const useContentFixture = `
export function useContent<T>(pageKey?: string, validate?: (data: unknown) => void): T | undefined {
  if (validate) { validate({}) }
  return undefined
}

interface MyProps {
  title: string
  count: number
}

export const result = useContent<MyProps>()
`

const useFragmentFixture = `
export function useFragment<T, K extends boolean = false>(ref: string, validate?: (data: unknown) => void): T {
  if (validate) { validate({}) }
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
export function useFragment<T, K extends boolean = false>(ref: string, validate?: (data: unknown) => void): T {
  if (validate) { validate({}) }
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
export function useContent<T>(pageKey?: string, validate?: (data: unknown) => void): T | undefined {
  if (validate) { validate({}) }
  return undefined
}

export function useFragment<T, K extends boolean = false>(ref: string, validate?: (data: unknown) => void): T {
  if (validate) { validate({}) }
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

  // Build the Go binary from plugin/ (standalone sidecar)
  binaryPath = path.join(nativeDir, 'superglue-typia-plugin')
  execSync(`go build -o ${binaryPath} .`, {
    cwd: pluginDir,
    stdio: 'pipe',
    timeout: 300_000,
  })

  // Create temp fixture directory with tsconfig. It lives under the repo's
  // tmp/ so the preamble's `import ... from "typia"` resolves.
  const repoTmpDir = path.join(repoRoot, 'tmp')
  mkdirSync(repoTmpDir, { recursive: true })
  tmpDir = mkdtempSync(path.join(repoTmpDir, 'superglue-ttsc-test-'))
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
}, 300_000)

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
  it('transforms useContent with typia.createValidate', () => {
    const output = runTransform(useContentFixture, 'input.ts')
    const code = output['input.ts']

    expect(code).toBeDefined()
    expect(code).toContain('validate')
    expect(code).toContain('useContent')
    expect(code).toContain('__superglueTypia.createValidate<MyProps>()')
    // Should NOT contain the raw untransformed call
    expect(code).not.toContain('useContent<MyProps>()')
  })

  it('transforms useFragment with typia.createValidate', () => {
    const output = runTransform(useFragmentFixture, 'input_fragment.ts')
    const code = output['input_fragment.ts']

    expect(code).toBeDefined()
    expect(code).toContain('validate')
    expect(code).toContain('useFragment')
    expect(code).toContain('__superglueTypia.createValidate<WidgetConfig>()')
  })

  it('handles trailing commas in useFragment calls', () => {
    const output = runTransform(trailingCommaFixture, 'input_trailing.ts')
    const code = output['input_trailing.ts']

    expect(code).toBeDefined()
    expect(code).toContain('validate')
    expect(code).toContain('useFragment')
    expect(code).toContain('__superglueTypia.createValidate<WidgetConfig>()')
  })

  it('transforms both useContent and useFragment in the same file', () => {
    const output = runTransform(mixedFixture, 'input_mixed.ts')
    const code = output['input_mixed.ts']

    expect(code).toBeDefined()
    expect(code).toContain('useContent')
    expect(code).toContain('useFragment')
    expect(code).toContain('__superglueTypia.createValidate<MyProps>()')
    expect(code).toContain('__superglueTypia.createValidate<WidgetConfig>()')
    // Should NOT contain raw untransformed calls
    expect(code).not.toContain('useContent<MyProps>()')
  })

  it('does not transform files without hooks', () => {
    const noHooksFixture = `export const x = 1 + 2\n`
    const output = runTransform(noHooksFixture, 'no_hooks.ts')
    const code = output['no_hooks.ts']

    expect(code).toBeDefined()
    expect(code).not.toContain('validate')
    expect(code).not.toContain('createValidate')
  })

  it('does not transform hooks without type arguments', () => {
    const noTypeArgFixture = `
export function useContent<T>(pageKey?: string, validate?: (data: unknown) => void): T | undefined {
  return undefined
}
export const result = useContent()
`
    const output = runTransform(noTypeArgFixture, 'no_type_arg.ts')
    const code = output['no_type_arg.ts']

    expect(code).toBeDefined()
    expect(code).not.toContain('{ validate')
    expect(code).toContain('useContent()')
  })

  it('does not double-transform hooks that already have two arguments', () => {
    const alreadyTransformedFixture = `
export function useContent<T>(pageKey?: string, validate?: (data: unknown) => void): T | undefined {
  return undefined
}
interface MyProps { title: string }
const existingValidator = (data: unknown) => {}
export const result = useContent<MyProps>(undefined, existingValidator)
`
    const output = runTransform(
      alreadyTransformedFixture,
      'already_transformed.ts'
    )
    const code = output['already_transformed.ts']

    expect(code).toBeDefined()
    expect(code).toContain('existingValidator')
    expect(code).not.toContain('createValidate')
  })
})

// ttsc needs the native TypeScript 7 compiler, while the rest of the repo
// (tsup, eslint, lint:types) stays on TypeScript 5. @typescript/native-preview
// ships TS7 as `tsgo` so it doesn't clash with TS5's `tsc` bin; point ttsc at
// its platform binary directly.
function resolveNativeTsc(): string {
  const requireFromRepo = createRequire(path.join(repoRoot, 'package.json'))
  const nativePreviewPackageJson = requireFromRepo.resolve(
    '@typescript/native-preview/package.json'
  )
  const platformPackage = `@typescript/native-preview-${process.platform}-${process.arch}`
  const platformPackageJson = createRequire(nativePreviewPackageJson).resolve(
    `${platformPackage}/package.json`
  )
  const binaryName = process.platform === 'win32' ? 'tsgo.exe' : 'tsgo'

  return path.join(path.dirname(platformPackageJson), 'lib', binaryName)
}

// A fixture project with the superglue driver and typia's transform enabled.
// It lives under the repo's tmp/ so `typia` resolves from this repo's
// node_modules. Callers remove it when done.
function createFixtureProject(fixture: string, prefix: string): string {
  const repoTmpDir = path.join(repoRoot, 'tmp')
  mkdirSync(repoTmpDir, { recursive: true })
  const projectDir = mkdtempSync(path.join(repoTmpDir, prefix))

  mkdirSync(path.join(projectDir, 'src'))
  writeFileSync(path.join(projectDir, 'src', 'page.ts'), fixture)
  writeFileSync(
    path.join(projectDir, 'superglue-typia.cjs'),
    `module.exports = { name: 'superglue-typia', source: ${JSON.stringify(
      driverDir
    )} }\n`
  )
  writeFileSync(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2021',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
        rootDir: 'src',
        outDir: 'out',
        plugins: [
          { transform: './superglue-typia.cjs' },
          { transform: 'typia/lib/transform' },
        ],
      },
      include: ['src'],
    })
  )

  return projectDir
}

// Compiles a fixture through the real ttsc pipeline: typia's executable hosts
// the build and the superglue driver is linked into it, the same way a
// consuming app runs both plugins.
function compileWithTtsc(fixture: string): string {
  const projectDir = createFixtureProject(fixture, 'superglue-typia-e2e-')

  try {
    execFileSync(
      path.join(repoRoot, 'node_modules', '.bin', 'ttsc'),
      ['-p', 'tsconfig.json'],
      {
        cwd: projectDir,
        encoding: 'utf-8',
        env: { ...process.env, TTSC_TSGO_BINARY: resolveNativeTsc() },
        stdio: 'pipe',
        timeout: 600_000,
      }
    )

    return readFileSync(path.join(projectDir, 'out', 'page.js'), 'utf-8')
  } finally {
    rmSync(projectDir, { recursive: true, force: true })
  }
}

type TtscUnpluginApi = {
  transformTtsc: (
    id: string,
    source: string,
    options: unknown
  ) => Promise<{ code: string } | undefined>
  resolveOptions: (options: { project: string }) => unknown
}

// Transforms a fixture the way bundlers run ttsc: through @ttsc/unplugin's
// source-to-source transform, which its esbuild, vite, rollup, webpack and bun
// adapters call. Checker crashes on code the superglue driver injects only
// showed up on this path; `ttsc -p` builds of the same code passed.
async function transformWithUnplugin(fixture: string): Promise<string> {
  const projectDir = createFixtureProject(fixture, 'superglue-typia-unplugin-')
  const previousTsgoBinary = process.env.TTSC_TSGO_BINARY
  process.env.TTSC_TSGO_BINARY = resolveNativeTsc()

  try {
    const requireFromRepo = createRequire(path.join(repoRoot, 'package.json'))
    const { transformTtsc, resolveOptions } = requireFromRepo(
      '@ttsc/unplugin/api'
    ) as TtscUnpluginApi
    const file = path.join(projectDir, 'src', 'page.ts')
    const project = path.join(projectDir, 'tsconfig.json')
    const result = await transformTtsc(
      file,
      readFileSync(file, 'utf-8'),
      resolveOptions({ project })
    )

    return result?.code ?? ''
  } finally {
    if (previousTsgoBinary === undefined) {
      delete process.env.TTSC_TSGO_BINARY
    } else {
      process.env.TTSC_TSGO_BINARY = previousTsgoBinary
    }
    rmSync(projectDir, { recursive: true, force: true })
  }
}

describe('typia ttsc plugin end-to-end with typia transform', () => {
  it('expands hand-written typia calls', () => {
    const code = compileWithTtsc(`
import typia from 'typia'

interface MyProps {
  title: string
}

export const validate = typia.createValidate<MyProps>()
`)

    expect(code).not.toContain('createValidate')
    expect(code).toContain('"string" === typeof input.title')
  }, 600_000)

  it('expands the validator injected into useContent', () => {
    const code = compileWithTtsc(`
export function useContent<T>(pageKey?: string, validate?: (data: unknown) => unknown): T | undefined {
  return undefined
}

interface MyProps {
  title: string
}

export const content = useContent<MyProps>()
`)

    expect(code).not.toContain('createValidate')
    expect(code).toContain('"string" === typeof input.title')
  }, 600_000)

  it('expands the validator injected into useFragment', () => {
    const code = compileWithTtsc(`
export function useFragment<T, K extends boolean = false>(ref: string, validate?: (data: unknown) => unknown): T {
  return {} as T
}

interface WidgetConfig {
  color: string
}

export const settings = useFragment<WidgetConfig, true>('ref')
`)

    expect(code).not.toContain('createValidate')
    expect(code).toContain('"string" === typeof input.color')
  }, 600_000)
})

// The fixture hooks accept a validator as their second argument, like the
// real hooks, so the injected call matches their arity and the checker
// type-checks the injected argument.
describe('typia ttsc plugin through @ttsc/unplugin', () => {
  it('expands the validator injected into useFragment', async () => {
    const code = await transformWithUnplugin(`
export function useFragment<T>(ref: string, validate?: (data: unknown) => unknown): T {
  return {} as T
}

interface Widget {
  color: string
}

export const widget = useFragment<Widget>('widget')
`)

    expect(code).not.toContain('createValidate')
    expect(code).toContain('"string" === typeof input.color')
  }, 600_000)

  it('expands the validator injected into useContent', async () => {
    const code = await transformWithUnplugin(`
export function useContent<T>(pageKey?: string, validate?: (data: unknown) => unknown): T | undefined {
  return undefined
}

interface PageProps {
  greeting: string
}

export const content = useContent<PageProps>()
`)

    expect(code).not.toContain('createValidate')
    expect(code).toContain('"string" === typeof input.greeting')
  }, 600_000)
})
