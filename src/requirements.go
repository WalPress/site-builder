package src

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	sRuntime "runtime"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gopkg.in/yaml.v3"
)

// CheckRequirements verifies if necessary external dependencies are installed.
func (a *App) CheckRequirements() error {
	runtime.LogInfo(a.ctx, "Checking system requirements...")

	// --- Check for Node.js ---
	nodePath, err := exec.LookPath("node")
	if err != nil {
		runtime.LogInfo(a.ctx, "Node.js not found in PATH. Please install Node.js (LTS version recommended) from https://nodejs.org/")
		// Depending on if Node is critical, you might return the error here:
		// return fmt.Errorf("Node.js is required but not found in PATH")
	} else {
		runtime.LogInfof(a.ctx, "Node.js found at: %s", nodePath)
		// Optionally check version: cmd := exec.Command(nodePath, "--version"); ...
	}

	// --- Check for npm (usually comes with Node) ---
	npmPath, err := exec.LookPath("npm")
	if err != nil {
		runtime.LogInfo(a.ctx, "npm not found in PATH. Ensure Node.js and npm are installed correctly.")
		// return fmt.Errorf("npm is required but not found in PATH")
	} else {
		runtime.LogInfof(a.ctx, "npm found at: %s", npmPath)
	}

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

func (a *App) checkRustInstallation() {
	fmt.Println("Checking Rust installation...")

	// 3. Check if Rust is installed
	_, err := exec.LookPath("rustc")
	if err != nil {
		// Check if the error is because the executable was not found
		// Use errors.Is for more robust error checking in Go 1.13+
		if execErr, ok := err.(*exec.Error); ok && execErr.Err == exec.ErrNotFound {
			fmt.Println("Rust compiler (rustc) not found in PATH.")
			fmt.Println("Please install Rust from: https://www.rust-lang.org/tools/install")
			// Optionally, you could prompt the user or offer to download/install

			// For now, just logging the information.
		} else {
			// Some other error occurred during LookPath
			fmt.Printf("Error checking for rustc: %v", err)
		}
	} else {
		fmt.Println("✅ Rust compiler (rustc) found.")
	}
}

func (a *App) checkWalrusInstallation() {
	fmt.Println(" Checking Walrus installation...")

	// 3. Check if Walrus CLI is installed
	_, err := exec.LookPath("walrus")
	if err != nil {
		if execErr, ok := err.(*exec.Error); ok && execErr.Err == exec.ErrNotFound {
			fmt.Println("Walrus CLI not found. Attempting to install...")

			// Command to download and run the install script:
			// curl -sSf https://docs.wal.app/setup/walrus-install.sh | sh -s -- -n testnet
			curlCmd := exec.Command("curl", "-sSf", "https://docs.wal.app/setup/walrus-install.sh")
			shCmd := exec.Command("sh", "-s", "--", "-n", "testnet") // Pass '-n testnet' to the script via sh -s

			// Pipe curl output to sh stdin
			pipe, err := curlCmd.StdoutPipe()
			if err != nil {
				log.Fatalf("Failed to create pipe for installation: %v", err)
			}
			shCmd.Stdin = pipe

			// Optional: Capture stdout/stderr of sh command for logging
			shCmd.Stdout = os.Stdout
			shCmd.Stderr = os.Stderr

			// Start curl command
			if err := curlCmd.Start(); err != nil {
				log.Fatalf("Failed to start curl command: %v", err)
			}

			// Start sh command
			if err := shCmd.Start(); err != nil {
				log.Fatalf("Failed to start sh command: %v", err)
			}

			// Wait for curl to finish (implicitly closes the pipe)
			if err := curlCmd.Wait(); err != nil {
				log.Fatalf("Curl command failed: %v", err)
			}

			// Wait for sh to finish
			if err := shCmd.Wait(); err != nil {
				log.Fatalf("Walrus installation script failed: %v", err)
			}

			log.Println("✅ Walrus CLI installation attempted successfully.")
			// Verify installation again (optional)
			if _, err := exec.LookPath("walrus"); err != nil {
				log.Println("Walrus CLI still not found after installation attempt.")
			} else {
				log.Println("✅ Walrus CLI installed successfully.")
			}

		} else {
			// Some other error occurred during LookPath
			fmt.Printf("Error checking for Walrus CLI: %v\n", err)
		}
	} else {
		fmt.Println("✅ Walrus CLI found.")
	}
}

// Check if site-builder is installed
func (a *App) checkSiteBuilderInstallation(dataDir string) {
	fmt.Println(" Checking Site Builder installation...")

	if _, err := exec.LookPath("site-builder"); err == nil {
		fmt.Println("Found site-builder in system PATH.")
	} else {
		// Check if it's specifically a 'not found' error
		if execErr, ok := err.(*exec.Error); ok && execErr.Err == exec.ErrNotFound {
			fmt.Println("site-builder not found in PATH.")
			// TODO: Download logic will go here in the next step
			// a.DownloadSiteBuilder(dataDir)
		} else {
			// Log other errors
			fmt.Printf("Warning: Error checking site-builder in PATH: %v\n", err)
		}
	}

}

// Check for ./.walrus/client_config.yaml
func (a *App) checkWalrusClientConfig(dataDir string) {
	fmt.Println("Checking Walrus client config...")

	walrusDir := dataDir + "/.walrus"
	configPath := walrusDir + "/client_config.yaml"
	downloadConfig := false

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Printf("Walrus config file not found: %s. Attempting to download...", configPath)
		downloadConfig = true

		// Ensure .walrus directory exists
		if _, dirErr := os.Stat(walrusDir); os.IsNotExist(dirErr) {
			log.Printf("Creating directory: %s", walrusDir)
			if mkdirErr := os.MkdirAll(walrusDir, 0755); mkdirErr != nil {
				log.Fatalf("Failed to create directory %s: %v", walrusDir, mkdirErr)
			}
		} else if dirErr != nil {
			log.Fatalf("Failed to check directory %s: %v", walrusDir, dirErr)
		}

		// Download the file
		// curl https://docs.wal.app/setup/client_config.yaml -o ./.walrus/client_config.yaml
		curlCmd := exec.Command("curl", "https://docs.wal.app/setup/client_config.yaml", "-o", configPath)
		curlCmd.Stdout = os.Stdout
		curlCmd.Stderr = os.Stderr
		if err := curlCmd.Run(); err != nil {
			// Clean up potentially incomplete file on error
			os.Remove(configPath)
			log.Fatalf("Failed to download client_config.yaml: %v", err)
		}
		fmt.Printf("✅ Downloaded client_config.yaml to %s\n", configPath)
		// Update the wallet config
		updateWalletConfig(configPath, "testnet", dataDir+"/.walrus/client.yaml", "testnet")
		fmt.Println("✅ Successfully updated", configPath)
	} else if err != nil {
		log.Fatalf("❌ Error checking for config file %s: %v", configPath, err)
	} else {
		fmt.Printf("✅ Found Walrus config file: %s\n", configPath)
	}

	// Modify the config file contents
	log.Printf("Checking and updating %s...", configPath)
	yamlData, err := os.ReadFile(configPath)
	if err != nil {
		log.Fatalf("❌ Failed to read config file %s: %v", configPath, err)
	}

	var configNode yaml.Node
	err = yaml.Unmarshal(yamlData, &configNode)
	if err != nil {
		log.Fatalf("❌ Failed to parse YAML in %s: %v", configPath, err)
	}

	if downloadConfig {
		fmt.Println("✅ Downloaded client_config.yaml to ", configPath)
	}

}

