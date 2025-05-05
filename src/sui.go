package src

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"os/exec"
	"strings"

	"os"
	"path/filepath"
	"runtime"
)

// installSuiCLI copies the Sui CLI binary from the local assets folder.
func installSuiCLI(targetDir string, embeddedAssets embed.FS) (string, error) {
	goos := runtime.GOOS
	goarch := runtime.GOARCH
	binaryName := "sui"
	if goos == "windows" {
		binaryName += ".exe"
	}
	targetPath := filepath.Join(targetDir, binaryName)

	_, err := fs.ReadDir(embeddedAssets, "assets")
	if err != nil {
		return "", fmt.Errorf("failed to read embedded assets: %w", err)
	}

	// 1. Determine source path based on OS/Arch
	assetsBaseDir := "./assets" // Path relative to cli-runner execution dir
	sourceDirName := fmt.Sprintf("%s-%s", goos, goarch)
	sourcePath := filepath.Join(assetsBaseDir, sourceDirName, binaryName)
	sourceFile, err := embeddedAssets.ReadFile(sourcePath)

	log.Printf("Target Sui binary path: %s", targetPath)
	log.Printf("Determined source asset path: %s", sourcePath)

	// Ensure target directory exists
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create target directory %s: %w", targetDir, err)
	}

	// 2. Copy the binary from assets to target
	log.Printf("Copying Sui binary from %s to %s...", sourcePath, targetPath)

	err = os.WriteFile(targetPath, sourceFile, 0644)
	if err != nil {
		return "", fmt.Errorf("failed to write binary content to %s: %w", targetPath, err)
	}

	// 3. Make executable (non-Windows)
	if goos != "windows" {
		log.Printf("Setting execute permission on %s", targetPath)
		if err := os.Chmod(targetPath, 0755); err != nil { // rwxr-xr-x
			log.Printf("Warning: Failed to set execute permission on %s: %v", targetPath, err)
		}
	}

	log.Println("Sui CLI copied successfully from assets.")
	return targetPath, nil
}

// configureSuiCLI checks for the config file and bootstraps it if necessary.
func configureSuiCLI(suiBinaryPath string, configPath string, env string, embeddedAssets embed.FS) error {
	log.Printf("Checking for Sui config file: %s", configPath)

	// Ensure the directory for the config file exists
	configDir := filepath.Dir(configPath)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory for config file %s: %w", configDir, err)
	}

	// Check if configPath exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Printf("Sui config file not found. Running '%s client new-env --env testnet'...", filepath.Clean(suiBinaryPath))
		rpcUrl := "https://fullnode.testnet.sui.io:443"
		if env == "mainnet" {
			rpcUrl = "https://fullnode.mainnet.sui.io:443"
		}

		// exists, err := suiEnvExists(os.ExpandEnv(configPath), env)
		// if err != nil {
		// 	fmt.Println("Error:", err)
		// 	return fmt.Errorf("failed to check if Sui env exists: %w", err)
		// }
		// if exists {
		// 	fmt.Println("✅ Sui env 'testnet' exists!")
		// } else {
		fmt.Println("❌ Sui Env not found", suiBinaryPath, configPath, env, rpcUrl)
		cmd := exec.Command(suiBinaryPath, "client", "--client.config", configPath, "-y", "new-env", "--alias", env, "--rpc", rpcUrl, "--json")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			fmt.Println("❌ Error running new-env command:", err)
			// Attempt to remove potentially partially created config file on error
			// os.Remove(configPath)
			return fmt.Errorf("failed to run '%s client new-env': %w", suiBinaryPath, err)
		}

		log.Printf("Successfully created new Sui environment config at %s", configPath)
		// Verify file was created
		if _, err := os.Stat(configPath); err != nil {
			fmt.Println(err)
			return fmt.Errorf("config file %s not found even after running new-env: %w", configPath, err)
		}
		// }

	} else if err != nil {
		return fmt.Errorf("error checking for config file %s: %w", configPath, err)
	} else {
		log.Printf("Sui config file found: %s", configPath)
	}

	return nil
}

// CheckSuiInstallation checks if Sui is installed, installs if not, configures it, and verifies.
func (a *App) checkSuiInstallation(dataDir string, embeddedAssets embed.FS, env string) (string, error) {
	log.Println("Checking Sui installation...")
	suiDir := filepath.Join(dataDir, "sui")
	binDir := filepath.Join(suiDir, "bin")
	configDir := filepath.Join(suiDir, "config") // Separate config dir
	configPath := filepath.Join(configDir, "client.yaml")
	fmt.Println("configPath==>", configPath, dataDir)
	binaryName := "sui"
	if runtime.GOOS == "windows" {
		binaryName += ".exe"
	}
	expectedBinaryPath := filepath.Join(binDir, binaryName)

	var suiBinaryPath string
	var installErr error

	// Check if binary already exists at the target location
	if _, err := os.Stat(expectedBinaryPath); err == nil {
		log.Printf("Sui binary found at expected location: %s", expectedBinaryPath)
		suiBinaryPath = expectedBinaryPath
	} else if os.IsNotExist(err) {
		log.Printf("Sui binary not found at %s. Attempting installation...", expectedBinaryPath)
		suiBinaryPath, installErr = installSuiCLI(binDir, embeddedAssets)
		if installErr != nil {
			return "", fmt.Errorf("Sui CLI installation failed: %w", installErr)
		}
	} else {
		// Other error checking the file (permissions?)
		return "", fmt.Errorf("failed to check for existing Sui binary at %s: %w", expectedBinaryPath, err)
	}
	// Verify installation works
	log.Println("Verifying Sui installation...")
	cmd := exec.Command(suiBinaryPath, "--version")
	cmd.Env = append(os.Environ(), fmt.Sprintf("SUI_CLIENT_CONFIG=%s", configPath)) // Use the correct config for verification
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to verify Sui installation by running '%s --version': %w\nOutput: %s", suiBinaryPath, err, string(output))
	}
	log.Printf("Sui version check successful: %s", strings.TrimSpace(string(output)))

	log.Println("✅ Sui installation and configuration complete.")
	fmt.Println("Configuring new-env...")
	configureSuiCLI(suiBinaryPath, configPath, env, embeddedAssets)
	return suiBinaryPath, nil // Return the path to the installed/verified binary
}
