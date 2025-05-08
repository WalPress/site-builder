package wallet

import (
	"cli-runner/src/settings"
	"cli-runner/src/utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"

	"github.com/google/uuid"
)

// GenerateWallet generates a new wallet
func GenerateWallet() (interface{}, error) {
	randomName := "walpress-" + uuid.New().String()
	out, err := utils.RunSuiCommand("new-address secp256k1 " + randomName)
	fmt.Println("out", out, "err", err)
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
	out, err := utils.RunSuiCommandRawOnly("active-address")
	if err != nil {
		fmt.Println("no active address found: " + err.Error())
		return "", fmt.Errorf("no active address found: " + err.Error())
	}
	return out, nil
}

func SwitchAddress(db *sql.DB, address string) (interface{}, error) {
	out, err := utils.RunSuiCommand("switch --address " + address)
	if err != nil {
		return nil, fmt.Errorf("Failed to set active address: " + err.Error())
	}
	settings.CreateOrUpdate(db, utils.ACTIVE_ADDRESS, address)
	settings.CreateOrUpdate(db, utils.IS_AUTHENTICATED, "true")
	return out, nil
}

func SwitchNetwork(db *sql.DB, network string) (interface{}, error) {
	out, err := utils.RunSuiCommand("switch --env " + network)
	if err != nil {
		return nil, fmt.Errorf("Failed to switch network: " + err.Error())
	}
	settings.CreateOrUpdate(db, utils.ACTIVE_NETWORK, network)
	return out, nil
}

func GetAllNetworks() (interface{}, error) {
	out, err := utils.RunSuiCommandRaw("envs")
	if err != nil {
		return nil, fmt.Errorf("Failed to get all networks: " + err.Error())
	}
	var jsonData interface{}
	err = json.Unmarshal([]byte(out), &jsonData)
	if err != nil {
		return nil, err
	}
	fmt.Println("jsonData", jsonData)
	return jsonData, nil
}
