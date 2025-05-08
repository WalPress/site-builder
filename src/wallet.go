package src

import (
	"cli-runner/src/wallet"
	"fmt"
)

// GenerateWallet generates a new wallet
func (a *App) GenerateWallet() (interface{}, error) {
	return wallet.GenerateWallet()
}

// FetchWallets fetches all local wallets
func (a *App) FetchWallets() (interface{}, error) {
	fmt.Println("Fetching wallets")
	return wallet.FetchWallets()
}

// ImportWallet imports a wallet
func (a *App) ImportWallet() {
	wallet.ImportWallet()
}

// SwitchAddress switches the active address
func (a *App) SwitchAddress(address string) (interface{}, error) {
	return wallet.SwitchAddress(a.db, address)
}

// SwitchNetwork switches the active network
func (a *App) SwitchNetwork(network string) (interface{}, error) {
	return wallet.SwitchNetwork(a.db, network)
}

func (a *App) GetBalance() (interface{}, error) {
	return wallet.GetBalance()
}

func (a *App) GetTestnetToken() (interface{}, error) {
	return wallet.GetTestnetFaucet()
}

func (a *App) GetAllNetworks() (interface{}, error) {
	return wallet.GetAllNetworks()
}

func (a *App) GetPrivateKey(address string) (interface{}, error) {
	return wallet.GetPrivateKey(address)
}
