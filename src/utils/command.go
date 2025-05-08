package utils

import (
	// "context"
	"fmt"
	"os/exec"
)

// RunCommand executes a given CLI command string and returns its combined output.
type RunCliCommandOptions struct {
	Cwd string
}

func RunCliCommandWithoutCtx(name string, opts *RunCliCommandOptions, arg ...string) ([]byte, error) {
	cmd := exec.Command(name, arg...) // Create command
	// Set the working directory
	cmd.Dir = opts.Cwd
	// cmd.Stderr = os.Stderr
	// cmd.Stdout = os.Stdout
	// err := cmd.Run() // Execute and get combined stdout/stderr
	out, err := cmd.CombinedOutput() // Execute and get combined stdout/stderr
	if err != nil {
		fmt.Println("Error executing command: " + err.Error())
		// Combine error message and output for context
		return nil, err
	}
	// return clean, nil // Return bytestring as string
	return []byte(out), nil
}
