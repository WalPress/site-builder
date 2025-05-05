import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link 
        to="/" 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        Go back to Home
      </Link>
    </>
  );
};

export default NotFoundPage; 