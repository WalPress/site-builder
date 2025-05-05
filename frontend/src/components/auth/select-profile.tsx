import React, { useEffect } from 'react';
import useWallet from '../../hooks/useWallet';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Loader } from '../loader';


// Define props interface to accept the click handler
interface SelectWalletProfileProps {
  onImportClick: () => void;
}

const SelectWalletProfileComponent: React.FC<SelectWalletProfileProps> = ({ onImportClick }) => {
  const { existingWallets, isFetchingWallets, activeWallet, fetchWallets, selectWallet } = useWallet();

  useEffect(() => {
      fetchWallets();
  }, []);
  
  return (
    <div className="mt-8 text-center space-y-4 w-[400px] scrollbar-hide">
      <h2 className="text-xl font-semibold text-foreground">Select existing profile</h2>
      <p className="text-sm text-muted-foreground px-4">
        Lorem ipsum dolor sit amet consectetur. In metus mattis magna lacus. Integer quis ut id urna vulputate in odio ut.
      </p>

      {/* Available Profile Row */}
      <div className="flex justify-between items-center p-4 max-w-md mx-auto text-sm">
        <span className="font-medium text-foreground">Available profile</span>
        <a 
          href="#" 
          onClick={onImportClick} // Use the updated handler
          className="text-primary hover:underline font-medium"
        >
          Import new Wallet →
        </a>
      </div>

      {/* TODO: List actual available profiles here */}
      <div className="text-left max-w-md mx-auto mt-4 overflow-y-auto h-[200px] w-full">
        {isFetchingWallets && (
          <Loader className="animate-spin text-muted-foreground" size={30} />
        )}

        {!isFetchingWallets && (existingWallets?.addresses || []).map((wallet) => (
          <div className="p-3 border-b border-border bg-background rounded-md mb-2 hover:bg-muted/80 cursor-pointer flex justify-between items-center" onClick={() => selectWallet(wallet)}>
            <span className="font-medium text-foreground">{wallet.name} - ({wallet.address.slice(0, 5)}...)</span>
            <span className="flex items-center gap-2 text-muted-foreground text-xs"> 
              {wallet.address === activeWallet && <CheckCircle className="w-4 h-4" />}
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectWalletProfileComponent; 