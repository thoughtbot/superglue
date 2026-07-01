package main

import (
	"strings"
	"testing"

	shimast "github.com/microsoft/typescript-go/shim/ast"
	shimcore "github.com/microsoft/typescript-go/shim/core"
	shimparser "github.com/microsoft/typescript-go/shim/parser"
	shimprinter "github.com/microsoft/typescript-go/shim/printer"
)

// parseAndTransform parses TypeScript source text, applies the useContent
// transform, and returns the printed result.
func parseAndTransform(t *testing.T, source string) string {
	t.Helper()
	sf := shimparser.ParseSourceFile(shimast.SourceFileParseOptions{
		FileName: "/test/input.ts",
	}, source, shimcore.ScriptKindTS)
	if sf == nil {
		t.Fatal("failed to parse source file")
	}
	shimast.SetParentInChildren(sf.AsNode())
	ec := shimprinter.NewEmitContext()
	result := transformSourceFile(ec, sf)
	shimast.SetParentInChildrenUnset(result.AsNode())
	writer := shimprinter.NewTextWriter("\n", 0)
	printer := shimprinter.NewPrinter(
		shimprinter.PrinterOptions{},
		shimprinter.PrintHandlers{},
		ec,
	)
	printer.Write(result.AsNode(), result, writer, nil)
	return writer.String()
}

func TestTransformAST_BasicCall(t *testing.T) {
	input := `interface MyProps {
  title: string
}
const content = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useContent<MyProps>(undefined, { validate: typia.createValidate<MyProps>() })") {
		t.Errorf("expected rewritten useContent call:\n%s", got)
	}
}

func TestTransformAST_WithExistingArg(t *testing.T) {
	input := `const content = useContent<MyProps>(initialValue)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useContent<MyProps>(initialValue, { validate: typia.createValidate<MyProps>() })") {
		t.Errorf("expected rewritten useContent call with preserved first arg:\n%s", got)
	}
}

func TestTransformAST_NoTypeArg(t *testing.T) {
	input := `const content = useContent()`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "typia.createValidate") {
		t.Errorf("should not rewrite call without type arg:\n%s", got)
	}
	if !strings.Contains(got, "useContent()") {
		t.Errorf("original call should be preserved:\n%s", got)
	}
}

func TestTransformAST_MultipleCallsInFile(t *testing.T) {
	input := `const a = useContent<Foo>()
const b = useContent<Bar>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useContent<Foo>(undefined, { validate: typia.createValidate<Foo>() })") {
		t.Errorf("expected first call rewritten:\n%s", got)
	}
	if !strings.Contains(got, "useContent<Bar>(undefined, { validate: typia.createValidate<Bar>() })") {
		t.Errorf("expected second call rewritten:\n%s", got)
	}
}

func TestTransformAST_PreservesOtherCode(t *testing.T) {
	input := `import { useContent } from "@lib/content"

interface MyProps {
  title: string
  count: number
}

export function MyComponent() {
  const content = useContent<MyProps>()
  return content.title
}`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "typia.createValidate<MyProps>()") {
		t.Errorf("expected rewritten useContent call:\n%s", got)
	}
	if !strings.Contains(got, `"@lib/content"`) {
		t.Errorf("expected import to be preserved:\n%s", got)
	}
	if !strings.Contains(got, "interface MyProps") {
		t.Errorf("expected interface to be preserved:\n%s", got)
	}
	if !strings.Contains(got, "content.title") {
		t.Errorf("expected return statement to be preserved:\n%s", got)
	}
}

func TestTransformAST_OtherCallsUntouched(t *testing.T) {
	input := `const a = useState<number>(0)
const b = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useState<number>(0)") {
		t.Errorf("useState should not be modified:\n%s", got)
	}
	if !strings.Contains(got, "typia.createValidate<MyProps>()") {
		t.Errorf("useContent should be rewritten:\n%s", got)
	}
}

