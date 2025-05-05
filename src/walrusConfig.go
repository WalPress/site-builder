package src

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type WalletConfig struct {
	Path      string `yaml:"path"`
	ActiveEnv string `yaml:"active_env"`
}

type Context struct {
	SystemObject    string       `yaml:"system_object"`
	StakingObject   string       `yaml:"staking_object"`
	SubsidiesObject string       `yaml:"subsidies_object"`
	ExchangeObjects []string     `yaml:"exchange_objects"`
	WalletConfig    WalletConfig `yaml:"wallet_config"`
}

type Config struct {
	Contexts map[string]Context `yaml:"contexts"`
}

func updateWalletConfig(yamlPath, env, newPath, newActiveEnv string) error {
	data, err := os.ReadFile(yamlPath)
	if err != nil {
		return err
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return err
	}

	// Update wallet_config for the given environment (e.g., "mainnet", "testnet")
	if ctx, ok := config.Contexts[env]; ok {
		ctx.WalletConfig.Path = newPath
		ctx.WalletConfig.ActiveEnv = newActiveEnv
		config.Contexts[env] = ctx
	} else {
		return fmt.Errorf("context %s not found", env)
	}

	// Marshal and write back to file
	updatedYAML, err := yaml.Marshal(&config)
	if err != nil {
		return err
	}

	return os.WriteFile(yamlPath, updatedYAML, 0644)
}
