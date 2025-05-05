import React from 'react';
import Button from '../Button'; // Assuming Button is in ../components

interface DeploymentStep3Props {
  onClose: () => void;
}

const DeploymentStep3: React.FC<DeploymentStep3Props> = ({ onClose }) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg w-[500px] text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Success!</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Your site deployment is initiated. Details related to the linking fee are shown below.
      </p>

      <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-8 text-sm text-left">
        {/* Example Fee Breakdown - Reuse from Step 2 or show confirmation details */}
        <div className="flex justify-between mb-2">
          <span className="text-gray-700 dark:text-gray-300">Linking Fee:</span>
          <span className="font-medium text-gray-900 dark:text-white">0.05 SUI</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Transaction Fee Estimate:</span>
          <span className="font-medium text-gray-900 dark:text-white">~0.001 SUI</span>
        </div>
        {/* Add link to transaction explorer or site URL if available */}
      </div>

      <div className="flex justify-center gap-3">
        {/* Changed to a single Close button */}
        <Button variant="primary" onClick={onClose}> 
          Close
        </Button>
      </div>
    </div>
  );
};

export default DeploymentStep3; 