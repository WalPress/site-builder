import React from 'react';
import {
    FiHome, FiGrid, FiDatabase, FiSettings, FiLogOut
} from 'react-icons/fi'; // Example icons
import { useLocation, Link } from 'react-router-dom'; // Import useLocation and Link
import walpressLogo from "../assets/walpresslogo.png";
import { useAccount } from '../context/account';

// --- Sidebar Components ---

interface NavItemProps {
  label: string;
  icon?: React.ReactNode;
  href: string; // Changed isActive to href
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, href }) => {
  const location = useLocation(); // Get current location
  const isActive = location.pathname === href || location.pathname.startsWith(href); // Determine active state based on href
  

  const activeClasses = isActive
    ? 'text-green-400 bg-gray-700' // Highlight background too
    : 'text-gray-400 hover:text-white hover:bg-gray-700';

  return (
    // Use Link component for navigation
    <Link to={href} className={`flex items-center space-x-3 p-2 rounded-md text-sm font-medium transition-colors ${activeClasses}`}>
      {/* Wrap icon in span to apply class safely */} 
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>} 
      <span>{label}</span>
    </Link>
  );
};

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, children }) => {
  return (
    <div>
      <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <nav className="space-y-1">
        {children}
      </nav>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { logout } = useAccount();
  // Logout handler function
  const handleLogout = () => {
    logout();
  };

  return (
    // Prompt specifies bg-gray-800 text-white
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col space-y-6 fixed inset-y-0 left-0">
      <div className="text-white text-2xl font-bold text-center py-4 flex items-center justify-center space-x-2">
        <img src={walpressLogo} alt="Walpress Logo" className="w-[125px] h-[42px]" />
      </div>
      <div className="flex-1 space-y-6">
        <NavGroup title="Home">
          {/* Updated NavItems as per prompt */}
          <NavItem label="Get Started" icon={<FiHome />} href="/dashboard" />
        </NavGroup>
        <NavGroup title="Publish">
          {/* <NavItem label="Site Builder" icon={<FiEdit />} href="/site-builder" />  */}
          <NavItem label="My Sites" icon={<FiGrid />} href="/sites" />
          <NavItem label="NS Manager" icon={<FiDatabase />} href="/ns-manager" />
        </NavGroup>
        <NavGroup title="Others">
          <NavItem label="Settings" icon={<FiSettings />} href="/settings" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-2 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <span className="w-5 h-5 flex items-center justify-center"><FiLogOut /></span> 
            <span>Logout</span>
          </button>
        </NavGroup>
      </div>
      {/* Optional: Add user profile section here */} 
    </aside>
  );
};

export default Sidebar; 