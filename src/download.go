package src

import (
	"cli-runner/src/utils"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"

	"gopkg.in/yaml.v3"
)

// NetworkType defines available Sui networks
type NetworkType string

const (
	Mainnet     NetworkType = "mainnet"
	Testnet     NetworkType = "testnet"
	APP_NAME                = "walpress"
	SUI_VERSION             = "1.47.0"
)

// Downloader holds progress values and provides downloading methods.
type Downloader struct {
	mu                  sync.Mutex
	OverallProgress     int // 0-100 overall progress
	suiProgress         int // 0-100 for Sui download (weighted 50%)
	siteBuilderProgress int // 0-100 for Site-Builder download (weighted 50%)
	walProgress         int // 0-100 for Wal download (weighted 50%)
}

func NewDownloader() *Downloader {
	return &Downloader{}
}

// setOverallProgress sets the overall progress value (thread-safe)
func (d *Downloader) setOverallProgress(p int) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.OverallProgress = p
}

// GetProgress returns the overall progress value.
func (d *Downloader) GetProgress() int {
	d.mu.Lock()
	defer d.mu.Unlock()
	return d.OverallProgress
}

// setSuiProgress sets the progress for the Sui binary and updates overall progress.
func (d *Downloader) setSuiProgress(p int) {
	d.mu.Lock()
	d.suiProgress = p
	overall := (d.suiProgress / 2) + (d.siteBuilderProgress / 2)
	d.OverallProgress = overall
	d.mu.Unlock()
}

// setSiteBuilderProgress sets the progress for the site-builder binary and updates overall progress.
func (d *Downloader) setSiteBuilderProgress(p int) {
	d.mu.Lock()
	d.siteBuilderProgress = p
	overall := (d.suiProgress / 2) + (d.siteBuilderProgress / 2)
	d.OverallProgress = overall
	d.mu.Unlock()
}

// setWalProgress sets the progress for the wal binary and updates overall progress.
func (d *Downloader) setWalProgress(p int) {
	d.mu.Lock()
	d.walProgress = p
	overall := (d.suiProgress + d.siteBuilderProgress + d.walProgress) / 3
	d.OverallProgress = overall
	d.mu.Unlock()
}

///////////////////////////////////////////////////////////////////////////////
// Download Functions for Each Binary
///////////////////////////////////////////////////////////////////////////////

// downloadSuiBinaryWithProgress downloads the Sui binary using a progress callback.
func (d *Downloader) downloadSuiBinaryWithProgress(network NetworkType) error {
	fmt.Println("Downloading Sui binary")
	// Determine platform
	goos := runtime.GOOS
	goarch := runtime.GOARCH

	var platform string
	switch goos {
	case "darwin":
		if goarch == "arm64" {
			platform = "macos-arm64"
		} else {
			platform = "macos-x86_64"
		}
	case "linux":
		platform = "linux-x86_64"
	case "windows":
		platform = "windows-x86_64"
	default:
		return fmt.Errorf("unsupported platform for Sui: %s-%s", goos, goarch)
	}

	// Choose Sui version based on network
	var version string
	switch network {
	case Testnet:
		version = fmt.Sprintf("%s-v%s", Testnet, SUI_VERSION)
	case Mainnet:
		version = fmt.Sprintf("%s-v%s", Mainnet, SUI_VERSION)
	default:
		return fmt.Errorf("unsupported network: %s", network)
	}

	fmt.Println("Downloading Sui binary:", version, platform)

	// Construct download URL and filename
	filename := fmt.Sprintf("sui-%s-%s.tgz", version, platform)
	url := fmt.Sprintf("https://github.com/MystenLabs/sui/releases/download/%s/%s", version, filename)

	// Create destination folder (using UserConfigDir)
	downloadPath, err := utils.GetSuiPath()
	if err != nil {
		return err
	}
	os.MkdirAll(downloadPath, 0755)
	fmt.Println("Download path:", downloadPath)
	destFile := filepath.Join(downloadPath, filename)
	suiFile := filepath.Join(downloadPath, "sui")
	fmt.Println("suiFile", suiFile)
	if utils.FileExists(suiFile) {
		fmt.Println("Sui binary already exists")
		d.setSuiProgress(100)
		return nil
	}
	fmt.Println("Creating destination file:", destFile)
	out, err := os.Create(destFile)
	if err != nil {
		return err
	}
	defer out.Close()
	fmt.Println("Opened destination file:", destFile)
	// Start download
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	fmt.Println("Closed response body")
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Failed to download Sui:", resp)
		return fmt.Errorf("failed to download Sui: %s", resp.Status)
	}

	contentLen := resp.ContentLength
	progressWriter := &ProgressWriter{
		Writer: out,
		Total:  contentLen,
		Callback: func(p int) {
			// Update Sui progress (0-100 maps to 0-50 overall)
			fmt.Println("Updating Sui progress:", p)
			d.setSuiProgress(p)
		},
	}

	_, err = io.Copy(progressWriter, resp.Body)
	if err != nil {
		return err
	}
	fmt.Println("Copied Sui binary to destination file")
	// unzip the file
	err = utils.ExtractTGZ(destFile, downloadPath)
	if err != nil {
		return err
	}
	fmt.Println("Extracted Sui binary")
	os.Chmod(destFile, 0755)
	// delete the tgz file
	os.Remove(destFile)
	return nil
}

