// Package plugin registers the superglue-typia linked plugin.
//
// Implements driver.ProgramPlugin: ttsc hands us a loaded Program
// (with Checker), we walk the AST, rewrite useContent<T>() and
// useFragment<T>(ref) calls to inject inline typia validation.
// The host handles everything else.
package plugin

import (
	"fmt"
	"os"
	"runtime/debug"
	"strings"

	shimast "github.com/microsoft/typescript-go/shim/ast"
	shimprinter "github.com/microsoft/typescript-go/shim/printer"
	shimscanner "github.com/microsoft/typescript-go/shim/scanner"
	"github.com/samchon/ttsc/packages/ttsc/driver"
	nativecontext "github.com/samchon/typia/packages/typia/native/core/context"
	nativeprogrammers "github.com/samchon/typia/packages/typia/native/core/programmers"
	nativetransform "github.com/samchon/typia/packages/typia/native/transform"
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

	extras := nativecontext.ITypiaContext_Extras{}
	options := nativecontext.ITransformOptions{}

	// Step 1: Run typia's transform on every source file (handles typia.xxx() calls).
	typiaTransform := nativetransform.Transform(prog, &options, extras, nil)
	for _, sf := range prog.SourceFiles() {
		if sf != nil && !sf.IsDeclarationFile {
			typiaTransform(sf)
		}
	}

	// Step 2: Walk all source files and rewrite useContent/useFragment calls.
	ctx := &nativecontext.ITypiaContext{
		Program:         prog,
		CompilerOptions: prog.TSProgram.Options(),
		Checker:         prog.Checker,
		Options:         options,
	}
	ec := shimprinter.NewEmitContext()
	for _, sf := range prog.SourceFiles() {
		if sf != nil && !sf.IsDeclarationFile {
			RewriteFile(ec, sf, ctx)
		}
	}
	return nil
}

// RewriteFile walks one source file and rewrites hook calls in-place
// via the EmitContext visitor. Exported for testing.
func RewriteFile(
	ec *shimprinter.EmitContext,
	sf *shimast.SourceFile,
	ctx *nativecontext.ITypiaContext,
) {
	found := 0
	var visitor *shimast.NodeVisitor
	visitor = ec.NewNodeVisitor(func(node *shimast.Node) *shimast.Node {
		if node == nil {
			return nil
		}
		if node.Kind == shimast.KindCallExpression {
			if rewritten := rewriteHookCall(factory, node.AsCallExpression(), ctx); rewritten != nil {
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
// inject a { validate: ... } options argument.
func rewriteHookCall(
	f *shimast.NodeFactory,
	call *shimast.CallExpression,
	ctx *nativecontext.ITypiaContext,
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

	// Generate validator via typia's ValidateProgrammer.
	var validateExpr *shimast.Node
	if ctx != nil && ctx.Checker != nil {
		typ := ctx.Checker.GetTypeFromTypeNode(typeArgNode)
		if typ != nil {
			typeName := strings.TrimSpace(shimscanner.GetTextOfNode(typeArgNode))
			validateExpr = safeGenerate(func() *shimast.Node {
				return nativeprogrammers.ValidateProgrammer.Write(nativeprogrammers.ValidateProgrammer_IProps{
					Context: *ctx,
					Type:    typ,
					Name:    &typeName,
					Config:  nativeprogrammers.ValidateProgrammer_IConfig{Equals: false, StandardSchema: false},
				})
			})
		}
	}
	if validateExpr == nil {
		validateExpr = f.NewCallExpression(
			f.NewPropertyAccessExpression(f.NewIdentifier("typia"), nil, f.NewIdentifier("createValidate"), shimast.NodeFlagsNone),
			nil, f.NewNodeList([]*shimast.Node{typeArgNode}), f.NewNodeList([]*shimast.Node{}), shimast.NodeFlagsNone)
	}

	// Build: { validate: <expr> }
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

func safeGenerate(fn func() *shimast.Node) (result *shimast.Node) {
	defer func() {
		if exp := recover(); exp != nil {
			if os.Getenv("SUPERGLUE_NATIVE_DEBUG_STACK") != "" {
				fmt.Fprintf(os.Stderr, "superglue-typia: panicked: %v\n%s\n", exp, debug.Stack())
			}
			result = nil
		}
	}()
	return fn()
}
