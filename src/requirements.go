package src

import (
	"os/exec"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// CheckRequirements verifies if necessary external dependencies are installed.
func (a *App) CheckRequirements() error {
	runtime.LogInfo(a.ctx, "Checking system requirements...")

	// --- Check for Rust ---
	rustcPath, err := exec.LookPath("rustc")
	if err != nil {
		// Rust compiler not found, let's check for rustup
		runtime.LogWarning(a.ctx, "Rust compiler ('rustc') not found in PATH.")
		rustupPath, rupErr := exec.LookPath("rustup")
		if rupErr != nil {
			// Neither rustc nor rustup found
			runtime.LogInfo(a.ctx, "Rustup (Rust toolchain manager) also not found.")
			runtime.LogInfo(a.ctx, "Please install Rust by first installing rustup from https://rustup.rs/")
			// If Rust is critical, return an error:
			// return fmt.Errorf("Rust installation (via rustup) is required but not found")
		} else {
			// rustup found, but rustc isn't installed or in PATH
			runtime.LogInfof(a.ctx, "Rustup found at: %s", rustupPath)
			runtime.LogInfo(a.ctx, "Rust compiler ('rustc') seems missing or not in PATH.")
			runtime.LogInfo(a.ctx, "Please install the stable Rust toolchain by running: rustup toolchain install stable")
			runtime.LogInfo(a.ctx, "Then ensure the toolchain's bin directory is added to your PATH (rustup usually handles this).")
			// If Rust is critical, return an error:
			// return fmt.Errorf("Rust toolchain needs to be installed via rustup")
		}
	} else {
		// rustc found
		runtime.LogInfof(a.ctx, "Rust compiler ('rustc') found at: %s", rustcPath)
		// Optionally check version: cmd := exec.Command(rustcPath, "--version"); ...
	}

	runtime.LogInfo(a.ctx, "Requirement check complete.")
	// If all checks passed or were only warnings, return nil
	return nil
}
