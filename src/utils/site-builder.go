package utils

import (
	"path/filepath"
	"runtime"
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
	return filepath.Join(dataDir, "bin", binaryName)
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
	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, "--config", configPath, command, "--json")
	if err != nil {
		return nil, err
	}
	return jsonOutput, nil
}

func RunSiteBuilderCommandRaw(command string) (string, error) {
	binaryPath := getSiteBuilderBinaryPath()
	configPath, cErr := getSiteBuilderConfigPath()
	if cErr != nil {
		return "", cErr
	}
	output, err := RunCliCommandWithoutCtx(binaryPath, "--config", configPath, command)
	if err != nil {
		return "", err
	}
	return string(output), nil
}
