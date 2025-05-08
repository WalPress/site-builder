import { LucideLoader } from 'lucide-react';
import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';

interface Option {
  value: string;
  label: string;
}

interface SettingSelectRowProps {
  label: string;
  helpText?: string;
  currentValue: string;
  setCurrentValue: (value: string) => void;
  options: Option[];
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const SettingSelectRow: React.FC<SettingSelectRowProps> = ({
  label,
  helpText,
  currentValue,
  setCurrentValue,
  options,
  className = '',
  disabled = false,
  isLoading = false,
}) => {
  return (
    <div className={`py-4 flex flex-col sm:items-start sm:gap-4 ${className}`}>
      <div className="flex justify-between items-center w-full">
        <label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="block text-sm font-bold text-gray-900 dark:text-white">{label}</label>
        <a href="#" className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center">
          <FiHelpCircle className="w-3.5 h-3.5 mr-1" /> {helpText}
        </a>
      </div>
      <div className="w-full h-16">
        <select
          id={label.toLowerCase().replace(/\s+/g, '-')}
          name={label.toLowerCase().replace(/\s+/g, '-')}
          className="border border-border text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none w-full h-full px-4 py-2"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <option value=""><LucideLoader className="w-4 h-4 animate-spin" /></option>
          ) : (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default SettingSelectRow; 