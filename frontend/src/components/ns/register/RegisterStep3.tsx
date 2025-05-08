import React from 'react';
import Button from '../../Button'; // Adjusted path
import { CheckCircle, Copy } from 'lucide-react'; // Adjusted path for icons

interface RegisterStep3Props {
  onFinish: () => void;
  domainName?: string; // To display the registered name
  transactionId?: string; // Placeholder for transaction ID
}

const RegisterStep3: React.FC<RegisterStep3Props> = ({
  onFinish,
  domainName = "yourname.sui", // Placeholder
  transactionId = "0xabc123...xyz789", // Placeholder
}) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg w-full text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Registration Submitted!</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Your request to register "<strong>{domainName}</strong>" has been submitted. It may take a few moments to confirm on the network.
      </p>

      {transactionId && (
        <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-8 text-sm text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Transaction ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white break-all truncate w-40" title={transactionId}>{transactionId}</span>
              <Copy size={16} className="cursor-pointer hover:text-blue-500 shrink-0" onClick={() => navigator.clipboard.writeText(transactionId)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="primary" onClick={onFinish}> 
          Done
        </Button>
      </div>
    </div>
  );
};

export default RegisterStep3; 