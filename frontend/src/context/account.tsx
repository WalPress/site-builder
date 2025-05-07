
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';

import { SplashScreen } from '../components/loader';
// import the backend app
import { CheckUserAuth } from '../../wailsjs/go/src/app';
import { sleep } from '../utils';


interface AccountContextProps {
  activeWallet: string;
  logout: () => void;
  setAuthToken: (wallet: string) => void;
}

const authRoutes = ["/auth", "/auth/local"];

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
        const response = await CheckUserAuth();
        console.log("response==>", response);
        if (response.appReady) {
          if (response.address) {
            setAuthToken(response.address);
            if (authRoutes.includes(pathname)) {
              navigate("/app");
            }
            setIsLoading(false);
            return;
          }
        } else {
          await sleep(3000);
          checkAuth();
        }
    } catch (error) {
        setError(error as Error); 
        if (!authRoutes.includes(pathname)) {
            navigate("/");
        }
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

  if (isLoading) {
    return (
      <SplashScreen />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div>{error.message}</div>
      </div>
    );
  }

  return (
    <AccountContext.Provider
      value={{
        activeWallet,
        setAuthToken,
        logout,
      }}
    > 
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
