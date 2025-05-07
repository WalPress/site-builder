/* -------------------------------------------------------------------------- */
/*                             External Dependency                            */
/* -------------------------------------------------------------------------- */
import React from 'react';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                             Internal Dependency                            */
/* -------------------------------------------------------------------------- */
import InstallLayout from '../components/layouts/InstallLayout';

const NotFoundPage: React.FC = () => {
  return (
    <InstallLayout>
      <h1 className="text-6xl font-bold text-primary mb-4">Application Error</h1>
      <p className="text-muted-foreground mb-6">
        Application is not running. Please check the logs for more information.
      </p>
      <Link 
        to="/dashboard" 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        Go to Dashboard
      </Link>
    </InstallLayout>
  );
};

export default NotFoundPage; 