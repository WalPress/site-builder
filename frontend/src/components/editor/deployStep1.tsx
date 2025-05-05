import React from 'react';
import Input from '../Input'; // Corrected path
import Button from '../Button'; // Corrected path
import { FiInfo } from 'react-icons/fi'; // Example icon import

interface DeploymentStep1Props {
  epochValue: string;
  onEpochChange: (value: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

const DeploymentStep1: React.FC<DeploymentStep1Props> = ({ 
  epochValue, 
  onEpochChange, 
  onContinue, 
  onCancel 
}) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg w-[500px]">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Deploy</h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="epochInput" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Set Epoach
          </label>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 group relative">
            <FiInfo className="mr-1" />
            <span>What is an epoach?</span>
            {/* Basic tooltip styling idea (can be improved) */}
            {/* <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Tooltip text about epoach goes here.
            </span> */}
          </div>
        </div>
        <Input
          id="epochInput"
          label="" // Label is handled above
          value={epochValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEpochChange(e.target.value)}
          placeholder="Enter epoach value"
          className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={onContinue}
          disabled={!epochValue.trim()} // Disable if epoch is empty
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default DeploymentStep1; 