// downloadSiteBuilderBinaryWithProgress downloads the site-builder binary using a progress callback.
func (d *Downloader) downloadSiteBuilderBinaryWithProgress(network NetworkType) error {
	fmt.Println("Downloading site-builder binary")
	// Determine platform
	goos := runtime.GOOS
	goarch := runtime.GOARCH
	var filename string
	if goos == "darwin" {
		if goarch == "arm64" {
			filename = fmt.Sprintf("site-builder-%s-latest-macos-arm64", network)
		} else {
			filename = fmt.Sprintf("site-builder-%s-latest-macos-x86_64", network)
		}
	} else if goos == "linux" {
		filename = fmt.Sprintf("site-builder-%s-latest-ubuntu-x86_64", network)
	} else if goos == "windows" {
		filename = fmt.Sprintf("site-builder-%s-latest-windows-x86_64.exe", network)
	} else {
		return fmt.Errorf("site-builder is not supported on %s", goos)
	}
	fmt.Println("Downloading site-builder binary:", filename)
	url := fmt.Sprintf("https://storage.googleapis.com/mysten-walrus-binaries/%s", filename)

	// Create destination folder
	toolDir, err := utils.GetSiteBuilderPath()
	if err != nil {
		return err
	}
	os.MkdirAll(toolDir, 0755)

	destFile := filepath.Join(toolDir, filename)
	fmt.Println("Destination file:", destFile)
	siteBuilderFile := filepath.Join(toolDir, utils.SITE_BUILDER_PATH)
	if utils.FileExists(siteBuilderFile) {
		d.setSiteBuilderProgress(100)
		return nil
	}
	fmt.Println("Creating destination file:", destFile)
	out, err := os.Create(destFile)
	if err != nil {
		return err
	}
	defer out.Close()
	fmt.Println("Opened destination file:", destFile)
	// Download
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	fmt.Println("Closed response body")
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to download site-builder: %s", resp.Status)
	}
	fmt.Println("Downloaded site-builder binary")
	contentLen := resp.ContentLength
	progressWriter := &ProgressWriter{
		Writer: out,
		Total:  contentLen,
		Callback: func(p int) {
			// Update site-builder progress (0-100 maps to 50-100 overall)
			// fmt.Println("Updating site-builder progress:", p)
			d.setSiteBuilderProgress(p)
		},
	}

	_, err = io.Copy(progressWriter, resp.Body)
	if err != nil {
		return err
	}
	fmt.Println("Copied site-builder binary to destination file")
	// rename the file to site-builder
	os.Rename(destFile, filepath.Join(toolDir, "site-builder"))
	utils.RunCliCommandWithoutCtx("chmod", &utils.RunCliCommandOptions{Cwd: toolDir}, "+x", filepath.Join(toolDir, "site-builder"))
	// Make the binary executable
	os.Chmod(destFile, 0755)
	fmt.Println("Made site-builder binary executable")
	return nil
}

