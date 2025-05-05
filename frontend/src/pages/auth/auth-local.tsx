import React, { useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import LocalWallet from '../../components/auth/local-wallet'; // Import LocalWallet
import SelectWalletProfileComponent from '../../components/auth/select-profile'; // Import SelectWalletProfileComponent
import ImportWalletComponent from '../../components/auth/import-wallet';
import Button from '../../components/Button'; // Import Button
import Modal from '../../components/Modal'; // Import Modal


const AuthLocalPage: React.FC = () => {
  // State for modal visibility
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleGenerateWallet = async () => {
    console.log('Generate new Wallet clicked');
    setIsGenerateModalOpen(true); // Open Generate modal
  };

  const handleSelectWallet = async () => setIsSelectModalOpen(true); // Open Select modal


  // Handles clicking "Import new Wallet" link inside Select modal
  const showImportModal = () => {
    console.log('Show import modal triggered');
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
    <AuthLayout
      title="Connect Local Wallet"
      description="Choose how you want to connect your local wallet."
    >
      {/* Button Container - flex-col as requested */}
      {/* Removed conditional rendering based on old 'view' state */}
      <div className="space-y-3 mt-6 w-full"> {/* Added w-full for buttons */} 
        {/* Button 1: Generate new Wallet */}
        <Button
          variant="custom"
          onClick={handleGenerateWallet}
          className="w-full bg-black text-white hover:opacity-90 font-medium"
        >
          Generate new Wallet
        </Button>

        {/* Button 2: Select existing Wallet */}
        <Button
          variant="custom"
          onClick={handleSelectWallet}
          className="w-full bg-black text-white hover:opacity-90 font-medium"
        >
          Select existing Wallet
        </Button>
      </div>

      {/* --- Modals --- */}

      {/* Generate Wallet Modal (Step 3) */}
      <Modal isOpen={isGenerateModalOpen} onClose={closeGenerateModal}>
        <LocalWallet />
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
      
    </AuthLayout>
  );
};

export default AuthLocalPage; 