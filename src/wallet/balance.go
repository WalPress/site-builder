package wallet

import (
	"cli-runner/src/utils"
	"encoding/json"
	"fmt"
)

type Coin struct {
	CoinType            string `json:"coinType"`
	CoinObjectId        string `json:"coinObjectId"`
	Version             string `json:"version"`
	Digest              string `json:"digest"`
	Balance             string `json:"balance"`
	PreviousTransaction string `json:"previousTransaction"`
}

type Token struct {
	Decimals    int    `json:"decimals"`
	Name        string `json:"name"`
	Symbol      string `json:"symbol"`
	Description string `json:"description"`
	IconUrl     string `json:"iconUrl"`
	ID          string `json:"id"`
	Coins       []Coin `json:"coins"`
}

type TokenData struct {
	Token Token  `json:"token"`
	Coins []Coin `json:"coins"`
}

type FlattenedResponse struct {
	Tokens   []Token `json:"tokens"`
	Complete bool    `json:"complete"`
}

func GetBalance() (interface{}, error) {
	out, err := utils.RunSuiCommandRaw("balance")
	if err != nil {
		return nil, err
	}
	var jsonData interface{}
	err = json.Unmarshal([]byte(out), &jsonData)
	if err != nil {
		return nil, err
	}
	return jsonData, nil
}

func GetBalanceForAddress(address string) (interface{}, error) {
	out, err := utils.RunSuiCommand("balance --address " + address)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func GetBalanceForAddressAndNetwork(address string, network string) (interface{}, error) {
	out, err := utils.RunSuiCommand("balance --address " + address + " --network " + network)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func GetBalanceForAddressAndNetworkAndCoinType(address string, network string, coinType string) (interface{}, error) {
	out, err := utils.RunSuiCommand("balance --address " + address + " --network " + network + " --coin-type " + coinType)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func GetTestnetFaucet() (interface{}, error) {
	out, err := utils.RunWalrusCommand("get-wal --network testnet")
	fmt.Println("out", out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func GetPrivateKey(address string) (interface{}, error) {
	out, err := utils.RunSuiCommandKeytoolExport(address)
	if err != nil {
		fmt.Println("Error getting private key:", err)
		return nil, err
	}
	return out, nil
}
