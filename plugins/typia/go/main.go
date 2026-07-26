// Linked-plugin host binary. ttsc builds this from the plugin's Go source
// directory. The utility package handles all subcommands (transform, build,
// check, version), flag parsing, Program loading, and JSON envelope output.
//
// The actual transform logic lives in plugin/plugin.go, registered via init().
package main

import (
	"fmt"
	"os"

	_ "use-content-validator/plugin"

	"github.com/samchon/ttsc/packages/ttsc/utility"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "superglue-typia: command required")
		os.Exit(2)
	}
	switch os.Args[1] {
	case "version", "-v", "--version":
		fmt.Println("superglue-typia 0.4.0")
	case "build":
		os.Exit(utility.RunBuild(os.Args[2:]))
	case "check":
		os.Exit(utility.RunCheck(os.Args[2:]))
	case "transform":
		os.Exit(utility.RunTransform(os.Args[2:]))
	default:
		fmt.Fprintf(os.Stderr, "superglue-typia: unknown command %q\n", os.Args[1])
		os.Exit(2)
	}
}
