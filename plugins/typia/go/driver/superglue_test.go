package driver

import (
	"strings"
	"testing"

	shimast "github.com/microsoft/typescript-go/shim/ast"
	shimcore "github.com/microsoft/typescript-go/shim/core"
	shimparser "github.com/microsoft/typescript-go/shim/parser"
	shimprinter "github.com/microsoft/typescript-go/shim/printer"
	"github.com/samchon/ttsc/packages/ttsc/driver"
)

func parseAndTransform(t *testing.T, source string) string {
	t.Helper()
	sf := shimparser.ParseSourceFile(shimast.SourceFileParseOptions{
		FileName: "/test/input.ts",
	}, source, shimcore.ScriptKindTS)
	if sf == nil {
		t.Fatal("failed to parse source file")
	}
	shimast.SetParentInChildren(sf.AsNode())
	RewriteFile(sf)
	writer := shimprinter.NewTextWriter("\n", 0)
	printer := shimprinter.NewPrinter(
		shimprinter.PrinterOptions{},
		shimprinter.PrintHandlers{},
		shimprinter.NewEmitContext(),
	)
	printer.Write(sf.AsNode(), sf, writer, nil)
	return writer.String()
}

// --- Negative cases: what we don't touch ---

func TestTransformAST_NoTransformWhenNoHooks(t *testing.T) {
	input := `const x = 1 + 2
console.log(x)`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "createValidate") || strings.Contains(got, "validate") {
		t.Errorf("file without hooks should not be modified:\n%s", got)
	}
}

func TestTransformAST_NoTypeArg(t *testing.T) {
	input := `const content = useContent()`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "createValidate") {
		t.Errorf("should not rewrite call without type arg:\n%s", got)
	}
	if !strings.Contains(got, "useContent()") {
		t.Errorf("original call should be preserved:\n%s", got)
	}
}

func TestTransformAST_UseFragmentNoTypeArg(t *testing.T) {
	input := `const settings = useFragment(fragmentRef)`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "createValidate") {
		t.Errorf("should not rewrite useFragment without type args:\n%s", got)
	}
}

func TestTransformAST_OtherCallsUntouched(t *testing.T) {
	input := `const a = useState<number>(0)
const b = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useState<number>(0)") {
		t.Errorf("useState should not be modified:\n%s", got)
	}
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
		t.Errorf("useContent should be rewritten:\n%s", got)
	}
}

func TestTransformAST_UseContentAlreadyRewritten(t *testing.T) {
	input := `const content = useContent<MyProps>("/posts", existingValidator)`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "createValidate") {
		t.Errorf("should not rewrite useContent that already has a validator:\n%s", got)
	}
	if !strings.Contains(got, "existingValidator") {
		t.Errorf("should preserve existing validator:\n%s", got)
	}
}

func TestTransformAST_UseFragmentAlreadyRewritten(t *testing.T) {
	input := `const settings = useFragment<WidgetConfig, true>(fragmentRef, fn())`

	got := parseAndTransform(t, input)
	if strings.Contains(got, "createValidate") {
		t.Errorf("should not rewrite useFragment that already has a validator:\n%s", got)
	}
}

// --- Positive cases: what we transform ---

func TestTransformAST_BasicCall(t *testing.T) {
	input := `interface MyProps {
  title: string
}
const content = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useContent<MyProps>(undefined, __superglueTypia.createValidate<MyProps>())") {
		t.Errorf("expected rewritten useContent call with a validator argument:\n%s", got)
	}
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
		t.Errorf("expected __superglueTypia.createValidate call:\n%s", got)
	}
}

