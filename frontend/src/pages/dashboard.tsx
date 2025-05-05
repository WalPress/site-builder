import React, { useState } from 'react';
import CreateSiteForm from '../components/forms/CreateSiteForm';


const DashboardPage: React.FC = () => {
  // Added state for modal visibility
  const [isCreateSiteModalOpen, setIsCreateSiteModalOpen] = useState(false);

  // Handler to open the modal
  const handleOpenModal = () => {
    setIsCreateSiteModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsCreateSiteModalOpen(false);
  };
  

  return (
    // Return only the main content structure 
    <>
      {/* Inlined Main Content Area */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Lorem ipsum dolor sit amet consectetur. Mattis elementum pretium libero</p>
      </div>

      {/* Inlined StartBlock */}
      <div className="flex items-center justify-center w-full h-full">
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 items-center justify-center text-center w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="mb-4 text-4xl">🚧</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Get started building</h2>
            <p className="text-muted-foreground mb-6">Some descriptive text about starting the building process goes here.</p>
            <button 
              className="bg-gradient-to-r from-green-500 to-gray-500 hover:from-green-600 hover:to-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              onClick={handleOpenModal}
            >
              Start Building
            </button>
          </div>
        </div>
      </div>

      {/* Render the Modal Form */}
      <CreateSiteForm 
        open={isCreateSiteModalOpen} 
        onClose={handleCloseModal}
      />
    </>
  );
};

export default DashboardPage; 