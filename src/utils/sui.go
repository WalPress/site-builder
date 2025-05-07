package utils

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	SUI_BINARY_NAME = "sui"
)

func getSuiBinaryPath() string {
	dataDir, dErr := GetSuiPath()
	if dErr != nil {
		panic("Failed to get app data directory: " + dErr.Error())
	}

	suiDir := filepath.Join(dataDir, "sui")
	goos := runtime.GOOS
	binaryName := SUI_BINARY_NAME
	if goos == "windows" {
		binaryName += ".exe"
	}

	return filepath.Join(suiDir, "bin", binaryName)
}

func getConfigPath() string {
	dataDir, dErr := GetConfigPath()
	if dErr != nil {
		panic("Failed to get sui config directory: " + dErr.Error())
	}
	return filepath.Join(dataDir, "client.yaml")
}

func filterWarnings(out string) string {
	var result []string
	for _, line := range strings.Split(out, "\n") {
		if !strings.Contains(line, "Client/Server api version mismatch") {
			result = append(result, line)
		}
	}
	return strings.Join(result, "\n")
}

func RunSuiCommand(command string) (interface{}, error) {
	binaryPath := getSuiBinaryPath()
	configPath := getConfigPath()
	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, "client", "--client.config", configPath, "-y", command, "--json")
	if err != nil {
		return nil, err
	}

	clean := filterWarnings(string(jsonOutput))

	var data = map[string]interface{}{}
	err = json.Unmarshal([]byte(clean), &data)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func RunSuiCommandRaw(command string) (string, error) {
	binaryPath := getSuiBinaryPath()
	configPath := getConfigPath()
	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, "client", "--client.config", configPath, "-y", command)
	if err != nil {
		return "", err
	}
	clean := filterWarnings(string(jsonOutput))

	return clean, nil
}

type SuiClientConfig struct {
	Envs map[string]interface{} `yaml:"envs"`
}

func suiEnvExists(configPath string, envName string) (bool, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return false, fmt.Errorf("failed to read client.yaml: %w", err)
	}

	var cfg SuiClientConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return false, fmt.Errorf("failed to parse yaml: %w", err)
	}

	_, exists := cfg.Envs[envName]
	return exists, nil
}
