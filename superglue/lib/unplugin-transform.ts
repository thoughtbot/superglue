import ts from 'typescript'

export interface HookCallEdit {
  closeParen: number
  typeArgText: string
  isUseContent: boolean
  argCount: number
}

export function findHookCallsToTransform(
  code: string,
  id: string
): HookCallEdit[] {
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

  const edits: HookCallEdit[] = []

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.typeArguments &&
      node.typeArguments.length > 0
    ) {
      const name = node.expression.text
      const isUseContent = name === 'useContent'
      const isUseFragment = name === 'useFragment'

      if ((isUseContent || isUseFragment) && node.arguments.length < 2) {
        const firstTypeArg = node.typeArguments[0]
        const typeArgText = code.substring(
          firstTypeArg.getStart(sourceFile),
          firstTypeArg.getEnd()
        )

        edits.push({
          closeParen: node.getEnd() - 1,
          typeArgText,
          isUseContent,
          argCount: node.arguments.length,
        })
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return edits
}

export function applyHookEdits(
  code: string,
  edits: HookCallEdit[],
  validateFnName: string
): string {
  const sorted = [...edits].sort((a, b) => b.closeParen - a.closeParen)

  let result = code
  for (const edit of sorted) {
    const validateExpr = `{ validate: ${validateFnName}<${edit.typeArgText},>() }`

    let insertText: string
    if (edit.isUseContent && edit.argCount === 0) {
      insertText = `undefined, ${validateExpr}`
    } else {
      insertText = `, ${validateExpr}`
    }

    result =
      result.slice(0, edit.closeParen) +
      insertText +
      result.slice(edit.closeParen)
  }

  return result
}
