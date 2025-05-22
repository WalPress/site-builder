import React, { useState, useEffect, useRef } from 'react';
import profileLogo from '../../assets/profile.jpg';
import { useAccount } from '../../context/account';
import { ChevronDownIcon, ChevronUpIcon, CopyIcon, ExternalLinkIcon, RefreshCw, Loader } from 'lucide-react';
import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime';
import useNetwork from '../../hooks/useNetwork';
import useBalance from '../../hooks/useBalance';
const Topbar: React.FC = () => {
    const { activeWallet } = useAccount();
    const { currentNetwork, switchNetwork } = useNetwork();
    const { balance, getBalance, isFetchingBalance } = useBalance();
    
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsAccountDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
        
    }, []);

    const GetBalanceByCoin = (coin: string) => balance.find((item: any) => item.symbol.toLowerCase() === coin.toLowerCase());

    return (
        <div className="h-[66px] border-b border-border p-2 bg-sidebar text-card-foreground rounded-lg">
            <div className="flex items-center justify-between h-full">
                <div className="flex border-b border-gray-200 bg-background dark:border-gray-700 p-1 rounded-lg">
                    <button
                        onClick={() => switchNetwork('mainnet')}
                        disabled={currentNetwork === 'mainnet'}
                        className={`text-sm font-medium transition-colors disabled:cursor-not-allowed 
                          ${currentNetwork === 'mainnet' 
                            ? 'border-b-2 border-sidebar bg-sidebar text-white dark:text-blue-400 dark:border-blue-400' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
                        `}
                    >
                        Mainnet
                    </button>
                    <button
                        onClick={() => switchNetwork('testnet')}
                        disabled={currentNetwork === 'mainnet'}
                        className={`py-2 px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed 
                          ${currentNetwork === 'testnet' 
                            ? 'border-b-2 border-sidebar bg-sidebar text-white dark:text-blue-400 dark:border-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
                        `}
                    >
                        Testnet
                    </button>
                </div>
                <div className="relative">
                    <div 
                        ref={triggerRef}
                        className="flex items-center gap-2 text-white cursor-pointer p-2 hover:bg-gray-700 rounded-md" 
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    >
                        <img src={profileLogo} alt="Profile" className="w-6 h-6 rounded-full" />
                        <div className='flex flex-col text-xs'>
                            <span>Wallet ID</span>
                            <span>{activeWallet ? `${activeWallet.slice(0, 4)}...${activeWallet.slice(-4)}` : 'N/A'}</span>
                        </div>
                        {isAccountDropdownOpen ? <ChevronUpIcon className='w-4 h-4' /> : <ChevronDownIcon className='w-4 h-4' />}
                    </div>
                    {isAccountDropdownOpen && (
                        <div 
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 py-2 text-sm"
                        >
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-gray-800 dark:text-white">Connected Wallet</p>
                                    {isFetchingBalance ? <Loader className="animate-spin text-muted-foreground" size={15} /> : <RefreshCw className="w-4 h-4" onClick={() => getBalance()} />}
                                </div>
                                
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-gray-600 dark:text-gray-300 truncate w-48" title={activeWallet}>{activeWallet || 'N/A'}</p>
                                    <CopyIcon 
                                        className="w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer"
                                        onClick={() => activeWallet && navigator.clipboard.writeText(activeWallet)}
                                    />
                                </div>
                            </div>
                            
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-700 dark:text-gray-300">SUI Balance:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{ isFetchingBalance ? "--.--" : GetBalanceByCoin("sui") ? GetBalanceByCoin("sui").balance : "0.00"} SUI</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-gray-300">WAL Balance:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{isFetchingBalance ? "--.--" : GetBalanceByCoin("wal") ? GetBalanceByCoin("wal").balance : "0.00"} WAL</span> 
                                </div>
                            </div>

                            <span 
                                onClick={() => BrowserOpenURL(`https://suiscan.xyz/${currentNetwork}/account/${activeWallet}`)} 
                                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                                <ExternalLinkIcon className="w-4 h-4 mr-2" /> View on Explorer
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Topbar;