// Check for ./.walrus/client.yaml
func (a *App) checkWalrusSiteConfig(dataDir string) {
	fmt.Println("Checking Walrus site config...")

	// 6. Check for ./.walrus/sites-config.yaml
	sitesConfigPath := dataDir + "/.walrus/sites-config.yaml"
	fmt.Println("Checking for %s...", sitesConfigPath)
	if _, err := os.Stat(sitesConfigPath); os.IsNotExist(err) {
		log.Println("❌ %s not found. Creating file...", sitesConfigPath)

		// Ensure .walrus directory exists (should exist from step 4 or 5, but check again)
		if _, dirErr := os.Stat(dataDir); os.IsNotExist(dirErr) {
			fmt.Println("Creating directory:", dataDir)
			if mkdirErr := os.MkdirAll(dataDir, 0755); mkdirErr != nil {
				log.Fatalf("❌ Failed to create directory %s: %v", dataDir, mkdirErr)
			}
		}

		// Default content for sites-config.yaml
		defaultSitesConfigContent := `contexts:
  testnet:
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
  mainnet:
    package: 0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27

default_context: mainnet
`
		if writeErr := os.WriteFile(sitesConfigPath, []byte(defaultSitesConfigContent), 0644); writeErr != nil {
			log.Fatalf("Failed to write default content to %s: %v", sitesConfigPath, writeErr)
		}
		fmt.Println("✅ Created default", sitesConfigPath)
	} else if err != nil {
		log.Fatalf("❌ Error checking for %s: %v", sitesConfigPath, err)
	} else {
		fmt.Printf("✅ %s found.\n", sitesConfigPath)
	}

}

