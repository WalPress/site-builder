import { useState } from "react";

import { GetBalance } from "../../wailsjs/go/src/app";

const useBalance = () => {
    const [balance, setBalance] = useState<Array<any>>([]);

    const getBalance = async () => {
        const response = await GetBalance();
        console.log("getBalance", response);
        const flattenedBalance = await flattenBalance(response);
        setBalance(flattenedBalance);
    }

    const flattenBalance = async (jsonData: Array<any>) => {
        const allCoinB = [];
        const allBalances = jsonData[0];
        for (const balance of allBalances) {
            console.log("balance", balance);
            const coinData = balance[0];
            const coinBalance = (balance[1] || []).reduce((acc: number, curr: any) => acc + Number(curr.balance || "0"), 0);
            const CoinBalance = {
                ...coinData,
                balance: coinBalance / 10**coinData.decimals,
            }
            allCoinB.push(CoinBalance);
        }
        return allCoinB;
    }

    return { balance, getBalance, flattenBalance };
}

export default useBalance;