import React from 'react';
import Button from '../../Button'; // Adjusted path
import deployIcon from '../../../assets/deploy-icon.png'; // Adjusted path

interface RegisterStep2Props {
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  domainName?: string; // To display the name being registered
  durationYears?: number; // To display selected duration
  estimatedCost?: number; // Placeholder for cost
  transactionFee?: number; // Placeholder for fee
}

const RegisterStep2: React.FC<RegisterStep2Props> = ({
  onConfirm,
  onBack,
  // onCancel,
  isProcessing = false,
  domainName = "yourname.sui", // Placeholder
  durationYears = 1, // Placeholder
  estimatedCost = 10, // Placeholder SUI or token amount
  transactionFee = 0.01, // Placeholder SUI
}) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg w-full text-center">
      <img src={deployIcon} alt="Confirm Registration" className="w-20 h-20 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Confirm Registration Details</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Please review the details for registering "<strong>{domainName}</strong>" for {durationYears} year(s).
      </p>

      <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-8 text-sm text-left space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Domain Name:</span>
          <span className="font-medium text-gray-900 dark:text-white">{domainName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Registration Duration:</span>
          <span className="font-medium text-gray-900 dark:text-white">{durationYears} Year(s)</span>
        </div>
        <hr className="border-gray-300 dark:border-gray-600 my-2"/>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Estimated Cost:</span>
          <span className="font-medium text-gray-900 dark:text-white">{estimatedCost} SUI</span> {/* Adjust currency as needed */}
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Transaction Fee:</span>
          <span className="font-medium text-gray-900 dark:text-white">~{transactionFee.toFixed(3)} SUI</span>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Confirm & Register'}
        </Button>
        {/* Optional Cancel button for this step if needed, or rely on modal's main close */}
        {/* <Button variant="outline" onClick={onCancel} disabled={isProcessing}>Cancel</Button> */}
      </div>
    </div>
  );
};

export default RegisterStep2; 