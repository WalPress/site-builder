package utils

import (
	// "context"
	"fmt"
	"os/exec"
	"strings"
)

// RunCommand executes a given CLI command string and returns its combined output.
// func runCliCommand(ctx context.Context, input string) string {
// 	parts := strings.Fields(input) // Split command string into parts
// 	if len(parts) == 0 {
// 		return "Error: Empty command"
// 	}
// 	cmd := exec.CommandContext(ctx, parts[0], parts[1:]...) // Create command
// 	out, err := cmd.CombinedOutput()                        // Execute and get combined stdout/stderr
// 	if err != nil {
// 		// Combine error message and output for context
// 		return "Error executing command: " + err.Error() + "\nOutput:\n" + string(out)
// 	}
// 	return string(out) // Return output as string
// }

func RunCliCommandWithoutCtx(name string, arg ...string) ([]byte, error) {
	cmd := exec.Command(name, arg...) // Create command
	out, err := cmd.CombinedOutput()  // Execute and get combined stdout/stderr
	if err != nil {
		fmt.Println("Error executing command: " + err.Error())
		// Combine error message and output for context
		return nil, err
	}

	// return clean, nil // Return output as string
	return []byte(out), nil
}

func escapePathForShell(path string) string {
	return strings.ReplaceAll(path, " ", `\ `)
}
