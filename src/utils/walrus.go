package utils

import (
	"fmt"
	"path/filepath"
	"runtime"
	"strings"
)

const (
	WALRUS_BINARY_NAME = "walrus"
	WALRUS_CONFIG_NAME = "client_config.yaml"
)

func getWalrusBinaryPath() string {
	dataDir, dErr := GetWalrusPath()
	if dErr != nil {
		panic("Failed to get site builder binary path: " + dErr.Error())
	}
	goos := runtime.GOOS
	binaryName := WALRUS_BINARY_NAME
	if goos == "windows" {
		binaryName += ".exe"
	}
	return filepath.Join(dataDir, binaryName)
}

func getWalrusConfigPath() (string, error) {
	dataDir, dErr := GetSiteBuilderPath()
	if dErr != nil {
		return "", dErr
	}
	return filepath.Join(dataDir, WALRUS_CONFIG_NAME), nil
}

func RunWalrusCommand(command string) (interface{}, error) {
	binaryPath := getWalrusBinaryPath()
	configPath, cErr := getWalrusConfigPath()
	if cErr != nil {
		return nil, cErr
	}
	rawCommand := fmt.Sprintf("--config client_config.yaml --wallet client.yaml %s --json", command)
	fmt.Println(binaryPath, rawCommand)
	args := strings.Fields(rawCommand)
	fmt.Println("args", args)
	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: filepath.Dir(configPath)}, args...)
	if err != nil {
		return nil, err
	}
	return jsonOutput, nil
}

func RunWalrusCommandRaw(command string) (string, error) {
	binaryPath := getWalrusBinaryPath()
	configPath, cErr := getWalrusConfigPath()
	if cErr != nil {
		return "", cErr
	}
	rawCommand := fmt.Sprintf("--config client_config.yaml --wallet client.yaml %s --json", command)
	fmt.Println(binaryPath, rawCommand)
	args := strings.Fields(rawCommand)
	fmt.Println("args", args)
	output, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: filepath.Dir(configPath)}, args...)
	if err != nil {
		return "", err
	}
	return string(output), nil
}

// /Users/beardkoda/Library/Application\ Support/walpress/tools/walrus/walrus --config /Users/beardkoda/Library/Application\ Support/walpress/config/client_config.yaml --wallet /Users/beardkoda/Library/Application\ Support/walpress/config/client.yaml get-wal --json
