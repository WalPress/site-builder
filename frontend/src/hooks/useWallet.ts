import { useState } from "react";

import { NewWalletResponse, Wallet, WalletStruct } from "../types/wallet";
import { FetchWallets, GenerateWallet, SwitchAddress } from "../../wailsjs/go/src/app";
import { useAccount } from "../context/account";
import { useNavigate } from "react-router-dom";
const useWallet = () => {
    const { activeWallet, setAuthToken } = useAccount();
    const navigate = useNavigate();
    const [isFetchingWallets, setIsFetchingWallets] = useState(true);
    const [newWallet, setNewWallet] = useState<NewWalletResponse>({} as NewWalletResponse);
    const [existingWallets, setExistingWallets] = useState<WalletStruct>({} as WalletStruct);

    const generateWallet = async () => {
        const result = await GenerateWallet();
        setNewWallet(result);
    }

    const handleContinue = async (address: string) => {
        console.log('handleContinue', address)
        // call switch address
        const result = await SwitchAddress(address);
        console.log('result', result)
        setAuthToken(address);
        return navigate('/app');
    }

    const fetchWallets = async () => {
        setIsFetchingWallets(true);
        const result = await FetchWallets();
        const walletResponse = {
            activeAddress: result.activeAddress,
            addresses: result.addresses.map((a: string[]) => ({
                name: a[0],
                address: a[1],
            })).sort((a: Wallet, b: Wallet) => {
                if (a.address === result.activeAddress) return -1;
                if (b.address === result.activeAddress) return 1;
                return a.name.localeCompare(b.name);
            }),
        }
        setExistingWallets(walletResponse);
        setAuthToken(walletResponse.activeAddress);
        setIsFetchingWallets(false);
    }


    const selectWallet = (wallet: Wallet) => handleContinue(wallet.address);

    const handleWalletImport = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent default link behavior
    };

    return {
        newWallet, setNewWallet, generateWallet, fetchWallets, existingWallets, selectWallet, handleContinue, handleWalletImport, isFetchingWallets, activeWallet
    }
}

export default useWallet;