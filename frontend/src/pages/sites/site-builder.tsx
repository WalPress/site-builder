import React from 'react';

const SiteBuilderStartPage: React.FC = () => {
  return (
    // Full-screen container with background and centering
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] dark:bg-gray-900 p-4">
      {/* Header (Positioned at the top, maybe outside the centered card if needed, or adjust styling) 
          - Prompt is slightly ambiguous if header is inside or outside the main card. 
          - Assuming it's meant to be above the card content, but still centered overall.
          - For simplicity, putting inside the card for now. Can be moved outside if needed.
      */}
      {/* Centered Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-16 max-w-4xl w-full text-center">
        {/* Header Section (Inside Card) */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Page Title Goes Here
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet consectetur. Mattis elementum pretium libero
          </p>
        </div>
        {/* Center Card Content */}
        <div className="flex flex-col items-center">
          {/* Top Icon */}
          <div className="mb-4 text-5xl"> {/* Increased icon size */}
            🏗️
          </div>

          {/* Title */}
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Get started building
          </h2>

          {/* Subtext */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Lorem ipsum dolor sit amet consectetur. Mattis elementum pretium libero interdum sodales
          </p>

          {/* CTA Button */}
          <button className="bg-gradient-to-r from-green-500 to-gray-700 hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition duration-200">
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteBuilderStartPage; 