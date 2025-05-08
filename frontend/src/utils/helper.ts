import { Network as SNetwork, SuinsClient } from '@mysten/suins';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

type Network = 'testnet' | 'mainnet' | 'devnet' | 'localnet';
const getSUiClient = (network: string) => {
    const client = new SuiClient({ url: getFullnodeUrl(network as Network) });
    return client;
}
const getSuinsClient = (network: string) => {
    const client = new SuiClient({ url: getFullnodeUrl(network as Network) });
    const suinsClient = new SuinsClient({
        client,
        network: network as SNetwork,
    });
    return suinsClient;
}

export { getSuinsClient, getSUiClient };