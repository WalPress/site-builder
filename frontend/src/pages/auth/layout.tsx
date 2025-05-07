import React from 'react';
import { Outlet } from 'react-router-dom';
import { AccountProvider } from '../../context/account';

const AuthLayout: React.FC = () => {
  return (
    <AccountProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 text-center p-6">
          <Outlet />  
      </div>
    </AccountProvider>
  );
};

export default AuthLayout; 