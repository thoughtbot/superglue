// use-content-validator ttsc plugin.
//
// Rewrites useContent<T>() and useFragment<T,P>(ref) calls to inject inline
// typia validation, so the runtime receives a validator generated from the
// TypeScript type.
//
// Protocol: ttsc spawns this binary with subcommands (transform, build, check,
// version). The transform subcommand loads the TypeScript program, walks the
// AST to find hook calls, rewrites them, and writes a JSON envelope to stdout.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	shimast "github.com/microsoft/typescript-go/shim/ast"
	shimprinter "github.com/microsoft/typescript-go/shim/printer"
	shimscanner "github.com/microsoft/typescript-go/shim/scanner"
	"github.com/samchon/ttsc/packages/ttsc/driver"
	nativecontext "github.com/samchon/typia/packages/typia/native/core/context"
	nativetransform "github.com/samchon/typia/packages/typia/native/transform"
)

var (
	stdout io.Writer = os.Stdout
	stderr io.Writer = os.Stderr
)

func main() {
	os.Exit(run(os.Args[1:]))
}

func run(args []string) int {
	if len(args) == 0 {
		fmt.Fprintln(stderr, "use-content-validator: command required")
		return 2
	}
	switch args[0] {
	case "-v", "--version", "version":
		fmt.Fprintln(stdout, "use-content-validator 0.3.0")
		return 0
	case "transform":
		return runTransform(args[1:])
	case "build":
		return runBuild(args[1:])
	case "check":
		return runCheck(args[1:])
	default:
		fmt.Fprintf(stderr, "use-content-validator: unknown command %q\n", args[0])
		return 2
	}
}

func runCheck(args []string) int {
	fs := flag.NewFlagSet("check", flag.ContinueOnError)
	fs.SetOutput(stderr)
	_ = fs.String("cwd", "", "project directory")
	_ = fs.String("tsconfig", "", "tsconfig")
	_ = fs.String("plugins-json", "", "ordered plugin descriptors")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	return 0
}

// runBuild compiles the project by loading the program, applying the AST
// transform, and emitting JavaScript.
func runBuild(args []string) int {
	fs := flag.NewFlagSet("build", flag.ContinueOnError)
	fs.SetOutput(stderr)
	cwd := fs.String("cwd", "", "project directory")
	tsconfigPath := fs.String("tsconfig", "tsconfig.json", "tsconfig")
	_ = fs.String("plugins-json", "", "ordered plugin descriptors")
	_ = fs.Bool("emit", false, "emit")
	_ = fs.Bool("quiet", false, "quiet")
	_ = fs.Bool("noEmit", false, "noEmit")
	_ = fs.String("outDir", "", "output directory")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	root := *cwd
	if root == "" {
		var err error
		root, err = os.Getwd()
		if err != nil {
			fmt.Fprintln(stderr, err)
			return 2
		}
	}

	prog, diags, err := driver.LoadProgram(root, *tsconfigPath, driver.LoadProgramOptions{
		ForceEmit: true,
	})
	if err != nil {
		fmt.Fprintf(stderr, "use-content-validator build: %v\n", err)
		return 2
	}
	if len(diags) > 0 {
		driver.WritePrettyDiagnostics(stderr, diags, root)
		return 2
	}
	defer prog.Close()

	// Check semantic diagnostics (type errors discovered after load).
	if diags := prog.Diagnostics(); len(diags) > 0 {
		driver.WritePrettyDiagnostics(stderr, diags, root)
		return 2
	}

	// Collect transform diagnostics via callback.
	var transformDiags []transformDiagnostic
	transform := buildPluginTransform(prog, &transformDiags)
	if _, err := prog.EmitWithPluginTransformer(transform, nil); err != nil {
		fmt.Fprintf(stderr, "use-content-validator build: emit: %v\n", err)
		return 3
	}
	if len(transformDiags) > 0 {
		for _, d := range transformDiags {
			fmt.Fprintln(stderr, d.String(root))
		}
		return 3
	}
	return 0
}

