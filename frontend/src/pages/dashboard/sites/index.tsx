import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SiteCard from '../../../components/SiteCard';
import site1Img from "../../../assets/sites/site-1.jpg";
import useSite from '../../../hooks/useSite';
import { Loader } from "../../../components/loader";
import CreateSiteForm from "../../../components/forms/CreateSiteForm";
import { TowerControlIcon } from "lucide-react";
dayjs.extend(relativeTime);

// Helper type for SiteCard status
type SiteStatus = 'Unlinked' | 'Draft' | 'Live';

// Map API status strings to SiteCard status prop
const mapApiStatusToSiteStatus = (apiStatus?: string): SiteStatus => {
  switch (apiStatus) {
    case "pending": // Assuming pending means draft
      return 'Draft';
    case "ready": // Assuming ready means live/deployed
      return 'Live';
    // Add other cases as needed based on actual API responses
    default: // Fallback for unknown or unlinked status
      return 'Unlinked';
  }
};

const MySitesPage: React.FC = () => {
  const { fetchSites, sites, isLoading, error, deleteSite, isDeleting } = useSite();
  const [isCreateSiteModalOpen, setIsCreateSiteModalOpen] = useState(false);
  
  useEffect(() => {
    fetchSites();
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Sites</h1>
          <p className="text-muted-foreground">
            This is where you'll find all your unpublished and deployed websites.
          </p>
        </div>
        <button 
          className="bg-gradient-to-r from-green-500 to-blue-900 hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          onClick={() => setIsCreateSiteModalOpen(true)}
        >
          Create a new site
        </button>
      </div>

      {/* Cards Grid */}
      <div className="relative flex flex-col overflow-y-auto h-[75vh]">
        {isLoading && <Loader />}
        {error && <div className="col-span-full">Error: {error as string}</div>}
        {sites.length === 0 && <div className="flex items-center justify-center w-full h-full">
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 items-center justify-center text-center w-full h-full">
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="mb-4 text-4xl"><TowerControlIcon size={48} /></div>
              <p className="text-muted-foreground mb-6">You don't have any sites yet. Create one to get started.</p>
              <button 
                className="bg-gradient-to-r from-green-500 to-gray-500 hover:from-green-600 hover:to-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                onClick={() => setIsCreateSiteModalOpen(true)}
              >
                Start Building
              </button>
            </div>
          </div>
        </div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              id={site.id}
              title={site.name.slice(0, 20) + (site.name.length > 20 ? "..." : "")}
              status={mapApiStatusToSiteStatus(site.status)}
              imageUrl={site1Img}
              lastEdited={dayjs(site.updatedAt).fromNow()}
              description={"Lorem ipsum dolor sit amet consectetur. Elit in eget risus fames massa maecenas malesuada."}
              blobId={site.blobId}
              actionText={site.status === "published" ? "Visit site" : "Deploy site"}
              onActionClick={() => alert(`Action clicked for ${site.name}`)}
              onDeleteClick={() => deleteSite(site.id)}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </div>
      {/* Render the Modal Form */}
      <CreateSiteForm 
        open={isCreateSiteModalOpen} 
        onClose={() => setIsCreateSiteModalOpen(false)}
      />  
    </>
  );
};

export default MySitesPage; 