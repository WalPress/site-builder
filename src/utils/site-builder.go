package utils

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

const (
	SITE_BUILDER_BINARY_NAME = "site-builder"
	SITE_BUILDER_CONFIG_NAME = "sites-config.yaml"
)

func getSiteBuilderBinaryPath() string {
	dataDir, dErr := GetSiteBuilderPath()
	if dErr != nil {
		panic("Failed to get site builder binary path: " + dErr.Error())
	}
	goos := runtime.GOOS
	binaryName := SITE_BUILDER_BINARY_NAME
	if goos == "windows" {
		binaryName += ".exe"
	}
	return filepath.Join(dataDir, binaryName)
}

func getSiteBuilderConfigPath() (string, error) {
	dataDir, dErr := GetSiteBuilderPath()
	if dErr != nil {
		return "", dErr
	}
	return filepath.Join(dataDir, SITE_BUILDER_CONFIG_NAME), nil
}

func RunSiteBuilderCommand(command string) (interface{}, error) {
	binaryPath := getSiteBuilderBinaryPath()
	configPath, cErr := getSiteBuilderConfigPath()
	if cErr != nil {
		return nil, cErr
	}
	rawCommand := fmt.Sprintf("--client sites-config.yaml %s --json", command)
	fmt.Println(binaryPath, rawCommand)
	args := strings.Fields(rawCommand)
	fmt.Println("args", args)
	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: filepath.Dir(configPath)}, command, "--json")
	if err != nil {
		return nil, err
	}
	return jsonOutput, nil
}

func RunSiteBuilderCommandRaw(command string) (string, error) {
	binaryPath := getSiteBuilderBinaryPath()
	userDataPath, cErr := GetUserDataPath()
	if cErr != nil {
		return "", cErr
	}
	fmt.Println("binaryPath", binaryPath)
	rawCommand := fmt.Sprintf("--config config/sites-config.yaml %s", command)
	fmt.Println(binaryPath, rawCommand)
	args := strings.Fields(rawCommand)
	fmt.Println("args", args)
	// output, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: userDataPath}, args...)

	cmd := exec.Command(
		binaryPath,
		"--config", "config/sites-config.yaml",
		"--context", "mainnet",
		"publish",
		"--site-name", "Bawo Site",
		"--epochs", "1",
		"sites-data/ca91e082-6ef1-44d2-8368-44e7ed37d4de",
	)
	cmd.Dir = userDataPath
	fmt.Println("cmd.Dir", cmd.Dir)
	output, err := cmd.CombinedOutput()
	fmt.Println("output", string(output))
	if err != nil {
		return "", err
	}
	return string(output), nil
}

func ExecDeploySite(context, siteName, epochs, sitePath string) (string, error) {
	binaryPath := getSiteBuilderBinaryPath()
	userDataPath, cErr := GetUserDataPath()
	if cErr != nil {
		return "", cErr
	}

	cmd := exec.Command(
		binaryPath,
		"--config", "config/sites-config.yaml",
		"--context", context,
		"publish",
		"--site-name", siteName,
		"--epochs", epochs,
		sitePath,
	)
	cmd.Dir = userDataPath
	fmt.Println("cmd.Dir", cmd.Dir)
	output, err := cmd.CombinedOutput()
	fmt.Println("output", string(output))
	if err != nil {
		return "", err
	}
	return string(output), nil
}

func ExecUpdateSite(context, siteName, epochs, sitePath, objectID string) (string, error) {
	binaryPath := getSiteBuilderBinaryPath()
	userDataPath, cErr := GetUserDataPath()
	if cErr != nil {
		return "", cErr
	}

	cmd := exec.Command(
		binaryPath,
		"--config", "config/sites-config.yaml",
		"--context", context,
		"update",
		"--site-name", siteName,
		"--epochs", epochs,
		sitePath,
	)
	cmd.Dir = userDataPath
	fmt.Println("cmd.Dir", cmd.Dir)
	output, err := cmd.CombinedOutput()
	fmt.Println("output", string(output))
	if err != nil {
		return "", err
	}
	return string(output), nil
}
