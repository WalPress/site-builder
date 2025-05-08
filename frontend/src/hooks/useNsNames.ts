import { getSuinsClient, getSUiClient } from "../utils/helper";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import {  useState } from "react";
import { useAccount } from "../context/account";
import { SuinsTransaction } from "@mysten/suins";



const useNsNames = () => {
    const [nsNames, setNsNames] = useState<{objectId: string, name: string, link: string, expiry: number}[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { getPrivateKey } = useAccount();

    const searchNs = async (domain: string): Promise<boolean> => {
        const client = getSuinsClient("mainnet")
        const response = await client.getNameRecord(domain + ".sui");
        console.log("searchNs", response);
        return !!response;
    }
    
    const getNsNames = async () => {
        setIsLoading(true);
        const client = getSUiClient("mainnet")
        const privateKey = await getPrivateKey();
        const keypair = Ed25519Keypair.fromSecretKey(privateKey);
        // console.log("activeWallet", activeWallet);
        const response = await client.getOwnedObjects({
            owner: keypair.toSuiAddress(),
            filter: {
                MatchAll: [
                    {
                        StructType: "0xd22b24490e0bae52676651b4f56660a5ff8022a2576e0089f79b3c88d44e08f0::suins_registration::SuinsRegistration",
                    },
                ],
            },
            options:{
                showContent: true,
                showDisplay: true,
                showType: true,
                showOwner: true,
            }
        });

        const objects = response.data.map((item: any) => {
            return {
                objectId: item.data?.objectId,
                name: item.data?.content?.fields?.domain_name,
                link: item.data?.display?.data?.link,
                expiry: item.data?.content?.fields?.expiration_timestamp_ms,
            };
        });
        setNsNames(objects);
        console.log("response", objects, response);
        setIsLoading(false);
    }

    const registerNs = async (domain: string, years: number) => {
        try {
            const client = getSuinsClient("mainnet")
            const suiClient = getSUiClient("mainnet")
            const transaction = new Transaction();
            const suinsTx = new SuinsTransaction(client, transaction);
            // Specify the coin type used for the transaction, can be SUI/NS/USDC
            const coinConfig = client.config.coins.SUI;
            const privateKey = await getPrivateKey();
            const keypair = Ed25519Keypair.fromSecretKey(privateKey);
            
            console.log("coinConfig", coinConfig, "sui-address", keypair.toSuiAddress());
            // priceInfoObjectId is required for SUI/NS
            const priceInfoObjectId = (await client.getPriceInfoObject(suinsTx.transaction, coinConfig.feed))[0];

            console.log("priceInfoObjectId", priceInfoObjectId);
            const nft = suinsTx.register({
                domain: domain,
                years: years,
                coinConfig: coinConfig,
                coin: coinConfig.type,
                priceInfoObjectId: priceInfoObjectId,
            });
            transaction.transferObjects([nft], transaction.pure.address(keypair.toSuiAddress()));
            
            const response = await suiClient.signAndExecuteTransaction({
                transaction: transaction,
                signer: keypair,
            });
            console.log('Name registered successfully:', response);
            return response;
        } catch (error) {
            console.error('Error registering name:', error);
            throw error;
        }
    }

    const LinkNsName = async (nftId: string, objectId: string) => {
        try {
            const client = getSuinsClient("mainnet")
            const suiClient = getSUiClient("mainnet")

            const transaction = new Transaction();
            const suinsTx = new SuinsTransaction(client, transaction);
            
            const privateKey = await getPrivateKey();
            const keypair = Ed25519Keypair.fromSecretKey(privateKey);
            
            suinsTx.setTargetAddress({
                nft: nftId,
                address: objectId,
                isSubname: false,
            });
            
            const response = await suiClient.signAndExecuteTransaction({
                transaction: transaction,
                signer: keypair,
            });
            console.log('Name linked successfully:', response);
            return response;
        } catch (error) {
            console.error('Error linking name:', error);
            throw error;
        }  
    }

    const renewNs = async (nftId: string, years: number) =>  {
        try {
            const client = getSuinsClient("mainnet")
            const suiClient = getSUiClient("mainnet")

            const transaction = new Transaction();
            const suinsTx = new SuinsTransaction(client, transaction);
            
            const privateKey = await getPrivateKey();
            const keypair = Ed25519Keypair.fromSecretKey(privateKey);
            const priceInfoObjectId = (await client.getPriceInfoObject(suinsTx.transaction, client.config.coins.SUI.feed))[0];
            
            suinsTx.renew({
                nft: nftId,
                years: years,
                coinConfig: client.config.coins.SUI,
                priceInfoObjectId: priceInfoObjectId,
            });
            
            const response = await suiClient.signAndExecuteTransaction({
                transaction: transaction,
                signer: keypair,
            });
            console.log('Name linked successfully:', response);
            return response;
        } catch (error) {
            console.error('Error linking name:', error);
            throw error;
        }  
    }
    
    return { searchNs, nsNames, isLoading, getNsNames, registerNs, LinkNsName, renewNs };
}

export default useNsNames;