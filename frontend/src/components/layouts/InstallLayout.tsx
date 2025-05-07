import { FC } from "react";
import backgroundImage from "../../assets/install_bg.png";

interface InstallLayoutProps {
  children: React.ReactNode;
}

const InstallLayout: FC<InstallLayoutProps> = ({ children }) => {

return (
<div className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
    {children}
</div>)

};

export default InstallLayout;
