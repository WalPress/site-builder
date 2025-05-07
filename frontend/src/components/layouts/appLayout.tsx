import { FC, useEffect, useState } from "react";
import { SplashScreen } from "../loader";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
      setTimeout(() => {
          setIsLoading(false);
      }, 500);
  }, []);

  if (isLoading) {
      return <SplashScreen />
  }
  return (
    <>
      {children}
    </>
  );
};

export default AppLayout;
