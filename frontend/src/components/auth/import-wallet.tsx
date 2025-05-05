import React, { useState } from 'react';
import Button from '../Button'; // Import Button
// import useWallet from '../../hooks/useWallet';

// TODO: Implement actual import logic
const handleImport = (privateKey: string) => {
  console.log('Import button clicked with key:', privateKey);
  // Add logic here to validate and import the wallet using the private key
};

const ImportWalletComponent: React.FC = () => {
  const [privateKey, setPrivateKey] = useState('');
  // const { newWallet, selectWallet } = useWallet();

  const onImportClick = () => {
    handleImport(privateKey);
  };

  return (
    <div className="mt-8 text-center space-y-4 w-[400px]">
      <h2 className="text-xl font-semibold text-foreground">Enter Private Key</h2>
      <p className="text-sm text-muted-foreground px-4">
        Lorem ipsum dolor sit amet consectetur. In metus mattis magna lacus. Integer quis ut id urna vulputate in odio ut.
      </p>

      {/* Input for Private Key */}
      <div className="max-w-md mx-auto">
        <input
          type="password" // Use password type to obscure input
          placeholder="Enter your private key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      {/* Import Button */}
      <Button
        variant="primary" // Use primary variant as requested
        onClick={onImportClick}
        disabled={!privateKey} // Disable button if key is empty
        className="px-6 w-full" // Add padding if needed
      >
        Import
      </Button>
    </div>
  );
};

export default ImportWalletComponent; 