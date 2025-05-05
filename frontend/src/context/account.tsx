
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';

import { IconSpinner } from '../components/loader';
// import the backend app
import { Start } from '../../wailsjs/go/src/app';


interface AccountContextProps {
  activeWallet: string;
  logout: () => void;
  setAuthToken: (wallet: string) => void;
}

const authRoutes = ["/", "/auth/local"];

const AccountContext = createContext<AccountContextProps | undefined>(undefined);

/**
 * Provider component for wallet state management
 */
export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial state setup
  const cookieToken = Cookies.get('address');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const [activeWallet, setActiveWallet] = useState<string>(cookieToken as string);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  const checkAuth = async () => {
      if (isAuthenticated) return;
    try {
        setIsLoading(true);
        const response = await Start();
        console.log("response==>", response);
        setAuthToken(response);
        if (authRoutes.includes(pathname)) {
            navigate("/dashboard");
        }
    } catch (error) {
        setError(error as Error); 
        if (!authRoutes.includes(pathname)) {
            navigate("/");
        }
    } finally {
        setIsLoading(false);
    }
}

  useEffect(() => {
    checkAuth();
  }, []);  

  const setAuthToken = (token: string) => {
    Cookies.set('address', token);
    setIsAuthenticated(true);
    setActiveWallet(token);
  }

  /**
   * Logout the user
   */
  const logout = () => {
    Cookies.remove('address');
    setIsAuthenticated(false);
    setActiveWallet('');
    navigate('/');
  };


  return (
    <AccountContext.Provider
      value={{
        activeWallet,
        setAuthToken,
        logout,
      }}
    > 
      {!isLoading && error && <div>{error.message}</div>}
      {isLoading && 
        <div className="flex justify-center items-center h-screen">
          <IconSpinner />
        </div>
      }
      {(!isLoading && !error) && children}
    </AccountContext.Provider>
  );
};

/**
 * Hook for accessing wallet context
 */
export const useAccount = (): AccountContextProps => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within a AccountProvider');
  }
  return context;
};