func TestTransformAST_UseFragmentWithRef(t *testing.T) {
	input := `const settings = useFragment<WidgetConfig, true>(fragmentRef)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useFragment<WidgetConfig, true>(fragmentRef, { validate: typia.createValidate<WidgetConfig>() })") {
		t.Errorf("expected useFragment rewritten with validate appended after ref:\n%s", got)
	}
}

func TestTransformAST_UseFragmentNoTypeArg(t *testing.T) {
	input := `const settings = useFragment(fragmentRef)`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "typia.createValidate") {
		t.Errorf("should not rewrite useFragment without type args:\n%s", got)
	}
}

func TestTransformAST_UseFragmentAlreadyRewritten(t *testing.T) {
	input := `const settings = useFragment<WidgetConfig, true>(fragmentRef, { validate: fn() })`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "typia.createValidate") {
		t.Errorf("should not rewrite useFragment that already has validate:\n%s", got)
	}
}

func TestTransformAST_MixedContentAndFragment(t *testing.T) {
	input := `const content = useContent<MyProps>()
const settings = useFragment<WidgetConfig, true>(fragmentRef)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useContent<MyProps>(undefined, { validate: typia.createValidate<MyProps>() })") {
		t.Errorf("useContent should be rewritten:\n%s", got)
	}
	if !strings.Contains(got, "useFragment<WidgetConfig, true>(fragmentRef, { validate: typia.createValidate<WidgetConfig>() })") {
		t.Errorf("useFragment should be rewritten:\n%s", got)
	}
}

func TestTransformAST_UseFragmentTrailingComma(t *testing.T) {
	// Mirrors deepkit's tsxTrailingCommaFixture — trailing comma in args
	input := `const devSettings = useFragment<WidgetConfig, true>(
  toFragmentRef('devSettings'),
)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "typia.createValidate<WidgetConfig>()") {
		t.Errorf("trailing comma useFragment should be rewritten:\n%s", got)
	}
}

func TestTransformAST_UseFragmentInComponent(t *testing.T) {
	// Mirrors deepkit's tsxFixture — useFragment inside a component function
	input := `export function MyComponent() {
  const devSettings = useFragment<WidgetConfig, true>(toFragmentRef('devSettings'))
  return devSettings.color
}`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "typia.createValidate<WidgetConfig>()") {
		t.Errorf("useFragment inside component should be rewritten:\n%s", got)
	}
	if !strings.Contains(got, "devSettings.color") {
		t.Errorf("return statement should be preserved:\n%s", got)
	}
}

func TestTransformAST_MultiPropertyInterface(t *testing.T) {
	// Mirrors deepkit's fixture with multi-property interface
	input := `interface MyProps {
  title: string
  count: number
}
const result = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "typia.createValidate<MyProps>()") {
		t.Errorf("multi-property interface useContent should be rewritten:\n%s", got)
	}
	if !strings.Contains(got, "title: string") {
		t.Errorf("interface should be preserved:\n%s", got)
	}
	if !strings.Contains(got, "count: number") {
		t.Errorf("interface properties should be preserved:\n%s", got)
	}
}

func TestTransformAST_UseContentWithDeclaration(t *testing.T) {
	// useContent with a preceding function declaration (like deepkit's fixture)
	input := `export function useContent<T>(pageKey?: string, options?: { validate?: (data: unknown) => void }): T | undefined {
  if (options?.validate) { options.validate({}) }
  return undefined
}

interface MyProps {
  title: string
  count: number
}

export const result = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	// The last useContent<MyProps>() call should be rewritten
	if !strings.Contains(got, "typia.createValidate<MyProps>()") {
		t.Errorf("useContent call should be rewritten:\n%s", got)
	}
}

func TestTransformAST_NoTransformWhenNoHooks(t *testing.T) {
	input := `const x = 1 + 2
console.log(x)`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "typia") || strings.Contains(got, "validate") {
		t.Errorf("file without hooks should not be modified:\n%s", got)
	}
}
