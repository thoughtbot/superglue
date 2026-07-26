import ts from 'typescript'

/**
 * Creates a TypeScript transformer that rewrites `useContent<T>()` and
 * `useFragment<T>(ref)` calls to inject a `{ validate: validatorFn<T>() }`
 * options argument.
 *
 * Returns the transformer factory and a flag indicating whether any
 * transformations were applied, so callers know whether to prepend their
 * validate helper.
 */
export function createHookTransformer(
  validateFnName: string
): {
  factory: ts.TransformerFactory<ts.SourceFile>
  transformed: () => boolean
} {
  let transformed = false

  const factory: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      function visit(node: ts.Node): ts.Node {
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.typeArguments &&
          node.typeArguments.length > 0 &&
          node.arguments.length < 2
        ) {
          const name = node.expression.text
          const isUseContent = name === 'useContent'
          const isUseFragment = name === 'useFragment'

          if (isUseContent || isUseFragment) {
            transformed = true

            const firstTypeArg = node.typeArguments[0]

            const validateCall = ts.factory.createCallExpression(
              ts.factory.createIdentifier(validateFnName),
              [firstTypeArg],
              []
            )

            const optionsArg = ts.factory.createObjectLiteralExpression([
              ts.factory.createPropertyAssignment(
                'validate',
                validateCall
              ),
            ])

            const args = [...node.arguments.map((a) => ts.visitNode(a, visit) as ts.Expression)]

            if (isUseContent && node.arguments.length === 0) {
              args.push(
                ts.factory.createIdentifier('undefined'),
                optionsArg
              )
            } else {
              args.push(optionsArg)
            }

            return ts.factory.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              args
            )
          }
        }

        return ts.visitEachChild(node, visit, context)
      }

      return ts.visitNode(sourceFile, visit) as ts.SourceFile
    }
  }

  return { factory, transformed: () => transformed }
}

/**
 * Parses source code, applies the hook transformer, and prints the result.
 * Returns the original code unchanged if no hooks were found.
 */
export function transformHooks(
  code: string,
  id: string,
  validateFnName: string,
  validateHelper: string
): string {
  const scriptKind = /\.[jt]sx$/.test(id)
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(
    id,
    code,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  )

  const { factory, transformed } = createHookTransformer(validateFnName)
  const result = ts.transform(sourceFile, [factory])
  const transformedSourceFile = result.transformed[0]

  if (!transformed()) {
    result.dispose()
    return code
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const printed = printer.printFile(transformedSourceFile)
  result.dispose()

  return validateHelper + printed
}
