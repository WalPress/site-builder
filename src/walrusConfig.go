package src

import (
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

func createNewConfig(yamlPath, newPath string) error {
	data, err := os.ReadFile(yamlPath)
	if err != nil {
		return err
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return err
	}

	config.Contexts = make(map[string]Context)
	config.Contexts["testnet"] = Context{
		SystemObject:    "0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af",
		StakingObject:   "0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3",
		SubsidiesObject: "0xda799d85db0429765c8291c594d334349ef5bc09220e79ad397b30106161a0af",
		ExchangeObjects: []string{"0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073", "0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862", "0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5", "0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1"},
		WalletConfig: WalletConfig{
			Path:      newPath,
			ActiveEnv: "testnet",
		},
	}
	config.Contexts["mainnet"] = Context{
		SystemObject:    "0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2",
		StakingObject:   "0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904",
		SubsidiesObject: "0xb606eb177899edc2130c93bf65985af7ec959a2755dc126c953755e59324209e",
		ExchangeObjects: []string{},
		WalletConfig: WalletConfig{
			Path:      newPath,
			ActiveEnv: "mainnet",
		},
	}

	config.DefaultContext = "mainnet"
	config.Path = newPath
	config.ActiveEnv = "mainnet"

	updatedYAML, err := yaml.Marshal(&config)
	if err != nil {
		return err
	}

	return os.WriteFile(yamlPath, updatedYAML, 0644)
}

// func updateWalletConfig(yamlPath, env, newPath string) error {
// 	data, err := os.ReadFile(yamlPath)
// 	if err != nil {
// 		return err
// 	}

// 	var config Config
// 	if err := yaml.Unmarshal(data, &config); err != nil {
// 		return err
// 	}
// 	fmt.Println("updateWalletConfig", config, env)
// 	// Update wallet_config for the given environment (e.g., "mainnet", "testnet")
// 	if ctx, ok := config.Contexts["testnet"]; ok {
// 		ctx.WalletConfig.Path = newPath
// 		ctx.WalletConfig.ActiveEnv = "testnet"
// 		ctx.ExchangeObjects = []string{
// 			"0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073",
// 			"0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862",
// 			"0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5",
// 			"0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1",
// 		}
// 		config.Contexts["testnet"] = ctx
// 	} else {
// 		return fmt.Errorf("context %s not found", env)
// 	}
// 	if ctx, ok := config.Contexts["mainnet"]; ok {
// 		ctx.WalletConfig.Path = newPath
// 		ctx.WalletConfig.ActiveEnv = "mainnet"
// 		config.Contexts["mainnet"] = ctx
// 	} else {
// 		return fmt.Errorf("context %s not found", env)
// 	}

// 	config.DefaultContext = env
// 	config.Path = newPath
// 	config.ActiveEnv = env

// 	// Marshal and write back to file
// 	updatedYAML, err := yaml.Marshal(&config)
// 	if err != nil {
// 		return err
// 	}

// 	return os.WriteFile(yamlPath, updatedYAML, 0644)
// }
