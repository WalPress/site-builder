import React, { useEffect, useState } from 'react';
import { FiSearch, FiRefreshCw, FiLink } from 'react-icons/fi'; // Example icons
import useNsNames from '../../../hooks/useNsNames';
import { Loader } from '../../../components/loader';
import LinkNSNameModal from '../../../components/ns/linking/LinkNSNameModal';
import RegisterNSModal from '../../../components/ns/register/RegisterNSModal';
import RenewModal from '../../../components/ns/renew/RenewModal'; 

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';

// Helper function to format timestamp (in ms) to a date string (MM/DD/YYYY)
const formatTimestampToDate = (timestampMs: number | string): string => {
  // Ensure the timestamp is a number
  const numericTimestamp = typeof timestampMs === 'string' ? parseInt(timestampMs, 10) : timestampMs;

  // Check if the conversion resulted in a valid number
  if (isNaN(numericTimestamp)) {
    return 'Invalid Date'; // Or throw an error, or return a specific placeholder
  }

  const date = new Date(numericTimestamp);

  // Format to MM/DD/YYYY using toLocaleDateString options for better control
  return date.toLocaleDateString("en-US", {
    year: 'numeric',    // "2023"
    month: '2-digit',  // "03" for March
    day: '2-digit',    // "15"
  });
};

// Function to get the date 1 year before the given expiry timestamp
const GetRegistrationDate = (timestampMs: number | string): string => {
  const numericTimestamp = typeof timestampMs === 'string' ? parseInt(timestampMs, 10) : timestampMs;

  if (isNaN(numericTimestamp)) {
    return 'Invalid Date'; // Handle invalid input
  }

  const date = new Date(numericTimestamp);
  
  // Subtract 1 year from the date
  date.setFullYear(date.getFullYear() - 1);

  // Format to MM/DD/YYYY
  return date.toLocaleDateString("en-US", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const getLink = (link: string) => {
  return link.split(".")[0] + ".wal.app";
}

const SuiNsManagerPage: React.FC = () => {
  const { nsNames, isLoading, getNsNames } = useNsNames();
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [isRegisteringModalOpen, setIsRegisteringModalOpen] = useState(false);
  const [isRenewingModalOpen, setIsRenewingModalOpen] = useState(false);

  const [selectedNs, setSelectedNs] = useState<any>(null);

  useEffect(() => {
    getNsNames();
  }, []);

  const handleOpenLinkingSiteModal = (ns: any) => {
    setSelectedNs(ns);
    setIsLinkingModalOpen(true);
  }

  const handleOpenRenewModal = (ns: any) => {
    setSelectedNs(ns);
    setIsRenewingModalOpen(true);
  }
  
  return (
    <main className="p-6 flex flex-col flex-1 bg-background">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">SUI NS Manager</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your Sui NS ID conveniently from this page.
          </p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-blue-800 hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-200" onClick={() => setIsRegisteringModalOpen(true)}>
          Register new name server
        </button>
      </div>

      {/* Content Wrapper */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-[60vh]">
        <div className="flex flex-row justify-between flex-1">
          {/* Toggle Tabs */}
          {/* <div className="flex border-b border-gray-200 bg-background dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('Linked NS')}
              className={`py-2 px-4 text-sm font-medium transition-colors 
                ${activeTab === 'Linked NS' 
                  ? 'border-b-2 border-sidebar bg-sidebar text-white dark:text-blue-400 dark:border-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
              `}
            >
              Linked NS
            </button>
            <button
              onClick={() => setActiveTab('Unlinked NS')}
              className={`py-2 px-4 text-sm font-medium transition-colors 
                ${activeTab === 'Unlinked NS' 
                  ? 'border-b-2 border-sidebar bg-sidebar text-white dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
              `}
            >
              Unlinked NS
            </button>
          </div> */}

          {/* Search Bar */}
          <div className="flex justify-end items-center mb-4">
            <div className="relative mr-2">
              <input 
                type="text" 
                placeholder="Search by SuiNS name" 
                className="pl-3 pr-10 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
              Search NS
            </button>
          </div>
        </div>
        {/* Table */}
        {isLoading && <Loader />}
        {/* {!isLoading && activeTab === 'Linked NS' && ( */}
        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full mt-4 text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="text-xs text-gray-900 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">NS Alias</th>
                  <th scope="col" className="px-6 py-3">Registration date</th>
                  <th scope="col" className="px-6 py-3">Expiry period</th>
                  <th scope="col" className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nsNames.map((item, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800 text-gray-500 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-2 font-medium  dark:text-white whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-2">{GetRegistrationDate(item.expiry)}</td>
                    <td className="px-6 py-2">{formatTimestampToDate(item.expiry)}</td>
                    <td className="px-6 py-2 text-right">
                      <div className="flex justify-end items-center space-x-4">
                        <span className="font-medium text-green-600 dark:text-green-400 hover:underline flex items-center" onClick={() => handleOpenRenewModal(item)}>
                          <FiRefreshCw className="w-3.5 h-3.5 mr-1"/> Renew NS
                        </span>
                        <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center" onClick={() => BrowserOpenURL(getLink(item.link))}>
                          <FiLink className="w-3.5 h-3.5 mr-1"/> Visit site
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400 hover:underline flex items-center cursor-pointer" onClick={() => handleOpenLinkingSiteModal(item)}>
                          <FiLink className="w-3.5 h-3.5 mr-1"/> Link Site
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {nsNames.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No NS Record found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
         {/* {!isLoading && activeTab === 'Unlinked NS' && (
           <div className="text-center py-10 text-gray-500 dark:text-gray-400">
             No unlinked NS found.
           </div>
         )} */}
      </div>
      <LinkNSNameModal
        isOpen={isLinkingModalOpen}
        onClose={() => setIsLinkingModalOpen(false)}
        selectedNs={selectedNs}
      />
      <RegisterNSModal
        isOpen={isRegisteringModalOpen}
        onClose={() => setIsRegisteringModalOpen(false)}
      />
      <RenewModal
        isOpen={isRenewingModalOpen}
        onClose={() => setIsRenewingModalOpen(false)}
        selectedNs={selectedNs}
      />
    </main>
  );
};

export default SuiNsManagerPage; 