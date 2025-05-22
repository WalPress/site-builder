

import React from 'react';
import { Outlet } from 'react-router-dom';


import Sidebar from '../../components/layouts/Sidebar';
import { AccountProvider } from '../../context/account';
import Topbar from '../../components/layouts/Topbar';
const DashboardLayout: React.FC = () => {
  return (
    <AccountProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        {/* Main content area with margin for the fixed sidebar */}
        <div className="flex flex-col ml-64 px-16 py-6 w-full h-full">
          <Topbar />
          <main className="p-6 flex flex-col bg-background h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </AccountProvider>
  );
};

export default DashboardLayout; 