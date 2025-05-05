package wallet

import (
	"cli-runner/src/utils"
	"fmt"
	"log"
	"os/exec"

	"github.com/google/uuid"
)

// GenerateWallet generates a new wallet
func GenerateWallet() (interface{}, error) {
	// return map[string]interface{}{
	// 	"response": "Generating wallet",
	// }, nil
	randomName := "walpress-" + uuid.New().String()
	out, err := utils.RunSuiCommand("new-address secp256k1 " + randomName)
	if err != nil {
		log.Fatalf("Failed to generate local wallet: " + err.Error())
		return nil, fmt.Errorf("Failed to generate local wallet: " + err.Error())
	}
	return out, nil
}

// FetchWallets fetches all local wallets
func FetchWallets() (interface{}, error) {
	fmt.Println("Fetching wallets")
	out, err := utils.RunSuiCommand("addresses")
	if err != nil {
		fmt.Println("Failed to fetch local wallets: " + err.Error())
		return nil, fmt.Errorf("Failed to fetch local wallets: " + err.Error())
	}
	fmt.Println("response==>", out)
	return out, nil
}

// ImportWallet imports a wallet
func ImportWallet() {
	exec.Command("walrus", "wallet", "import").Run()
}

// CheckUserAuth checks if the user is authenticated
func CheckUserAuth() (string, error) {
	fmt.Println("checking user auth")
	out, err := utils.RunSuiCommandRaw("active-address")
	if err != nil {
		fmt.Println("no active address found: " + err.Error())
		return "", fmt.Errorf("no active address found: " + err.Error())
	}
	fmt.Println("response==>", out)
	return out, nil
}
