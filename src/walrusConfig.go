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
	Contexts       map[string]Context `yaml:"contexts"`
	DefaultContext string             `yaml:"default_context"`
	Path           string             `yaml:"path"`
	ActiveEnv      string             `yaml:"active_env"`
}

func updateWalletConfig(yamlPath, env, newPath string) error {
	data, err := os.ReadFile(yamlPath)
	if err != nil {
		return err
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return err
	}
	fmt.Println("updateWalletConfig", config, env)
	// Update wallet_config for the given environment (e.g., "mainnet", "testnet")
	if ctx, ok := config.Contexts["testnet"]; ok {
		ctx.WalletConfig.Path = newPath
		ctx.WalletConfig.ActiveEnv = "testnet"
		ctx.ExchangeObjects = []string{
			"0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073",
			"0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862",
			"0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5",
			"0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1",
		}
		config.Contexts["testnet"] = ctx
	} else {
		return fmt.Errorf("context %s not found", env)
	}
	if ctx, ok := config.Contexts["mainnet"]; ok {
		ctx.WalletConfig.Path = newPath
		ctx.WalletConfig.ActiveEnv = "mainnet"
		config.Contexts["mainnet"] = ctx
	} else {
		return fmt.Errorf("context %s not found", env)
	}

	config.DefaultContext = env
	config.Path = newPath
	config.ActiveEnv = env

	// Marshal and write back to file
	updatedYAML, err := yaml.Marshal(&config)
	if err != nil {
		return err
	}

	return os.WriteFile(yamlPath, updatedYAML, 0644)
}
