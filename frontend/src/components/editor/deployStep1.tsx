import React from 'react';
// import Input from '../Input'; // Corrected path
import Button from '../Button'; // Corrected path
import { FiInfo } from 'react-icons/fi'; // Example icon import

interface DeploymentStep1Props {
  siteName: string;
  epochValue: string;
  onEpochChange: (value: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

const EPOCH_OPTIONS = [
  { value: "1", label: "2 weeks" },
  { value: "2", label: "1 month" },
  { value: "3", label: "2 month" },
  { value: "4", label: "3 month" },
  { value: "5", label: "4 month" },
  { value: "6", label: "5 month" },
  { value: "7", label: "6 month" },
  { value: "8", label: "7 month" },
  { value: "9", label: "8 month" },
  { value: "10", label: "9 month" },
  { value: "11", label: "10 month" },
  { value: "12", label: "11 month" },
  { value: "13", label: "12 month" },
  { value: "14", label: "13 month" },
  { value: "15", label: "14 month" },
  { value: "16", label: "15 month" },
  { value: "17", label: "16 month" },
  { value: "18", label: "17 month" },
  { value: "19", label: "18 month" },
  { value: "20", label: "19 month" },
  { value: "21", label: "20 month" },
  { value: "22", label: "21 month" },
  { value: "23", label: "22 month" },
  { value: "24", label: "23 month" },
  { value: "25", label: "24 month" },
];

const DeploymentStep1: React.FC<DeploymentStep1Props> = ({ 
  siteName,
  epochValue, 
  onEpochChange, 
  onContinue, 
  onCancel 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-[400px]">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Deploy {siteName} to the Walrus</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Lorem ipsum dolor sit amet consectetur. </p>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="epochInput" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Set Epoach / Duration
          </label>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 group relative text-[#1585E0]">
            <FiInfo className="mr-1" />
            <span>What is an epoach?</span>
            {/* Basic tooltip styling idea (can be improved) */}
            {/* <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap w-fit">
              Tooltip text about epoach goes here.
            </span> */}
          </div>
        </div>
        {/* Wrap select in a relative container for custom chevron positioning */}
        <div className="relative w-full">
          <select
            id="epochInput"
            value={epochValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onEpochChange(e.target.value)}
            className="appearance-none bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border rounded-md pl-3 pr-10 py-2" // Added appearance-none
          >
            {/* Add a prompt option if needed, e.g.:
            <option value="" disabled>Select epoch value</option>
            Make sure epochValue is initialized to "" if using a prompt like this.*/}
            {EPOCH_OPTIONS.map(optionValue => (
              <option key={optionValue.value} value={optionValue.value} selected={optionValue.value === epochValue}>
                {optionValue.value === "Current" ? "Current Epoch" : `${optionValue.value} (${optionValue.label})`}
              </option>
            ))}
          </select>
          {/* Custom Chevron Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-3 mt-8">
        <Button 
          variant="primary" 
          onClick={onContinue}
          disabled={!epochValue.trim()} // Disable if epoch is empty
        >
          Continue
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeploymentStep1; 