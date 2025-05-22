import { getSuinsClient, getSUiClient } from "../utils/helper";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import {  useEffect, useState } from "react";
import { useAccount } from "../context/account";
import { ALLOWED_METADATA, SuinsTransaction } from "@mysten/suins";
import * as runtime from "../../wailsjs/runtime";
import useSetting from "./useSetting";

const useNsNames = () => {
    const [nsNames, setNsNames] = useState<{objectId: string, name: string, link: string, expiry: number}[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { settings, getSettings } = useSetting();
    const { getPrivateKey } = useAccount();

    useEffect(() => {
        getSettings();
    }, []);

    const getSettingsValues = () => {
        return {
            gasBudget: Number(settings?.gas || "0.001"),
            pricePerYear: 5,
        }
    }

    const searchNs = async (domain: string): Promise<boolean> => {
        const client = getSuinsClient("mainnet")
        const response = await client.getNameRecord(domain.toLowerCase() + ".sui");
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
            // Specify the coin type used for the transaction, can be SUI
            const coinConfig = client.config.coins.SUI;
            const privateKey = await getPrivateKey();
            const keypair = Ed25519Keypair.fromSecretKey(privateKey);
            const amountToPay = years * 5;
            const gasbudgetValue = settings?.gas || "0.001";
            transaction.setGasBudget(Number(gasbudgetValue) * 1_000_000_000);
            const maxPaymentAmount = amountToPay * 1_000_000_000;
            const [coin] = suinsTx.transaction.splitCoins(suinsTx.transaction.gas, [maxPaymentAmount]);
            
            // priceInfoObjectId is required for SUI/NS
            const priceInfoObjectId = (await client.getPriceInfoObject(suinsTx.transaction, coinConfig.feed))[0];

            runtime.LogInfo(`priceInfoObjectId: ${priceInfoObjectId}, coinConfig: ${coinConfig}`);

            const nft = suinsTx.register({
                domain: domain.toLowerCase() + ".sui",
                years: years,
                coinConfig,
                coin,
                priceInfoObjectId,
            });
            
            runtime.LogInfo(`nft: ${nft}, coin: ${coin}, address: ${keypair.toSuiAddress()}`);
            suinsTx.transaction.transferObjects(
                [nft, coin],
                keypair.toSuiAddress(),
            );
            
            runtime.LogInfo(`suiTx--> ${transaction}`);

            const response = await suiClient.signAndExecuteTransaction({
                transaction: transaction,
                signer: keypair,
            });

            runtime.LogInfo(`suiTx--> ${transaction}`);

            runtime.LogInfo(`Name registered successfully: ${response.digest}`);
            const validateTx = await suiClient.waitForTransaction({digest: response.digest});
            runtime.LogInfo(`validateTx--> ${validateTx}`);
            return response;
        } catch (error) {
            runtime.LogInfo(`Error registering name: ${error}`);
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
            
            // suinsTx.setTargetAddress({
            //     nft: nftId,
            //     address: objectId,
            //     isSubname: false,
            // });

            suinsTx.setUserData({
                nft: nftId,
                key: ALLOWED_METADATA.walrusSiteId,
                value: objectId,
                isSubname: false,
            })

            runtime.LogInfo(`nftId: ${nftId}, objectId: ${objectId}`);
            
            const response = await suiClient.signAndExecuteTransaction({
                transaction: transaction,
                signer: keypair,
            });
            runtime.LogInfo(`Name linked successfully: ${response}`);
            return response;
        } catch (error) {
            console.error('Error linking name:', error);
            runtime.LogInfo(`Error linking name: ${error}`);
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
            runtime.LogInfo(`Renewed NS successfully: ${response}`);
            return response;
        } catch (error) {
            runtime.LogInfo(`Error renewing NS: ${error}`);
            throw error;
        }  
    }
    
    return { searchNs, nsNames, isLoading, getNsNames, registerNs, LinkNsName, renewNs, getSettingsValues };
}

export default useNsNames;