func (a *App) downloadSiteBuilder(dataDir string) {
	fmt.Println("Downloading site-builder...") // Download and setup logic
	log.Println("Attempting to download site-builder...")

	localSiteBuilderPathBase := dataDir + "/site-builder"
	localSiteBuilderPath := localSiteBuilderPathBase
	if sRuntime.GOOS == "windows" {
		localSiteBuilderPath += ".exe"
	}

	// Determine platform and architecture
	goos := sRuntime.GOOS
	goarch := sRuntime.GOARCH
	downloadURL := ""

	switch goos {
	case "darwin":
		if goarch == "arm64" {
			downloadURL = "https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-macos-arm64"
		} else if goarch == "amd64" { // Intel Macs use amd64
			downloadURL = "https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-macos-x86_64"
		}
	case "windows":
		if goarch == "amd64" {
			downloadURL = "https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-windows-x86_64.exe"
		}
	case "linux":
		if goarch == "amd64" { // Assuming Ubuntu Intel maps to linux/amd64
			downloadURL = "https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-ubuntu-x86_64"
		}
	}

	if downloadURL == "" {
		log.Fatalf("Unsupported platform for site-builder download: %s/%s", goos, goarch)
	}

	// Ensure .walrus directory exists
	walrusDir := dataDir + "./.walrus"
	if _, dirErr := os.Stat(walrusDir); os.IsNotExist(dirErr) {
		log.Printf("Creating directory: %s", walrusDir)
		if mkdirErr := os.MkdirAll(walrusDir, 0755); mkdirErr != nil {
			log.Fatalf("Failed to create directory %s: %v", walrusDir, mkdirErr)
		}
	} else if dirErr != nil {
		log.Fatalf("Failed to check directory %s: %v", walrusDir, dirErr)
	}

	log.Printf("Downloading site-builder from %s to %s...", downloadURL, localSiteBuilderPath)
	// Use curl to download
	curlCmd := exec.Command("curl", "-L", "-o", localSiteBuilderPath, downloadURL)
	curlCmd.Stdout = os.Stdout
	curlCmd.Stderr = os.Stderr
	cmdErr := curlCmd.Run() // Renamed err variable here
	if cmdErr != nil {
		os.Remove(localSiteBuilderPath) // Clean up failed download
		log.Fatalf("Failed to download site-builder: %v", cmdErr)
	}

	// Add execute permission if not Windows
	if goos != "windows" {
		log.Printf("Adding execute permission to %s", localSiteBuilderPath)
		if chmodErr := os.Chmod(localSiteBuilderPath, 0755); chmodErr != nil { // Renamed err variable here
			log.Printf("Warning: Failed to set execute permission on %s: %v", localSiteBuilderPath, chmodErr)
		}
	}

	log.Printf("site-builder downloaded successfully to %s", localSiteBuilderPath)
	// NOTE: The downloaded binary is in ./.walrus/, not necessarily in PATH.
	// Subsequent calls might need to use the full path: localSiteBuilderPath

}