func TestTransformAST_WithExistingArg(t *testing.T) {
	input := `const content = useContent<MyProps>(initialValue)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useContent<MyProps>(initialValue, __superglueTypia.createValidate<MyProps>())") {
		t.Errorf("expected rewritten useContent call with preserved first arg:\n%s", got)
	}
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
		t.Errorf("expected __superglueTypia.createValidate argument:\n%s", got)
	}
}

func TestTransformAST_WithPageKey(t *testing.T) {
	input := `const content = useContent<MyProps>("/posts")`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, `useContent<MyProps>("/posts", __superglueTypia.createValidate<MyProps>())`) {
		t.Errorf("expected pageKey preserved as first arg:\n%s", got)
	}
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
		t.Errorf("expected __superglueTypia.createValidate argument:\n%s", got)
	}
}

func TestTransformAST_MultipleCallsInFile(t *testing.T) {
	input := `const a = useContent<Foo>()
const b = useContent<Bar>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "__superglueTypia.createValidate<Foo>()") {
		t.Errorf("expected first call rewritten with Foo validator:\n%s", got)
	}
	if !strings.Contains(got, "__superglueTypia.createValidate<Bar>()") {
		t.Errorf("expected second call rewritten with Bar validator:\n%s", got)
	}
}

func TestTransformAST_UseFragmentWithRef(t *testing.T) {
	input := `const settings = useFragment<WidgetConfig, true>(fragmentRef)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "useFragment<WidgetConfig, true>(fragmentRef, __superglueTypia.createValidate<WidgetConfig>())") {
		t.Errorf("expected useFragment rewritten with a validator appended after ref:\n%s", got)
	}
	if !strings.Contains(got, "__superglueTypia.createValidate<WidgetConfig>()") {
		t.Errorf("expected __superglueTypia.createValidate argument:\n%s", got)
	}
}

func TestTransformAST_UseFragmentTrailingComma(t *testing.T) {
	input := `const devSettings = useFragment<WidgetConfig, true>(
  toFragmentRef('devSettings'),
)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "__superglueTypia.createValidate<WidgetConfig>()") {
		t.Errorf("trailing comma useFragment should be rewritten:\n%s", got)
	}
}

func TestTransformAST_MixedContentAndFragment(t *testing.T) {
	input := `const content = useContent<MyProps>()
const settings = useFragment<WidgetConfig, true>(fragmentRef)`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
		t.Errorf("useContent should be rewritten with MyProps validator:\n%s", got)
	}
	if !strings.Contains(got, "__superglueTypia.createValidate<WidgetConfig>()") {
		t.Errorf("useFragment should be rewritten with WidgetConfig validator:\n%s", got)
	}
}

// --- Context preservation: surrounding code survives ---

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
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
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

func TestTransformAST_UseFragmentInComponent(t *testing.T) {
	input := `export function MyComponent() {
  const devSettings = useFragment<WidgetConfig, true>(toFragmentRef('devSettings'))
  return devSettings.color
}`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "__superglueTypia.createValidate<WidgetConfig>()") {
		t.Errorf("useFragment inside component should be rewritten:\n%s", got)
	}
	if !strings.Contains(got, "devSettings.color") {
		t.Errorf("return statement should be preserved:\n%s", got)
	}
}

func TestTransformAST_UseContentWithDeclaration(t *testing.T) {
	input := `export function useContent<T>(pageKey?: string, validate?: (data: unknown) => void): T | undefined {
  if (validate) { validate({}) }
  return undefined
}

interface MyProps {
  title: string
  count: number
}

export const result = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
		t.Errorf("useContent call should be rewritten:\n%s", got)
	}
}

func TestTransformAST_MultiPropertyInterface(t *testing.T) {
	input := `interface MyProps {
  title: string
  count: number
}
const result = useContent<MyProps>()`

	got := parseAndTransform(t, input)
	if !strings.Contains(got, "__superglueTypia.createValidate<MyProps>()") {
		t.Errorf("multi-property interface useContent should be rewritten:\n%s", got)
	}
	if !strings.Contains(got, "title: string") {
		t.Errorf("interface should be preserved:\n%s", got)
	}
	if !strings.Contains(got, "count: number") {
		t.Errorf("interface properties should be preserved:\n%s", got)
	}
}

// --- Preamble: the binding the injected callee resolves through ---

func TestSourcePreamble_ImportsTypiaBinding(t *testing.T) {
	got, err := supergluePlugin{}.SourcePreamble(driver.PluginContext{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != "import __superglueTypia from \"typia\";\n" {
		t.Errorf("unexpected preamble: %q", got)
	}
}
