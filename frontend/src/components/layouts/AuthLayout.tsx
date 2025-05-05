import React, { ReactNode } from 'react';
import walpressLogo from '../../assets/walpresslogo.png'; // Import logo

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 text-center p-6">
      <div className="w-full max-w-md space-y-4">
        <img src={walpressLogo} alt="Walpress Logo" className="w-[190px] max-h-fit mb-4 mx-auto" />
        <h1 className="text-2xl font-semibold text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 