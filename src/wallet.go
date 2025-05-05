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
