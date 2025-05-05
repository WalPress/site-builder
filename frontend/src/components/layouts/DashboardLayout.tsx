import React from 'react';
import Sidebar from '../Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        {/* Main content area with margin for the fixed sidebar */}
        <div className="flex flex-col ml-64 px-16 py-6 w-full h-full">
          {/* Inlined TopBar */}
          <div className="h-[66px] border-b border-border px-6 bg-sidebar text-card-foreground rounded-lg" />
          <main className="p-6 flex flex-col bg-background h-full">
            {children} {/* Render the page content here */}
          </main>
        </div>
      </div>
  );
};

export default DashboardLayout; 