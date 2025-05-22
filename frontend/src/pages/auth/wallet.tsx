import React, { useState } from 'react';

import LocalWallet from '../../components/auth/local-wallet'; // Import LocalWallet
import SelectWalletProfileComponent from '../../components/auth/select-profile'; // Import SelectWalletProfileComponent
import ImportWalletComponent from '../../components/auth/import-wallet';
import Button from '../../components/Button'; // Import Button
import Modal from '../../components/Modal'; // Import Modal
import walpressLogo from '../../assets/walpresslogo.png';
import useWallet from '../../hooks/useWallet';
import { Loader } from 'lucide-react';
const AuthLocalPage: React.FC = () => {
  // State for modal visibility
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { generateWallet, isGenerating, newWallet, handleContinue, isSwitching } = useWallet();
  
  const handleGenerateWallet = async () => {
    await generateWallet();
    setIsGenerateModalOpen(true); // Open Generate modal
  };

  const handleSelectWallet = async () => setIsSelectModalOpen(true); // Open Select modal

  // Handles clicking "Import new Wallet" link inside Select modal
  const showImportModal = () => {
    setIsSelectModalOpen(false); // Close Select modal
    setIsImportModalOpen(true); // Open Import modal
  };

  // Generic close handlers
  const closeGenerateModal = () => setIsGenerateModalOpen(false);
  const closeSelectModal = () => setIsSelectModalOpen(false);
  const closeImportModal = () => setIsImportModalOpen(false);

  return (
    // AuthLayout wraps the main page content (buttons)
    // Modals will overlay this layout when open
    <div className="w-full max-w-md space-y-4">
      <img src={walpressLogo} alt="Walpress Logo" className="w-[190px] max-h-fit mb-4 mx-auto" />
      <h1 className="text-2xl font-semibold text-foreground">Connect Local Wallet</h1>
      <p className="text-sm text-muted-foreground">Choose how you want to connect your local wallet.</p>
      <div className="mt-6"> 
        {/* Button Container - flex-col as requested */}
        {/* Removed conditional rendering based on old 'view' state */}
        <div className="space-y-3 mt-6 w-full"> {/* Added w-full for buttons */} 
          {/* Button 1: Generate new Wallet */}
          <Button
            variant="custom"
            onClick={handleGenerateWallet}
            className="w-full bg-black text-white hover:opacity-90 font-medium"
            disabled={isGenerating}
          >
            {isGenerating ? <Loader className="animate-spin text-muted-foreground mx-auto" size={15} /> : "Generate new Wallet"}
          </Button>

          {/* Button 2: Select existing Wallet */}
          <Button
            variant="custom"
            onClick={handleSelectWallet}
            className="w-full bg-black text-white hover:opacity-90 font-medium"
            disabled={isGenerating}
          >
            Select existing Wallet
          </Button>
        </div>
      </div>

        {/* --- Modals --- */}
        {/* Generate Wallet Modal (Step 3) */}
        <Modal isOpen={isGenerateModalOpen} onClose={closeGenerateModal}>
          <LocalWallet 
            newWallet={newWallet}
            isGenerating={isGenerating}
            handleContinue={handleContinue}
            isSwitching={isSwitching}
          />
        </Modal>

        {/* Select Profile Modal (Step 4) */}
        <Modal isOpen={isSelectModalOpen} onClose={closeSelectModal}>
          <SelectWalletProfileComponent 
            onImportClick={showImportModal}
          />
        </Modal>

        {/* Import Wallet Modal (Step 5) */}
        {/* This modal is opened via the link in SelectWalletProfileComponent */}
        <Modal isOpen={isImportModalOpen} onClose={closeImportModal}>
          <ImportWalletComponent />
        </Modal>
    </div>
  );
};

export default AuthLocalPage; 