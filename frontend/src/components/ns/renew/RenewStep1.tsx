import React, { useState } from 'react';
import Button from '../../Button'; // Adjusted path


interface RenewStep1Props {
  onRenew: (duration: number) => void;
  onCancel: () => void;
}

const DURATION_OPTIONS = [
  { value: 1, label: "1 Year" },
  { value: 2, label: "2 Years" },
  { value: 3, label: "3 Years" },
  { value: 5, label: "5 Years" },
];

const RenewStep1: React.FC<RenewStep1Props> = ({
  onRenew,
  onCancel,
}) => {
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value); // Default to 1 year

  const handleRenewClick = () => {
    onRenew(duration);
  };

  return (
    <div className="p-2 w-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Renew Sui NS Identity</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Search for the availability of your preferred Sui NS identity.
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Choose duration
          </label>
          <div className="relative w-full">
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="appearance-none bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border rounded-md pl-3 pr-10 py-2.5"
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>      </div>

      <div className="flex justify-start gap-3">
        <Button variant="primary" onClick={handleRenewClick}>
          Continue
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default RenewStep1; 