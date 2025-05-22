import React, { useState, useRef, useEffect } from 'react';
import { FiHelpCircle, FiEdit2, FiCheck } from 'react-icons/fi';
import useSetting from '../../../hooks/useSetting';
import { Loader } from '../../../components/loader';

// Reusable component for a setting input row
interface SettingInputRowProps {
  label: string;
  helpText: string;
  defaultValue: string;
  setCurrentValue: (value: string) => void;
}

const SettingInputRow: React.FC<SettingInputRowProps> = ({ label, helpText, defaultValue, setCurrentValue }) => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to focus input when editing starts
  useEffect(() => {
    if (!isReadOnly) {
      inputRef.current?.focus();
      inputRef.current?.select(); // Select text for easy replacement
    }
  }, [isReadOnly]);

  const handleButtonClick = () => {
    if (isReadOnly) {
      // Switching to edit mode
      setIsReadOnly(false);
    } else {
      // Switching back to read-only mode (acting as Save)
      setIsReadOnly(true);
      // Here you would typically call a save function if provided
      // e.g., onSave?.(currentValue);
      console.log("Value 'saved':", defaultValue); // Placeholder
    }
  };

  // Optional: Handle Enter/Escape keys in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleButtonClick(); // Treat Enter as Save
    } else if (e.key === 'Escape') {
      setCurrentValue(defaultValue); // Revert changes
      setIsReadOnly(true);         // Exit edit mode
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-gray-900 dark:text-white">{label}</label>
        <a href="#" className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center">
          <FiHelpCircle className="w-3.5 h-3.5 mr-1" /> {helpText}
        </a>
      </div>
      <div className={`flex justify-between items-center border rounded-md px-4 py-2 bg-transparent dark:bg-gray-700 ${!isReadOnly ? 'border-blue-500' : 'border-border'}`}>
        <input
          ref={inputRef}
          type="text"
          value={defaultValue}
          readOnly={isReadOnly}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none w-full ${isReadOnly ? '' : 'cursor-text'}`}
        />
        <button
          onClick={handleButtonClick}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline ml-4 flex items-center shrink-0"
        >
          {isReadOnly ? (
            <>
              <FiEdit2 className="w-3.5 h-3.5 mr-1" /> Edit
            </>
          ) : (
            <>
              <FiCheck className="w-3.5 h-3.5 mr-1" /> Save
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { settings, setSetting, getSettings, loading } = useSetting();

  useEffect(() => {
    getSettings();
  }, []);
  console.log("settings-page", settings);
  if (loading) {
    return <div><Loader size={28} /></div>
  }

  return (
    <main className="p-6 flex flex-col flex-1 bg-background">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Lorem ipsum dolor sit amet consectetur. Mattis elementum pretium libero
        </p>
      </div>

      {/* Settings Form Area - Limit width */}
      <div className="max-w-lg space-y-6">
        <SettingInputRow 
          label="Set maximum gas fee spend"
          helpText="What is a gas fee?"
          defaultValue={settings?.gas || "0.001"}
          setCurrentValue={(value) => {
            setSetting({
              gas: value,
            });
          }}

        />
        {/* <SettingSelectRow 
          label="Set RPC Endpoint"
          helpText="What is RPC?"
          currentValue={currentNetwork}
          setCurrentValue={switchNetwork}
          options={networks}
          disabled={isSwitching}
        /> */}

        {/* Submit Button */}
        {/* <div className="pt-4">
          <Button 
            variant="primary"
            onClick={() => {
              setSetting({
                gas: currentGas,
              });
            }}
          >
            Update
          </Button>
        </div> */}
      </div>
    </main>
  );
};

export default SettingsPage; 