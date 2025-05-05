// src/pages/AuthPage.tsx (Refactored with nested card)
import React from 'react';
import AuthLayout from '../../components/layouts/AuthLayout'; // Import the new layout
import { useAccount } from '../../context/account'; // Re-add useAccount
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button'; // Import Button component

const AuthPage: React.FC = () => {
  // Re-add useAccount and button handlers
  const { setAuthToken } = useAccount();
  const navigate = useNavigate();
  const handleConnectLocal = () => navigate('/auth/local');
  const handleConnectSlush = () => setAuthToken('local'); // Assuming these still map to 'local' for now
  const handleConnectOther = () => setAuthToken('local');

  return (
    <AuthLayout
      title="Connect to get started"
      description="Walpress is a decentralized static site publishing platform that allows users to easily build, save, and deploy websites on Walrus"
    >
      {/* Logo is removed from here, now it's in AuthLayout */}
      
      {/* Original button section using Button component */}
      <div className="space-y-3 mt-6 w-full"> {/* Added w-full for buttons */} 
        {/* Button 1: Connect Locally */}
        <Button
          variant="custom"
          onClick={handleConnectLocal}
          className="w-full bg-black text-white hover:opacity-90 font-medium"
        >
          Connect locally
        </Button>

        {/* Button 2: Connect using Slush */}
        <Button
          variant="custom"
          onClick={handleConnectSlush}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium"
        >
          Connect using Slush
        </Button>

        {/* Button 3: Connect with other wallet */}
        <Button
          variant="custom"
          onClick={handleConnectOther}
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
        >
          Connect with other wallet
        </Button>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;