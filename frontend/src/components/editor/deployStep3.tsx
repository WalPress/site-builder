import React from 'react';
import Button from '../Button'; // Assuming Button is in ../components
import { Copy } from 'lucide-react';

interface DeploymentStep3Props {
  onClose: () => void;
}

const DeploymentStep3: React.FC<DeploymentStep3Props> = ({ onClose }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-[250px] text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Success!</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Your site deployment is initiated. Details related to the linking fee are shown below.
      </p>

      <span className="text-gray-700 dark:text-gray-300">Blob Id:</span>
      <div className="flex gap-4 bg-gray-100 dark:bg-gray-700 rounded p-4 mb-8 text-sm text-left">
          <span className="font-medium text-gray-900 dark:text-white break-all">ox90asaf1354635768767564xsfaf3524</span>
          <span className="text-gray-700 dark:text-gray-300"><Copy size={16} /></span>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="primary" onClick={onClose}> 
          Link Site
        </Button>
        <Button variant="outline" onClick={onClose}> 
          Close
        </Button>
      </div>
    </div>
  );
};

export default DeploymentStep3; 