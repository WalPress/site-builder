import React from 'react';
import Button from '../../Button'; // Assuming Button is in ../components
import deployIcon from '../../../assets/deploy-icon.png'; // Adjust path as needed

interface LinkNSNameStep2Props {
  onContinue: () => void; // Changed from onDeploy
  // onBack: () => void;     // Added for navigation
  onCancel: () => void;
  isProcessing?: boolean; // Changed from isDeploying
  storageCost?: number;   // Made optional for placeholder
  transactionFee?: number; // Made optional for placeholder
}

const LinkNSNameStep2: React.FC<LinkNSNameStep2Props> = ({
  onContinue,
  onCancel,
  isProcessing = false,
  storageCost = 0.5, // Placeholder value
  transactionFee = 0.01, // Placeholder value
}) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm text-center">
      <img src={deployIcon} alt="Confirm Details" className="w-20 h-20 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Linking your Sui NS to your website.</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
      You are initiating the process of linking your Sui Name Service (Sui NS) to your website. This action is subject to a fee, the details of which are provided below.
      </p>

      <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-8 text-sm text-left space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Storage Fee:</span>
          <span className="font-medium text-gray-900 dark:text-white">{storageCost.toFixed(2)} WAL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Transaction Fee:</span>
          <span className="font-medium text-gray-900 dark:text-white">~{transactionFee.toFixed(3)} SUI</span>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {/* <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button> */}
        <Button variant="primary" onClick={onContinue} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Go Live'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default LinkNSNameStep2; 