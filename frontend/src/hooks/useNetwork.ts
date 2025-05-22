import { useState, useMemo, useEffect } from "react";
import { GetAllNetworks, SwitchNetwork } from "../../wailsjs/go/src/app";

const useNetwork = () => {
    const [currentNetwork, setCurrentNetwork] = useState<string>("");
    const [networks, setNetworks] = useState<{label: string, value: string}[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSwitching, setIsSwitching] = useState<boolean>(false);

    const getNetworks = async () => {   
        setIsLoading(true);
        const response = await GetAllNetworks();
        console.log("getNetworks", response);
        const activeNetwork = response[1];
        const flattenedNetworks = await flattenNetworks(response[0]);
        console.log("flattenedNetworks", flattenedNetworks);
        setNetworks(flattenedNetworks);
        setCurrentNetwork(activeNetwork);
        setIsLoading(false);
    }

    useEffect(() => {
        getNetworks();
    }, []);

    const switchNetwork = async (network: string) => {
        setIsSwitching(true);
        const response = await SwitchNetwork(network);
        // console.log(response);
        if (response.env == network) {
            await getNetworks();
        }
        setIsSwitching(false);
    }

    const flattenNetworks = async (networks: Array<any>) => {
        const allNetworks = [];
        for (const network of networks) {
            const networkData = {
                label: network.rpc,
                value: network.alias,
            }
            allNetworks.push(networkData);  
        }
        return allNetworks;
    }

    console.log("networks", networks,currentNetwork);

    return useMemo(() => ({ networks, getNetworks, switchNetwork, flattenNetworks, currentNetwork, isLoading, isSwitching }), [networks, currentNetwork, isLoading, isSwitching]);
}

export default useNetwork;