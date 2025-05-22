import React from 'react';
import Button from '../../Button'; // Assuming Button component is in ../Button.tsx
import { SiteStruct } from '../../../types/site';

interface LinkStep1Props {
  onContinue: () => void;
  onCancel: () => void;
  selectedNs: any;
  selectedSiteId: string | undefined;
  sites: SiteStruct[];
  selectSite: (siteId: string) => void;
}

const LinkStep1: React.FC<LinkStep1Props> = ({ onContinue, onCancel, sites, selectSite, selectedSiteId }) => {
  return (
    <div className="p-2 w-full max-w-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect your SUI NS to your website</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose a website to connect with your Sui NS name for a simpler web address.
      </p>

      <div className="space-y-3 mb-8">
        {sites.map((link) => (
          <div 
            key={link.id} 
            className={`p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${selectedSiteId === link.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            onClick={() => selectSite(link.id)}
          >
            <p className="font-medium text-gray-800 dark:text-gray-200">{link.name}</p>
            <p className="text-xs text-blue-500 dark:text-blue-400 break-all">{link.status}</p>
          </div>
        ))}
        {sites.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No links available. You can add them in your settings.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default LinkStep1; 