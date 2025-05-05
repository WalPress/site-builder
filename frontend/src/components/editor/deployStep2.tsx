import React from 'react';
import Button from '../Button'; // Corrected path
import deployIcon from '../../assets/deploy-icon.png';

interface DeploymentStep2Props {
  onDeploy: () => void;
  onCancel: () => void;
}

const DeploymentStep2: React.FC<DeploymentStep2Props> = ({ onDeploy, onCancel }) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg w-[500px] text-center">
      <img src={deployIcon} alt="Success" className="w-16 h-16 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Deploy Site</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        There is a fee for linking your Sui NS name to your site. The details are below.
      </p>

      <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-8 text-sm text-left">
        {/* Example Fee Breakdown - Replace with actual data/logic */}
        <div className="flex justify-between mb-2">
          <span className="text-gray-700 dark:text-gray-300">Linking Fee:</span>
          <span className="font-medium text-gray-900 dark:text-white">0.05 SUI</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Transaction Fee:</span>
          <span className="font-medium text-gray-900 dark:text-white">~0.001 SUI</span>
        </div>
        {/* Add more rows as needed */}
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onDeploy}>
          Deploy
        </Button>
      </div>
    </div>
  );
};

export default DeploymentStep2; 