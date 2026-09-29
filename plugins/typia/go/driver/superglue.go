// Package driver registers the superglue-typia linked plugin.
//
// Rewrites useContent<T>() and useFragment<T>(ref) calls to inject a
// { validate: typia.createValidate<T>() } options argument, which typia's
// own plugin then expands into inline validation code.
//
// Typia only expands calls the checker resolves to typia's declarations, so
// two things keep the injected call resolvable:
//
//   - SourcePreamble prepends an import of typia to every file before
//     parsing, so the injected callee refers to a real, checked binding.
//   - ApplyProgram mutates each hook call in place rather than rebuilding
//     its ancestors, so the injected nodes hang off the original, bound
//     parse tree the checker resolves names through.
package driver

import (
	shimast "github.com/microsoft/typescript-go/shim/ast"
	shimscanner "github.com/microsoft/typescript-go/shim/scanner"
	"github.com/samchon/ttsc/packages/ttsc/driver"
)

// TypiaBinding is the default import of typia the preamble adds. A distinct
// name avoids clashing with a file's own `import typia from "typia"`; typia
// matches on the import's module specifier, not the binding's name.
const TypiaBinding = "__superglueTypia"

func init() {
	driver.RegisterPlugin(supergluePlugin{})
}

type supergluePlugin struct{}

var factory = shimast.NewNodeFactory(shimast.NodeFactoryHooks{})

// SourcePreamble adds the typia import to every file. Files without hooks
// never reference it, so import elision drops it from their output.
func (supergluePlugin) SourcePreamble(_ driver.PluginContext) (string, error) {
	return "import " + TypiaBinding + " from \"typia\";\n", nil
}

func (supergluePlugin) ApplyProgram(prog *driver.Program, _ driver.PluginContext) error {
	if prog == nil {
		return nil
	}

	for _, sf := range prog.SourceFiles() {
		if sf != nil && !sf.IsDeclarationFile {
			RewriteFile(sf)
		}
	}
	return nil
}

// RewriteFile walks one source file and rewrites hook calls in place.
// Exported for testing.
func RewriteFile(sf *shimast.SourceFile) {
	var visit func(node *shimast.Node) bool
	visit = func(node *shimast.Node) bool {
		if node.Kind == shimast.KindCallExpression {
			rewriteHookCall(factory, node.AsCallExpression())
		}
		node.ForEachChild(visit)
		return false
	}
	sf.AsNode().ForEachChild(visit)
}

// rewriteHookCall rewrites useContent<T>() or useFragment<T>(ref) in place
// to pass a { validate: __superglueTypia.createValidate<T>() } options
// argument.
func rewriteHookCall(
	f *shimast.NodeFactory,
	call *shimast.CallExpression,
) {
	if call == nil {
		return
	}
	expr := call.Expression
	if expr == nil || expr.Kind != shimast.KindIdentifier {
		return
	}
	if expr.Flags&shimast.NodeFlagsSynthesized != 0 {
		return
	}

	name := shimscanner.GetTextOfNode(expr)
	isUseContent := name == "useContent"
	isUseFragment := name == "useFragment"
	if !isUseContent && !isUseFragment {
		return
	}
	if call.TypeArguments == nil || len(call.TypeArguments.Nodes) == 0 {
		return
	}
	if call.Arguments != nil && len(call.Arguments.Nodes) >= 2 {
		return
	}

	typeArgNode := call.TypeArguments.Nodes[0]

	// Typia reads the callee's source text to label its errors, and a
	// synthesized node has no position, so borrow the hook identifier's.
	callee := f.NewPropertyAccessExpression(f.NewIdentifier(TypiaBinding), nil, f.NewIdentifier("createValidate"), shimast.NodeFlagsNone)
	callee.Loc = expr.Loc

	validateExpr := f.NewCallExpression(
		callee,
		nil, f.NewNodeList([]*shimast.Node{typeArgNode}), f.NewNodeList([]*shimast.Node{}), shimast.NodeFlagsNone)

	// Build: { validate: __superglueTypia.createValidate<T>() }
	optionsObj := f.NewObjectLiteralExpression(
		f.NewNodeList([]*shimast.Node{
			f.NewPropertyAssignment(nil, f.NewIdentifier("validate"), nil, nil, validateExpr),
		}), false)

	var args []*shimast.Node
	if call.Arguments != nil && len(call.Arguments.Nodes) > 0 {
		args = append(args, call.Arguments.Nodes[0])
	} else if isUseContent {
		args = append(args, f.NewIdentifier("undefined"))
	}
	args = append(args, optionsObj)

	// Attach the new arguments to the original call so the checker can
	// resolve the injected callee through the file's bound scopes.
	call.Arguments = f.NewNodeList(args)
	for _, arg := range args {
		arg.Parent = call.AsNode()
		shimast.SetParentInChildren(arg)
	}
	// SetParentInChildren moved the shared type argument under the injected
	// createValidate call; it still belongs to the hook call.
	typeArgNode.Parent = call.AsNode()
}
