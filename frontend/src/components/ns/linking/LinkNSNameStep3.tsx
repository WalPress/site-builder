import React from 'react';
import Button from '../../Button'; // Assuming Button is in ../components
import { Copy, CheckCircle } from 'lucide-react'; // Added CheckCircle for success indication

interface LinkNSNameStep3Props {
  onFinish: () => void;
  onBack?: () => void;
  objectId?: string;
  txId?: string;
}

const LinkNSNameStep3: React.FC<LinkNSNameStep3Props> = ({
  onFinish,
  onBack,
  objectId,
  txId,
}) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Link Submitted Successfully!</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Your request to link the name to your site has been submitted. It may take a few moments to reflect.
      </p>

      {objectId && (
        <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-8 text-sm text-left space-y-2">
          {txId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Transaction ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white break-all truncate w-32" title={txId}>{txId}</span>
                <Copy size={16} className="cursor-pointer hover:text-blue-500 shrink-0" onClick={() => navigator.clipboard.writeText(txId)} />
              </div>
            </div>
          )}
          {objectId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Object ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white break-all truncate w-32" title={objectId}>{objectId}</span>
                <Copy size={16} className="cursor-pointer hover:text-blue-500 shrink-0" onClick={() => navigator.clipboard.writeText(objectId)} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack}> 
            Back
          </Button>
        )}
        <Button variant="primary" onClick={onFinish}> 
          Done
        </Button>
      </div>
    </div>
  );
};

export default LinkNSNameStep3; 