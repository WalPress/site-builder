import React, { useEffect, useState } from 'react';
import Button from '../Button';
import { CopyIcon } from 'lucide-react';
import useWallet from '../../hooks/useWallet';


const LocalWallet: React.FC = () => {
  const [_, setIsCopied] = useState(false);
  const { generateWallet, newWallet, handleContinue } = useWallet();

  useEffect(() => {
    generateWallet()
  }, []);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
  };

  return (
    <div className="mt-8 text-center space-y-4 w-[400px]">
      {/* Success Icon (Example SVG - replace with your preferred icon) */}
      <svg
        className="w-12 h-12 text-green-500 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>

      <h2 className="text-xl font-semibold text-foreground">Local Wallet Created</h2>
      <p className="text-sm text-muted-foreground px-4">
        This is the only time we will show your private key. Copy and download your files to proceed.
      </p>

      {/* Key/Address Display */}
      <div className="bg-muted dark:bg-gray-800 p-4 rounded-md text-left space-y-2 max-w-md mx-auto">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">Private Key:</span>
          <div className="flex items-center flex-row gap-2">
            <span className="text-muted-foreground font-mono break-all max-w-[200px]">
              {newWallet.recoveryPhrase}
            </span>
            <CopyIcon onClick={() => handleCopy(newWallet.recoveryPhrase || '')} className="text-primary hover:text-primary/80 w-4 h-4" />
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">Wallet Address:</span>
          <div className="flex items-center flex-row gap-2">
            <span className="text-muted-foreground font-mono break-all max-w-[200px]">
              {newWallet.address}
            </span>
            <CopyIcon onClick={() => handleCopy(newWallet.address)} className="text-primary hover:text-primary/80 w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <Button
        variant="primary"
        onClick={() => handleContinue(newWallet.address)}
        className="px-6"
      >
        Continue to dashboard
      </Button>
    </div>
  );
};

export default LocalWallet; 