// downloadWalBinaryWithProgress downloads the wal binary using a progress callback.
func (d *Downloader) downloadWalrusBinaryWithProgress(network NetworkType) error {
	fmt.Println("Downloading wal binary")
	goos := runtime.GOOS
	goarch := runtime.GOARCH

	var filename string
	if goos == "darwin" {
		if goarch == "arm64" {
			filename = fmt.Sprintf("walrus-%s-latest-macos-arm64", network)
		} else {
			filename = fmt.Sprintf("walrus-%s-latest-macos-x86_64", network)
		}
	} else if goos == "linux" {
		filename = fmt.Sprintf("walrus-%s-latest-ubuntu-x86_64", network)
	} else if goos == "windows" {
		filename = fmt.Sprintf("walrus-%s-latest-windows-x86_64.exe", network)
	} else {
		return fmt.Errorf("unsupported OS for wal: %s", goos)
	}

	url := fmt.Sprintf("https://bin.wal.app/%s", filename)
	fmt.Println("Downloading wal binary:", url)
	destPath, err := utils.GetWalrusPath()
	if err != nil {
		return err
	}
	os.MkdirAll(destPath, 0755)
	fmt.Println("Created destination path:", destPath)
	destFile := filepath.Join(destPath, filename)
	walrusFile := filepath.Join(destPath, "walrus")
	if utils.FileExists(walrusFile) {
		d.setWalProgress(100)
		return nil
	}
	fmt.Println("Destination file:", destFile)
	out, err := os.Create(destFile)
	if err != nil {
		return err
	}
	defer out.Close()
	fmt.Println("Opened destination file:", destFile)
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	fmt.Println("Closed response body")
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Failed to download wal:", resp)
		return fmt.Errorf("failed to download wal: %s", resp.Status)
	}
	fmt.Println("Downloaded wal binary")
	contentLen := resp.ContentLength
	progressWriter := &ProgressWriter{
		Writer: out,
		Total:  contentLen,
		Callback: func(p int) {
			// fmt.Println("Updating wal progress:", p)
			d.setWalProgress(p)
		},
	}

	_, err = io.Copy(progressWriter, resp.Body)
	if err != nil {
		return err
	}
	fmt.Println("Copied wal binary to destination file")
	// rename the file to walrus
	os.Rename(destFile, filepath.Join(destPath, "walrus"))
	os.Chmod(destFile, 0755)
	utils.RunCliCommandWithoutCtx("chmod", &utils.RunCliCommandOptions{Cwd: destPath}, "+x", filepath.Join(destPath, "walrus"))
	return nil
}

///////////////////////////////////////////////////////////////////////////////
// Top-Level Function called by the Frontend
///////////////////////////////////////////////////////////////////////////////

// DownloadAllBinaries downloads both Sui and site-builder binaries sequentially.
// It updates an overall progress field that the frontend may poll.
func (d *Downloader) DownloadAllBinaries(network NetworkType) error {
	fmt.Println("Starts DownloadAllBinaries")
	// Reset progress fields
	d.setSuiProgress(0)
	d.setSiteBuilderProgress(0)
	d.setWalProgress(0)
	d.setOverallProgress(0)

	// Download Sui binary
	fmt.Println("Downloading Sui binary")
	if err := d.downloadSuiBinaryWithProgress(network); err != nil {
		fmt.Println("Error downloading Sui binary:", err)
		return err
	}
	fmt.Println("Sui binary downloaded")

	// Download site-builder binary
	fmt.Println("Downloading site-builder binary")
	if err := d.downloadSiteBuilderBinaryWithProgress(network); err != nil {
		fmt.Println("Error downloading site-builder binary:", err)
		return err
	}
	fmt.Println("Site-builder binary downloaded")
	// Download wal binary
	fmt.Println("Downloading wal binary")
	if err := d.downloadWalrusBinaryWithProgress(network); err != nil {
		fmt.Println("Error downloading wal binary:", err)
		return err
	}
	fmt.Println("Wal binary downloaded")

	// Ensure overall progress is set to 100%
	fmt.Println("Setting overall progress to 100%")
	d.setOverallProgress(100)
	fmt.Println("Overall progress set to 100%")
	return nil
}

///////////////////////////////////////////////////////////////////////////////
// ProgressWriter Implementation (Used by Both Downloads)
///////////////////////////////////////////////////////////////////////////////

// ProgressWriter wraps an io.Writer to provide progress updates.
type ProgressWriter struct {
	Writer   io.Writer
	Total    int64
	Written  int64
	Callback func(percent int)
}

