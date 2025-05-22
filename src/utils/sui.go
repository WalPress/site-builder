package utils

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	SUI_BINARY_NAME = "sui"
)

func getSuiBinaryPath() string {
	suiDir, dErr := GetSuiPath()
	if dErr != nil {
		panic("Failed to get app data directory: " + dErr.Error())
	}

	goos := runtime.GOOS
	binaryName := SUI_BINARY_NAME
	if goos == "windows" {
		binaryName += ".exe"
	}

	return filepath.Join(suiDir, binaryName)
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
	rawCommand := fmt.Sprintf("client --client.config client.yaml -y %s --json", command)

	args := strings.Fields(rawCommand)

	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: filepath.Dir(configPath)}, args...)
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

func RunSuiCommandParsed(command string, interfaceType interface{}) (interface{}, error) {
	binaryPath := getSuiBinaryPath()
	configPath := getConfigPath()
	rawCommand := fmt.Sprintf("client --client.config client.yaml -y %s --json", command)
	fmt.Println(binaryPath, rawCommand)
	args := strings.Fields(rawCommand)

	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: filepath.Dir(configPath)}, args...)
	if err != nil {
		return nil, err
	}
	clean := filterWarnings(string(jsonOutput))

	err = json.Unmarshal([]byte(clean), &interfaceType)
	if err != nil {
		return nil, err
	}

	return interfaceType, nil
}

func RunSuiCommandRaw(command string) (string, error) {
	binaryPath := getSuiBinaryPath()
	configPath := getConfigPath()
	fmt.Println("binaryPath", binaryPath)
	fmt.Println("configPath", configPath)
	rawCommand := fmt.Sprintf("client --client.config client.yaml -y %s --json", command)
	fmt.Println(binaryPath, rawCommand)
	args := strings.Fields(rawCommand)
	fmt.Println("args", args)
	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: filepath.Dir(configPath)}, args...)
	if err != nil {
		return "", err
	}
	clean := filterWarnings(string(jsonOutput))

	return clean, nil
}

func RunSuiCommandRawOnly(command string) (string, error) {
	binaryPath := getSuiBinaryPath()
	configPath := getConfigPath()
	fmt.Println("binaryPath", binaryPath)
	fmt.Println("configPath", configPath)
	rawCommand := fmt.Sprintf("client --client.config client.yaml -y %s", command)
	fmt.Println(binaryPath, rawCommand)
	args := strings.Fields(rawCommand)
	fmt.Println("args", args)
	jsonOutput, err := RunCliCommandWithoutCtx(binaryPath, &RunCliCommandOptions{Cwd: filepath.Dir(configPath)}, args...)
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

// ExtractIDs extracts the Object ID and Blob ID from the given CLI response.
func ExtractIDs(response string) (string, string, error) {
	// Regular expression to match the object ID
	objectIDRegex := regexp.MustCompile(`New site object ID:\s*(0x[a-f0-9]{64})`)
	// Regular expression to match the blob ID
	blobIDRegex := regexp.MustCompile(`with blob ID\s*([A-Za-z0-9-_]{43})`)

	// Find the object ID
	objectIDMatches := objectIDRegex.FindStringSubmatch(response)
	if len(objectIDMatches) < 2 {
		return "", "", fmt.Errorf("object ID not found")
	}
	objectID := objectIDMatches[1]

	// Find the blob ID
	blobIDMatches := blobIDRegex.FindStringSubmatch(response)
	if len(blobIDMatches) < 2 {
		return "", "", fmt.Errorf("blob ID not found")
	}
	blobID := blobIDMatches[1]

	return objectID, blobID, nil
}

func RunSuiCommandKeytoolExport(address string) (interface{}, error) {
	binaryPath := getSuiBinaryPath()
	configPath := getConfigPath()
	cmd := exec.Command(
		binaryPath,
		"keytool",
		"--keystore-path",
		"./sui.keystore",
		"export",
		"--key-identity",
		address,
		"--json",
	)
	cmd.Dir = filepath.Dir(configPath)
	// cmd.Stdout = os.Stdout
	// cmd.Stderr = os.Stderr
	// err := cmd.Run()
	output, err := cmd.CombinedOutput()

	if err != nil {
		return nil, err
	}

	clean := filterWarnings(string(output))

	var data = map[string]interface{}{}
	err = json.Unmarshal([]byte(clean), &data)
	if err != nil {
		return nil, err
	}

	return data, nil
}

// ExtractIDs extracts all Object IDs and Blob IDs from the given CLI response.
func ExtractUpdateIDs(response string) ([]string, []string, error) {
	// Regular expression to match 64-character hex Object IDs
	// objectIDRegex := regexp.MustCompile(`0x[a-f0-9]{64}`)
	objectIDRegex := regexp.MustCompile(`Site object ID:\s*(0x[a-f0-9]{64})`)
	// Regular expression to match 43-character base64-like Blob IDs
	blobIDRegex := regexp.MustCompile(`with blob ID\s*([A-Za-z0-9-_]{43})`)

	// Extract all matches
	objectIDs := objectIDRegex.FindAllString(response, -1)
	blobIDs := blobIDRegex.FindAllString(response, -1)

	return objectIDs, blobIDs, nil
}

func AddALLEnvironments() {
	AddEnvironment("mainnet", "https://fullnode.mainnet.sui.io:443")
}

func AddEnvironment(env string, url string) {
	binaryPath := getSuiBinaryPath()
	configPath := getConfigPath()

	cmd := exec.Command(
		binaryPath,
		"client",
		"--client.config",
		configPath,
		"-y",
		"new-env",
		"--alias",
		env,
		"--rpc",
		url,
		"--json",
	)
	cmd.Dir = filepath.Dir(configPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println("error", err)
	}
	fmt.Println("output", string(output))
}
