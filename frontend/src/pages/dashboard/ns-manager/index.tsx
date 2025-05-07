import React, { useState } from 'react';
import { FiSearch, FiTrash2, FiRefreshCw, FiLink } from 'react-icons/fi'; // Example icons

// Placeholder data for the table
const nsData = [
  {
    id: '1',
    alias: 'mycoolsite.sui',
    registrationDate: 'Dec 30, 2019 07:52',
    expiryPeriod: 'Expiring in 245 days',
  },
  {
    id: '2',
    alias: 'another-project.sui',
    registrationDate: 'Dec 30, 2019 07:52',
    expiryPeriod: 'Expiring in 221 days',
  },
  {
    id: '3',
    alias: 'test-domain-name.sui',
    registrationDate: 'Dec 30, 2019 07:52',
    expiryPeriod: 'Expiring in 145 days',
  },
];

const SuiNsManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Linked NS');

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
        <button className="bg-gradient-to-r from-green-500 to-blue-800 hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-200">
          Register new name server
        </button>
      </div>

      {/* Content Wrapper */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-row justify-between flex-1">
          {/* Toggle Tabs */}
          <div className="flex border-b border-gray-200 bg-background dark:border-gray-700 mb-6">
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
          </div>

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
        {activeTab === 'Linked NS' && (
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
                {nsData.map((item, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800 text-gray-500 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-2 font-medium  dark:text-white whitespace-nowrap">{item.alias}</td>
                    <td className="px-6 py-2">{item.registrationDate}</td>
                    <td className="px-6 py-2">{item.expiryPeriod}</td>
                    <td className="px-6 py-2 text-right">
                      <div className="flex justify-end items-center space-x-4">
                        <a href="#" className="font-medium text-green-600 dark:text-green-400 hover:underline flex items-center">
                          <FiRefreshCw className="w-3.5 h-3.5 mr-1"/> renew NS
                        </a>
                        <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                          <FiLink className="w-3.5 h-3.5 mr-1"/> Visit site
                        </a>
                        <button className="font-medium text-red-600 dark:text-red-400 hover:underline flex items-center">
                          <FiTrash2 className="w-3.5 h-3.5 mr-1"/> Unlink site
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         {activeTab === 'Unlinked NS' && (
           <div className="text-center py-10 text-gray-500 dark:text-gray-400">
             No unlinked NS found.
           </div>
         )}
      </div>
    </main>
  );
};

export default SuiNsManagerPage; 