// Write implements the io.Writer interface.
func (pw *ProgressWriter) Write(p []byte) (int, error) {
	n, err := pw.Writer.Write(p)
	if err != nil {
		return n, err
	}
	pw.Written += int64(n)
	if pw.Total > 0 {
		percent := int((float64(pw.Written) / float64(pw.Total)) * 100)
		if pw.Callback != nil {
			pw.Callback(percent)
		}
	}
	return n, nil
}

// Check for Rust installation
func (d *Downloader) checkRustInstallation() {
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

// Check for config/client_config.yaml
func (d *Downloader) checkWalrusClientConfig(network NetworkType) {
	fmt.Println("Checking Walrus client config...")
	configDir, err := utils.GetConfigPath()
	if err != nil {
		log.Fatalf("❌ Failed to get config directory: %v", err)
	}
	configFile := "client_config.yaml"
	configFilePath := filepath.Join(configDir, configFile)
	downloadConfig := false

	if _, err := os.Stat(configFilePath); os.IsNotExist(err) {
		log.Printf("Walrus config file not found: %s. Attempting to download...", configFilePath)
		downloadConfig = true

		// Ensure config directory exists
		if _, dirErr := os.Stat(configDir); os.IsNotExist(dirErr) {
			log.Printf("Creating directory: %s", configDir)
			if mkdirErr := os.MkdirAll(configDir, 0755); mkdirErr != nil {
				log.Fatalf("Failed to create directory %s: %v", configDir, mkdirErr)
			}
		} else if dirErr != nil {
			log.Fatalf("Failed to check directory %s: %v", configDir, dirErr)
		}

		// Download the file
		out, err := os.Create(configFilePath)
		if err != nil {
			log.Fatalf("Failed to create config file %s: %v", configFilePath, err)
		}
		defer out.Close()

		createNewConfig(configFilePath, filepath.Join(configDir, "client.yaml"))

		// fmt.Println("Opened destination file:", configFilePath)
		// url := "https://docs.wal.app/setup/" + configFile
		// resp, err := http.Get(url)
		// if err != nil {
		// 	log.Fatalf("Failed to download config file %s: %v", configFilePath, err)
		// }
		// defer resp.Body.Close()
		// fmt.Println("Closed response body")
		// if resp.StatusCode != http.StatusOK {
		// 	fmt.Println("Failed to download client_config.yaml:", resp)
		// 	log.Fatalf("Failed to download config file %s: %v", configFilePath, err)
		// }
		// fmt.Println("Downloaded client_config.yaml")
		// contentLen := resp.ContentLength
		// progressWriter := &ProgressWriter{
		// 	Writer: out,
		// 	Total:  contentLen,
		// 	Callback: func(p int) {
		// 		fmt.Println("Updating client_config.yaml progress:", p)
		// 	},
		// }

		// _, err = io.Copy(progressWriter, resp.Body)
		// if err != nil {
		// 	log.Fatalf("Failed to copy config file %s: %v", configFilePath, err)
		// }
		// curl https://docs.wal.app/setup/client_config.yaml -o ./config/walrus_client.yaml
		// curlCmd := exec.Command("curl", "https://docs.wal.app/setup/"+configFile, "-o", configFilePath)
		// curlCmd.Stdout = out
		// curlCmd.Stderr = out
		// if err := curlCmd.Run(); err != nil {
		// 	// Clean up potentially incomplete file on error
		// 	os.Remove(configFilePath)
		// 	log.Fatalf("Failed to download client_config.yaml: %v", err)
		// }
		fmt.Printf("✅ Downloaded walrus_client.yaml to %s\n", configFilePath)
	} else if err != nil {
		log.Fatalf("❌ Error checking for config file %s: %v", configFilePath, err)
	} else {
		fmt.Printf("✅ Found Walrus config file: %s\n", configFilePath)
	}

	// Update the wallet config
	// updateWalletConfig(configFilePath, string(network), filepath.Join(configDir, "client.yaml"))

	fmt.Println("✅ Successfully updated", configFilePath)

	// Modify the config file contents
	log.Printf("Checking and updating %s...", configFilePath)
	yamlData, err := os.ReadFile(configFilePath)
	if err != nil {
		log.Fatalf("❌ Failed to read config file %s: %v", configFilePath, err)
	}

	var configNode yaml.Node
	err = yaml.Unmarshal(yamlData, &configNode)
	if err != nil {
		log.Fatalf("❌ Failed to parse YAML in %s: %v", configFilePath, err)
	}

	if downloadConfig {
		fmt.Println("✅ Downloaded client_config.yaml to ", configFilePath)
	}

}

// Check for config/sites-config.yaml
func (d *Downloader) checkWalrusSiteConfig() {
	fmt.Println("Checking Walrus site config...")
	configDir, err := utils.GetConfigPath()
	if err != nil {
		log.Fatalf("❌ Failed to get config directory: %v", err)
	}
	sitesConfigPath := filepath.Join(configDir, "sites-config.yaml")
	fmt.Println("Checking for", sitesConfigPath)
	if _, err := os.Stat(sitesConfigPath); os.IsNotExist(err) {
		log.Printf("❌ %s not found. Creating file...", sitesConfigPath)

		// Ensure .walrus directory exists (should exist from step 4 or 5, but check again)
		if _, dirErr := os.Stat(configDir); os.IsNotExist(dirErr) {
			fmt.Println("Creating directory:", configDir)
			if mkdirErr := os.MkdirAll(configDir, 0755); mkdirErr != nil {
				log.Fatalf("❌ Failed to create directory %s: %v", configDir, mkdirErr)
			}
		}
		toolsDir, err := utils.GetWalrusPath()
		if err != nil {
			log.Fatalf("❌ Failed to get tools directory: %v", err)
		}
		walrusFile := filepath.Join(toolsDir, "walrus")
		configDir, err := utils.GetConfigPath()
		if err != nil {
			log.Fatalf("❌ Failed to get config directory: %v", err)
		}
		suiConfigFile := filepath.Join(configDir, "client.yaml")

		// Default content for sites-config.yaml
		defaultSitesConfigContent := `
contexts:
  testnet:
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
    general:
      rpc_url: https://fullnode.testnet.sui.io:443
      wallet: ` + suiConfigFile + `
      walrus_binary: ` + walrusFile + `
      walrus_config: ` + configDir + "/client_config.yaml" + `
      gas_budget: 500000000
  mainnet:
    package: 0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27
    general:
      rpc_url: https://fullnode.mainnet.sui.io:443
      wallet: ` + suiConfigFile + `
      walrus_binary: ` + walrusFile + `
      walrus_config: ` + configDir + "/client_config.yaml" + `
      gas_budget: 500000000
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

// CheckDownloadStatus checks if the user has downloaded the binaries and the config files
func (d *Downloader) CheckDownloadStatus() (bool, error) {
	d.checkRustInstallation()
	d.checkWalrusClientConfig(Testnet)
	d.checkWalrusSiteConfig()

	// Check if the user has downloaded the binaries
	toolsDir, err := utils.GetToolsPath()
	if err != nil {
		return false, err
	}
	suiFile := filepath.Join(toolsDir, utils.SUI_PATH, "sui")
	siteBuilderFile := filepath.Join(toolsDir, utils.SITE_BUILDER_PATH, "site-builder")
	walFile := filepath.Join(toolsDir, utils.WALRUS_PATH, "walrus")
	fmt.Println("suiFile", suiFile)
	fmt.Println("siteBuilderFile", siteBuilderFile)
	fmt.Println("walFile", walFile)
	if !utils.FileExists(suiFile) {
		fmt.Println("❌ suiFile not found")
		return false, nil
	}
	if !utils.FileExists(siteBuilderFile) {
		fmt.Println("❌ siteBuilderFile not found")
		return false, nil
	}
	if !utils.FileExists(walFile) {
		fmt.Println("❌ walFile not found")
		return false, nil
	}
	if utils.FileExists(suiFile) && utils.FileExists(siteBuilderFile) && utils.FileExists(walFile) {
		fmt.Println("✅ suiFile-exists", utils.FileExists(suiFile))
		fmt.Println("✅ siteBuilderFile-exists", utils.FileExists(siteBuilderFile))
		fmt.Println("✅ walFile-exists", utils.FileExists(walFile))
		fmt.Println("✅ download complete")
		return true, nil
	}
	fmt.Println("❌ download not complete")
	return false, nil
}
