// Package driver registers the superglue-typia linked plugin.
//
// Implements driver.ProgramPlugin: ttsc hands us a loaded Program,
// we walk the AST, and rewrite useContent<T>() and useFragment<T>(ref)
// calls to inject a { validate: typia.createValidate<T>() } options
// argument. Typia's own plugin then transforms that createValidate call
// into inline validation code.
package driver

import (
	shimast "github.com/microsoft/typescript-go/shim/ast"
	shimprinter "github.com/microsoft/typescript-go/shim/printer"
	shimscanner "github.com/microsoft/typescript-go/shim/scanner"
	"github.com/samchon/ttsc/packages/ttsc/driver"
)

func init() {
	driver.RegisterPlugin(supergluePlugin{})
}

type supergluePlugin struct{}

var factory = shimast.NewNodeFactory(shimast.NodeFactoryHooks{})

func (supergluePlugin) ApplyProgram(prog *driver.Program, _ driver.PluginContext) error {
	if prog == nil {
		return nil
	}

	ec := shimprinter.NewEmitContext()
	for _, sf := range prog.SourceFiles() {
		if sf != nil && !sf.IsDeclarationFile {
			RewriteFile(ec, sf)
		}
	}
	return nil
}

// RewriteFile walks one source file and rewrites hook calls in-place
// via the EmitContext visitor. Exported for testing.
func RewriteFile(ec *shimprinter.EmitContext, sf *shimast.SourceFile) {
	found := 0
	var visitor *shimast.NodeVisitor
	visitor = ec.NewNodeVisitor(func(node *shimast.Node) *shimast.Node {
		if node == nil {
			return nil
		}
		if node.Kind == shimast.KindCallExpression {
			if rewritten := rewriteHookCall(factory, node.AsCallExpression()); rewritten != nil {
				found++
				return rewritten
			}
		}
		return visitor.VisitEachChild(node)
	})

	output := visitor.VisitNode(sf.AsNode())
	if output == nil || found == 0 {
		return
	}
	// The visitor produces a new SourceFile; copy its statements
	// back into the original so the host's printer sees the mutation.
	result := output.AsSourceFile()
	sf.Statements = result.Statements
}

// rewriteHookCall rewrites useContent<T>() or useFragment<T>(ref) to
// inject a { validate: typia.createValidate<T>() } options argument.
func rewriteHookCall(
	f *shimast.NodeFactory,
	call *shimast.CallExpression,
) *shimast.Node {
	if call == nil {
		return nil
	}
	expr := call.Expression
	if expr == nil || expr.Kind != shimast.KindIdentifier {
		return nil
	}
	if expr.Flags&shimast.NodeFlagsSynthesized != 0 {
		return nil
	}

	name := shimscanner.GetTextOfNode(expr)
	isUseContent := name == "useContent"
	isUseFragment := name == "useFragment"
	if !isUseContent && !isUseFragment {
		return nil
	}
	if call.TypeArguments == nil || len(call.TypeArguments.Nodes) == 0 {
		return nil
	}
	if call.Arguments != nil && len(call.Arguments.Nodes) >= 2 {
		return nil
	}

	typeArgNode := call.TypeArguments.Nodes[0]

	// Emit typia.createValidate<T>() — typia's own plugin will transform
	// this into inline validation code during the same build.
	validateExpr := f.NewCallExpression(
		f.NewPropertyAccessExpression(f.NewIdentifier("typia"), nil, f.NewIdentifier("createValidate"), shimast.NodeFlagsNone),
		nil, f.NewNodeList([]*shimast.Node{typeArgNode}), f.NewNodeList([]*shimast.Node{}), shimast.NodeFlagsNone)

	// Build: { validate: typia.createValidate<T>() }
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

	return f.NewCallExpression(expr, nil, call.TypeArguments, f.NewNodeList(args), shimast.NodeFlagsNone)
}