// runTransform implements the source-to-source transform protocol. It loads the
// TypeScript program, walks the AST to find and rewrite hook calls, then
// writes the JSON envelope ttsc expects to stdout.
func runTransform(args []string) int {
	fs := flag.NewFlagSet("transform", flag.ContinueOnError)
	fs.SetOutput(stderr)
	cwd := fs.String("cwd", "", "project directory")
	tsconfigPath := fs.String("tsconfig", "tsconfig.json", "tsconfig")
	_ = fs.String("plugins-json", "", "ordered plugin descriptors")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	root := *cwd
	if root == "" {
		var err error
		root, err = os.Getwd()
		if err != nil {
			fmt.Fprintf(stderr, "use-content-validator: cwd: %v\n", err)
			return 2
		}
	}

	prog, diags, err := driver.LoadProgram(root, *tsconfigPath, driver.LoadProgramOptions{
		ForceEmit: true,
	})
	if err != nil {
		fmt.Fprintf(stderr, "use-content-validator transform: %v\n", err)
		return 2
	}
	if len(diags) > 0 {
		driver.WritePrettyDiagnostics(stderr, diags, root)
		return 2
	}
	defer prog.Close()

	// Check semantic diagnostics (type errors discovered after load).
	if diags := prog.Diagnostics(); len(diags) > 0 {
		driver.WritePrettyDiagnostics(stderr, diags, root)
		return 2
	}

	// Collect transform diagnostics via callback.
	var transformDiags []transformDiagnostic

	output := transformProjectOutput{
		Diagnostics: []transformDiagnostic{},
		TypeScript:  map[string]string{},
	}
	for _, sf := range prog.SourceFiles() {
		if sf.IsDeclarationFile {
			continue
		}
		key := sourceFileKey(root, filepath.ToSlash(sf.FileName()))
		if filepath.IsAbs(key) || key == ".." || strings.HasPrefix(key, "../") {
			continue
		}
		output.TypeScript[key] = transformFileToTypeScript(prog, sf, &transformDiags)
	}

	// Include any transform diagnostics in the JSON envelope.
	output.Diagnostics = transformDiags

	if err := json.NewEncoder(stdout).Encode(output); err != nil {
		fmt.Fprintf(stderr, "use-content-validator: encode output: %v\n", err)
		return 3
	}
	if len(transformDiags) > 0 {
		return 3
	}
	return 0
}

type transformProjectOutput struct {
	Diagnostics []transformDiagnostic `json:"diagnostics,omitempty"`
	TypeScript  map[string]string     `json:"typescript"`
}

type transformDiagnostic struct {
	File        *string `json:"file,omitempty"`
	Category    string  `json:"category"`
	Code        string  `json:"code"`
	Line        int     `json:"line,omitempty"`
	Character   int     `json:"character,omitempty"`
	MessageText string  `json:"messageText"`
}

// transformDiagnosticFrom converts a typia diagnostic into the structured
// format the ttsc host expects in the JSON envelope.
func transformDiagnosticFrom(diag *nativecontext.ITypiaDiagnostic) transformDiagnostic {
	out := transformDiagnostic{
		Category:    "error",
		MessageText: "transform error",
	}
	if diag == nil {
		return out
	}
	if diag.Code != "" {
		out.Code = diag.Code
	}
	if diag.Message != "" {
		out.MessageText = diag.Message
	}
	if diag.File != nil {
		fileName := diag.File.FileName()
		out.File = &fileName
		if diag.Start != nil && *diag.Start >= 0 {
			line, column := shimscanner.GetECMALineAndByteOffsetOfPosition(diag.File, *diag.Start)
			out.Line = line + 1
			out.Character = column + 1
		}
	}
	return out
}

// String formats a diagnostic for human-readable stderr output.
func (d transformDiagnostic) String(cwd string) string {
	code := d.Code
	if code == "" {
		code = "superglue"
	}
	if d.File == nil {
		return fmt.Sprintf("error TS(%s): %s", code, d.MessageText)
	}
	file := *d.File
	if rel, err := filepath.Rel(cwd, file); err == nil {
		file = rel
	}
	if d.Line > 0 {
		return fmt.Sprintf("%s:%d:%d - error TS(%s): %s", file, d.Line, d.Character, code, d.MessageText)
	}
	return fmt.Sprintf("%s - error TS(%s): %s", file, code, d.MessageText)
}

func sourceFileKey(cwd string, file string) string {
	rel, err := filepath.Rel(cwd, filepath.FromSlash(file))
	if err != nil {
		return filepath.ToSlash(file)
	}
	return filepath.ToSlash(rel)
}

// buildPluginTransform creates a PluginTransform that chains typia's
// transform (for all typia.xxx calls) with our useContent/useFragment rewrite.
// Typia runs first on the original AST, then our rewrite runs second.
// Transform diagnostics are collected via the provided slice.
func buildPluginTransform(prog *driver.Program, transformDiags *[]transformDiagnostic) driver.PluginTransform {
	return driver.PluginTransform(func(ec *shimprinter.EmitContext, sf *shimast.SourceFile) *shimast.SourceFile {
		extras := nativecontext.ITypiaContext_Extras{
			AddDiagnostic: func(diag *nativecontext.ITypiaDiagnostic) int {
				*transformDiags = append(*transformDiags, transformDiagnosticFrom(diag))
				return len(*transformDiags)
			},
		}
		ctx := &nativecontext.ITypiaContext{
			Program:         prog,
			CompilerOptions: prog.TSProgram.Options(),
			Checker:         prog.Checker,
			Options:         nativecontext.ITransformOptions{},
			Emit:            ec,
			Extras:          extras,
		}
		// Step 1: Typia's transform (handles user-written typia.xxx calls)
		typiaTransform := nativetransform.Transform(prog, &ctx.Options, extras, ec)
		result := sf
		if next := typiaTransform(result); next != nil {
			result = next
		}
		// Step 2: Our useContent/useFragment rewrite (with direct ValidateProgrammer)
		return transformSourceFileWithTypia(ec, result, ctx)
	})
}
