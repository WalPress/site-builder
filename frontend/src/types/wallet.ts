

export interface WalletStruct {
    activeAddress: string;
    addresses: Wallet[];
}

export interface Wallet {
    address: string;
    name: string;
}

export interface NewWalletResponse {
    alias: string;
    address: string;
    keyScheme: string;
    recoveryPhrase: string;
}